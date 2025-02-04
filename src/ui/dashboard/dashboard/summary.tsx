import {
  fetch_TopResults,
  fetch_RecentResults1,
  fetch_RecentResultsAverages
} from '@/src/lib/tables/tableSpecific/graphdata'
import { StackedBarChart } from '@/src/ui/dashboard/dashboard/stackedbarchart'
import {
  structure_UsershistoryTopResults,
  structure_UsershistoryRecentResults
} from '@/src/lib/tables/structures'
//
//  Graph Interfaces
//
interface Datasets {
  label: string
  data: number[]
  backgroundColor?: string
}
interface GraphStructure {
  labels: string[]
  datasets: Datasets[]
}
//
//  Graph variables
//
const TopResults_count_min = 2
const TopResults_count_max = 10
const TopResults_usersReturned = 6
const TopResults_limitMonths = 18
const RecentResults_usersReturned = 7
const RecentResults_usersAverage = 10
//--------------------------------------------------------------------------------
export default async function SummaryGraphs() {
  //
  //  Fetch the data
  //
  const [dataTop, dataRecent]: [
    structure_UsershistoryTopResults[],
    structure_UsershistoryRecentResults[]
  ] = await Promise.all([
    fetch_TopResults({
      TopResults_count_min: TopResults_count_min,
      TopResults_count_max: TopResults_count_max,
      TopResults_usersReturned: TopResults_usersReturned,
      TopResults_limitMonths: TopResults_limitMonths
    }),
    fetch_RecentResults1({
      RecentResults_usersReturned: RecentResults_usersReturned
    })
  ])
  //
  //  Extract the user IDs and get the data for the last 5 results for each user
  //
  const userIds: number[] = dataRecent.map(item => item.hs_uid)
  const dataForAverages: structure_UsershistoryRecentResults[] = await fetch_RecentResultsAverages({
    userIds,
    RecentResults_usersAverage
  })
  //
  // TOP graph
  //
  const TopGraphData: GraphStructure = topGraph(dataTop)
  //
  // Recent graph
  //
  const RecentGraphData: GraphStructure = recentGraph(dataRecent, dataForAverages)
  //--------------------------------------------------------------------------------
  //  Generate the data for the TOP results graph
  //--------------------------------------------------------------------------------
  function topGraph(dataTop: { us_name: string; percentage: number }[]): GraphStructure {
    //
    //  Derive the names and percentages from the data
    //
    const names: string[] = dataTop.map(item => item.us_name)
    const percentages: number[] = dataTop.map(item => item.percentage)
    //
    //  Datasets
    //
    const GraphData: GraphStructure = {
      labels: names,
      datasets: [
        {
          label: 'Percentage',
          data: percentages,
          backgroundColor: 'rgba(255, 165, 0, 0.6)'
        }
      ]
    }
    return GraphData
  }
  //--------------------------------------------------------------------------------
  //  Generate the data for the RECENT results graph
  //--------------------------------------------------------------------------------
  function recentGraph(
    dataRecent: structure_UsershistoryRecentResults[],
    dataForAverages: structure_UsershistoryRecentResults[]
  ): GraphStructure {
    //
    //  Derive the names
    //
    const names: string[] = dataRecent.map(item => item.us_name)
    const individualPercentages: number[] = dataRecent.map(item => item.hs_correctpercent)
    //
    //  Derive percentages from the data
    //
    const averagePercentages: number[] = calculatePercentages(dataForAverages, userIds)
    //
    //  Datasets
    //
    const GraphData: GraphStructure = {
      labels: names,
      datasets: [
        {
          label: 'Latest %',
          data: individualPercentages
        },
        {
          label: `${RecentResults_usersAverage}-Average %`,
          data: averagePercentages
        }
      ]
    }
    return GraphData
  }
  //--------------------------------------------------------------------------------
  //  Calculate the average and individual percentages for each user
  //--------------------------------------------------------------------------------
  function calculatePercentages(
    dataForAverages: structure_UsershistoryRecentResults[],
    userIds: number[]
  ): number[] {
    //
    //  Calculate average percentages for each user
    //
    const averagePercentages: number[] = [0, 0, 0, 0, 0]
    //
    //  Process each record
    //
    let currentUid = 0
    let sumTotalPoints = 0
    let sumMaxPoints = 0
    for (const record of dataForAverages) {
      const { hs_uid, hs_totalpoints, hs_maxpoints } = record
      //
      //  CHANGE of user ID          OR
      //  LAST record in the data
      //
      if (currentUid !== hs_uid || dataForAverages.indexOf(record) === dataForAverages.length - 1) {
        //
        //  If not first record
        //
        if (currentUid !== 0) {
          //
          //  Update the average percentage for the user
          //
          const averagePercentage = Math.round((100 * sumTotalPoints) / sumMaxPoints)
          const index = userIds.indexOf(currentUid)
          averagePercentages[index] = averagePercentage
          //
          //  Reset the sum and count for the next user
          //
          sumTotalPoints = 0
          sumMaxPoints = 0
        }
        //
        //  Current user
        //
        currentUid = hs_uid
      }
      //
      //  Increment the sum and count
      //
      sumTotalPoints += hs_totalpoints
      sumMaxPoints += hs_maxpoints
    }
    //
    //  End of data
    //
    const averagePercentage = Math.round((100 * sumTotalPoints) / sumMaxPoints)
    const index = userIds.indexOf(currentUid)
    averagePercentages[index] = averagePercentage
    //
    //  Return the average percentages
    //
    return averagePercentages
  }
  //--------------------------------------------------------------------------------
  return (
    <div className='h-screen flex flex-col gap-4'>
      {/* --------------------------------------------------------------- */}
      {/* Top Results Section - TopGraphData  */}
      {/* --------------------------------------------------------------- */}
      <div className='flex-none h-[40vh]'>
        <div className='w-full max-w-2xl bg-gray-100 h-full p-3 flex flex-col justify-between'>
          <h2 className='text-lg'>Top Results</h2>
          <div className='flex-grow overflow-hidden'>
            <StackedBarChart StackedGraphData={TopGraphData} />
          </div>
        </div>
      </div>
      {/* --------------------------------------------------------------- */}
      {/* Recent Results Section - RecentGraphData   */}
      {/* --------------------------------------------------------------- */}
      <div className='flex-none h-[40vh]'>
        <div className='w-full max-w-2xl bg-gray-100 h-full p-3 flex flex-col justify-between'>
          <h2 className='text-lg'>Recent Results</h2>
          <div className='flex-grow overflow-hidden'>
            <StackedBarChart StackedGraphData={RecentGraphData} />
          </div>
        </div>
      </div>
      {/* --------------------------------------------------------------- */}
    </div>
  )
}
