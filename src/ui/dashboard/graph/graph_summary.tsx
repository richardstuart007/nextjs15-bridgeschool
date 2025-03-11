import {
  fetch_TopResults,
  fetch_RecentResults1,
  fetch_RecentResultsAverages,
  fetch_UserResults,
  fetch_UserAverage
} from '@/src/ui/dashboard/graph/graph_data'
import { MyBarChart, MyLineChart } from '@/src/ui/dashboard/graph/graph_charts'
import {
  structure_UsershistoryTopResults,
  structure_UsershistoryRecentResults
} from '@/src/lib/tables/structures'
import { table_Usershistory } from '@/src/lib/tables/definitions'
import {
  RecentResults_usersAverage,
  TopResults_limitMonths,
  CurrentUser_limitMonths_Average
} from '@/src/ui/dashboard/graph/graph_constants'
import { getAuthSession } from '@/src/lib/data-auth'
import { convertUTCtoLocal } from '@/src/lib/convertUTCtoLocal'
//
//  Graph Interfaces
//
interface Datasets {
  label: string
  data: number[]
  backgroundColor?: string
  borderColor?: string
  tension?: number
}
interface GraphStructure {
  labels: string[]
  datasets: Datasets[]
}
//--------------------------------------------------------------------------------
export default async function SummaryGraphs() {
  //
  //  Auth Session
  //
  const authSession = await getAuthSession()
  const user = authSession?.user
  const au_usid = Number(user.au_usid)
  //
  //  Fetch the data
  //
  const [dataTop, dataRecent, dataUserResults, dataUserAverage]: [
    structure_UsershistoryTopResults[],
    structure_UsershistoryRecentResults[],
    table_Usershistory[],
    number
  ] = await Promise.all([
    fetch_TopResults(),
    fetch_RecentResults1(),
    fetch_UserResults({ userId: au_usid }),
    fetch_UserAverage({ userId: au_usid })
  ])
  //
  //  Extract the user IDs and get the data for the last 5 results for each user
  //
  const userIds: number[] = dataRecent.map(item => item.hs_usid)
  const dataForAverages: structure_UsershistoryRecentResults[] = await fetch_RecentResultsAverages({
    userIds
  })
  //
  // TOP graph
  //
  const TopGraphData: GraphStructure = topGraph(dataTop)
  //
  // Line graph for Top Results
  //
  const sortedDataUserResults = dataUserResults.sort((a, b) => a.hs_hsid - b.hs_hsid)
  const UserLineGraph: GraphStructure = lineGraph(sortedDataUserResults)
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
          label: `Top % over ${TopResults_limitMonths} months`,
          data: percentages,
          backgroundColor: 'rgba(255, 165, 0, 0.6)'
        }
      ]
    }
    return GraphData
  }
  //--------------------------------------------------------------------------------
  //  Generate the data for the Users results graph
  //--------------------------------------------------------------------------------
  function lineGraph(
    dataUserResults: { hs_datetime: Date; hs_correctpercent: number }[]
  ): GraphStructure {
    //
    //  Derive the names and percentages from the data
    //
    const labels: string[] = dataUserResults.map(item => {
      return convertUTCtoLocal({
        datetimeUTC: item.hs_datetime,
        to_localcountryCode: 'NZ',
        to_dateFormat: 'MMMdd'
      })
    })
    const percentages: number[] = dataUserResults.map(item => item.hs_correctpercent)
    //
    //  Datasets
    //
    const GraphData: GraphStructure = {
      labels: labels,
      datasets: [
        {
          label: `Score % `,
          data: percentages,
          borderColor: 'rgba(75, 192, 192, 1)', // Line color
          backgroundColor: 'rgba(75, 192, 192, 0.6)', // Solid color for the legend box
          tension: 0.4 // Smooth curve
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
    const averagePercentages: number[] = []
    //
    //  Process each record
    //
    let currentUid = 0
    let sumTotalPoints = 0
    let sumMaxPoints = 0
    for (const record of dataForAverages) {
      const { hs_usid, hs_totalpoints, hs_maxpoints } = record
      //
      //  CHANGE of user ID          OR
      //  LAST record in the data
      //
      if (
        currentUid !== hs_usid ||
        dataForAverages.indexOf(record) === dataForAverages.length - 1
      ) {
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
    <div className='h-screen flex flex-col gap-4'>
      {/* --------------------------------------------------------------- */}
      {/* Top Results Section - UserLineGraph (Line Chart) */}
      {/* --------------------------------------------------------------- */}
      <div className='flex-none h-[30vh]'>
        <div className='w-full max-w-2xl bg-gray-100 h-full p-3 flex flex-col justify-between'>
          <h2 className='text-sm'>{`Your Results: ${CurrentUser_limitMonths_Average} month average ${dataUserAverage}`}</h2>
          <div className='flex-grow overflow-hidden'>
            <MyLineChart LineGraphData={UserLineGraph} />
          </div>
        </div>
      </div>
      {/* --------------------------------------------------------------- */}
      {/* Top Results Section - TopGraphData  */}
      {/* --------------------------------------------------------------- */}
      <div className='flex-none h-[30vh]'>
        <div className='w-full max-w-2xl bg-gray-100 h-full p-3 flex flex-col justify-between'>
          <h2 className='text-sm'>Top Results</h2>
          <div className='flex-grow overflow-hidden'>
            <MyBarChart StackedGraphData={TopGraphData} />
          </div>
        </div>
      </div>
      {/* --------------------------------------------------------------- */}
      {/* Recent Results Section - RecentGraphData   */}
      {/* --------------------------------------------------------------- */}
      <div className='flex-none h-[30vh]'>
        <div className='w-full max-w-2xl bg-gray-100 h-full p-3 flex flex-col justify-between'>
          <h2 className='text-sm'>Recent Results</h2>
          <div className='flex-grow overflow-hidden'>
            <MyBarChart StackedGraphData={RecentGraphData} />
          </div>
        </div>
      </div>
      {/* --------------------------------------------------------------- */}
    </div>
  )
}
