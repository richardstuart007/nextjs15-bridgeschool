import {
  fetchTopResultsData,
  fetchRecentResultsData1,
  fetchRecentResultsData5
} from '@/src/lib/tables/tableSpecific/usershistory'
import { StackedBarChart } from '@/src/ui/dashboard/dashboard/summary/stackedbarchart'
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
//--------------------------------------------------------------------------------
export default async function SummaryGraphs() {
  //
  //  Fetch the data
  //
  const [dataTop, dataRecent1]: [
    structure_UsershistoryTopResults[],
    structure_UsershistoryRecentResults[]
  ] = await Promise.all([fetchTopResultsData(), fetchRecentResultsData1()])
  //
  //  Extract the user IDs and get the data for the last 5 results for each user
  //
  const userIds: number[] = dataRecent1.map(item => item.r_uid)
  const dataRecent5: structure_UsershistoryRecentResults[] = await fetchRecentResultsData5(userIds)
  //
  // TOP graph
  //
  const TopGraphData: GraphStructure = topGraph(dataTop)
  //
  // Recent graph
  //
  const RecentGraphData: GraphStructure = recentGraph(dataRecent1, dataRecent5)
  //--------------------------------------------------------------------------------
  //  Generate the data for the TOP results graph
  //--------------------------------------------------------------------------------
  function topGraph(dataTop: { u_name: string; percentage: number }[]): GraphStructure {
    //
    //  Derive the names and percentages from the data
    //
    const names: string[] = dataTop.map(item => item.u_name)
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
    dataRecent1: structure_UsershistoryRecentResults[],
    dataRecent5: structure_UsershistoryRecentResults[]
  ): GraphStructure {
    //
    //  Derive the names
    //
    const names: string[] = dataRecent1.map(item => item.u_name)
    const individualPercentages: number[] = dataRecent1.map(item => item.r_correctpercent)
    //
    //  Derive percentages from the data
    //
    // const userIds: number[] = dataRecent1.map(item => item.r_uid)
    const averagePercentages: number[] = calculatePercentages(dataRecent5, userIds)
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
          label: '5-Average %',
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
    dataRecent5: structure_UsershistoryRecentResults[],
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
    for (const record of dataRecent5) {
      const { r_uid, r_totalpoints, r_maxpoints } = record
      //
      //  CHANGE of user ID          OR
      //  LAST record in the data
      //
      if (currentUid !== r_uid || dataRecent5.indexOf(record) === dataRecent5.length - 1) {
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
        currentUid = r_uid
      }
      //
      //  Increment the sum and count
      //
      sumTotalPoints += r_totalpoints
      sumMaxPoints += r_maxpoints
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
          <h2 className='text-lg'>Top Results</h2>
          <div className='flex-grow overflow-hidden'>
            <StackedBarChart StackedGraphData={RecentGraphData} />
          </div>
        </div>
      </div>
      {/* --------------------------------------------------------------- */}
    </div>
  )
}
