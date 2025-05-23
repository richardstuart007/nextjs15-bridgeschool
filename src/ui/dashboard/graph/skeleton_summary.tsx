import {
  fetch_TopResults,
  fetch_RecentResults1,
  fetch_RecentResultsAverages
} from '@/src/ui/dashboard/graph/skeleton_data'
import { MyBarChart } from '@/src/ui/dashboard/graph/graph_charts'
import { structure_UsershistoryRecentResults } from '@/src/lib/tables/structures'
//-----------------------------------------------------------------------------
//  Graph skeleton
//--------------------------------------------------------------------------------
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
export function SummarySkeleton() {
  //
  //  Fetch the data
  //
  const dataTop = fetch_TopResults()
  const dataRecent1 = fetch_RecentResults1()
  const dataRecent = fetch_RecentResultsAverages()
  //
  // TOP graph
  //
  const TopGraphData: GraphStructure = topGraph(dataTop)
  //
  // Recent graph
  //
  const RecentGraphData: GraphStructure = recentGraph(dataRecent1, dataRecent)
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
          backgroundColor: 'rgba(200, 200, 200, 0.6)'
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
    dataRecent: structure_UsershistoryRecentResults[]
  ): GraphStructure {
    //
    //  Derive the names
    //
    const names: string[] = dataRecent1.map(item => item.us_name)
    const individualPercentages: number[] = dataRecent1.map(item => item.hs_correctpercent)
    //
    //  Derive percentages from the data
    //
    const userIds: number[] = dataRecent1.map(item => item.hs_usid)
    const averagePercentages: number[] = calculatePercentages(dataRecent, userIds)
    //
    //  Datasets
    //
    const GraphData: GraphStructure = {
      labels: names,
      datasets: [
        {
          label: 'Latest %',
          data: individualPercentages,
          backgroundColor: 'rgba(220, 220, 220, 0.6)'
        },
        {
          label: '5-Average %',
          data: averagePercentages,
          backgroundColor: 'rgba(210, 210, 220, 0.6)'
        }
      ]
    }
    return GraphData
  }
  //--------------------------------------------------------------------------------
  //  Calculate the average and individual percentages for each user
  //--------------------------------------------------------------------------------
  function calculatePercentages(
    dataRecent: structure_UsershistoryRecentResults[],
    userIds: number[]
  ): number[] {
    //
    //  Calculate average percentages for each user
    //
    const averagePercentages: number[] = []
    //
    //  Process each record
    //
    let currentUid = 0
    let sumTotalPoints = 0
    let sumMaxPoints = 0
    for (const record of dataRecent) {
      const { hs_usid, hs_totalpoints, hs_maxpoints } = record
      //
      //  CHANGE of user ID          OR
      //  LAST record in the data
      //
      if (currentUid !== hs_usid || dataRecent.indexOf(record) === dataRecent.length - 1) {
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
        currentUid = hs_usid
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
    //
    //  Place in the array
    //
    averagePercentages[index] = averagePercentage
    //
    //  Return the average percentages
    //
    return averagePercentages
  }
  //--------------------------------------------------------------------------------
  return (
    <div className='h-screen flex flex-col gap-5 md:p-3'>
      {/* --------------------------------------------------------------- */}
      {/* Top Results Section */}
      {/* --------------------------------------------------------------- */}
      <div className='box-border' style={{ height: '40%' }}>
        <div className='w-full max-w-2xl bg-gray-100 h-full'>
          <h2 className='text-lg'>Top Results</h2>
          <MyBarChart StackedGraphData={TopGraphData} />
        </div>
      </div>
      {/* --------------------------------------------------------------- */}
      {/* Recent Results Section */}
      {/* --------------------------------------------------------------- */}
      <div className='box-border' style={{ height: '40%' }}>
        <div className='w-full max-w-2xl bg-gray-100 h-full'>
          <h2 className='text-lg'>Recent Results</h2>
          <MyBarChart StackedGraphData={RecentGraphData} />
        </div>
      </div>
    </div>
  )
}
