import { Top_fetch } from '@/src/ui/dashboard/graph/Top/Top_fetch'
import { Recent_fetch_1 } from '@/src/ui/dashboard/graph/Recent/Recent_fetch_1'
import { Recent_fetch_Averages } from '@/src/ui/dashboard/graph/Recent/Recent_fetch_Averages'
import { User_fetch } from '@/src/ui/dashboard/graph/User/User_fetch'
import { User_fetch_Average } from '@/src/ui/dashboard/graph/User/User_fetch_Average'
import {
  structure_UsershistoryTopResults,
  structure_UsershistoryRecentResults
} from '@/src/lib/tables/structures'
import { table_Usershistory } from '@/src/lib/tables/definitions'
import {
  Recent_usersAverage_Default,
  Recent_usersReturned_Default
} from '@/src/ui/dashboard/graph/Recent/Recent_constants'
import {
  User_limitMonths_Average_Default,
  Current_limitCount
} from '@/src/ui/dashboard/graph/User/User_constants'
import { Top_limitMonths_Default } from '@/src/ui/dashboard/graph/Top/Top_constants'
import { getAuthSession } from '@/src/lib/dataAuth/getAuthSession'
import { table_fetch, table_fetch_Props } from '@/src/lib/tables/tableGeneric/table_fetch'
import { convertUTCtoLocal } from '@/src/lib/convertUTCtoLocal'
import { GraphSummaryWrapper } from './graph_summaryWrapper'
import { GraphStructure } from './graph_types'

// Empty graph structure for when no data is available
const emptyGraphStructure: GraphStructure = {
  labels: ['No Data'],
  datasets: [
    {
      label: 'No Data',
      data: [0],
      keys: [0],
      keyType: 'none',
      backgroundColor: 'rgba(200, 200, 200, 0.6)'
    }
  ]
}

//--------------------------------------------------------------------------------
export default async function Graph_Summary() {
  const functionName = 'Graph_Summary'

  //
  //  Auth Session
  //
  const authSession = await getAuthSession()
  const user = authSession?.user
  const au_usid = Number(user?.au_usid ?? 0)

  //
  //  Get full user record with graph preferences
  //
  let userRecord = null
  let countryCode = 'ZZ'

  if (au_usid > 0) {
    const rows = await table_fetch({
      caller: functionName,
      table: 'tus_users',
      whereColumnValuePairs: [{ column: 'us_usid', value: au_usid }]
    } as table_fetch_Props)
    userRecord = rows?.[0]
    countryCode = userRecord?.us_fedcountry ?? 'ZZ'
  }

  // Get graph preferences from user record with defaults
  const userMonths = userRecord?.us_graph_user_months ?? User_limitMonths_Average_Default
  const topMonths = userRecord?.us_graph_top_months ?? Top_limitMonths_Default
  const recentUsers = userRecord?.us_graph_recent_users ?? Recent_usersReturned_Default
  const recentAvg = userRecord?.us_graph_recent_avg ?? Recent_usersAverage_Default

  //
  //  Fetch the data with safe defaults using user preferences
  //
  let dataTop: structure_UsershistoryTopResults[] = []
  let dataRecent: structure_UsershistoryRecentResults[] = []
  let dataUserResults: table_Usershistory[] = []
  let dataUserAverage: number = 0

  try {
    const results = await Promise.allSettled([
      Top_fetch({
        caller: functionName,
        TopResults_limitMonths: topMonths // Use from database
      }),
      Recent_fetch_1({
        caller: functionName,
        uq_graph_recent_usersReturned: recentUsers // Use from database
      }),
      User_fetch({
        caller: functionName,
        userId: au_usid,
        months: userMonths, // Use from database
        count: Current_limitCount
      }),
      User_fetch_Average({
        caller: functionName,
        userId: au_usid,
        User_limitMonths_Average: userMonths // Use from database
      })
    ])

    // Safely extract data from results
    if (results[0].status === 'fulfilled') dataTop = results[0].value || []
    if (results[1].status === 'fulfilled') dataRecent = results[1].value || []
    if (results[2].status === 'fulfilled') dataUserResults = results[2].value || []
    if (results[3].status === 'fulfilled') dataUserAverage = results[3].value || 0
  } catch (error) {
    console.error('Error fetching graph data:', error)
  }

  //
  //  Ensure arrays exist even if empty
  //
  const safeDataTop = dataTop || []
  const safeDataRecent = dataRecent || []
  const safeDataUserResults = dataUserResults || []
  const safeDataUserAverage = dataUserAverage || 0

  //
  //  Extract the user IDs and get the data for the average results for each user
  //  Only proceed if we have recent data
  //
  let dataForAverages: structure_UsershistoryRecentResults[] = []
  if (safeDataRecent.length > 0) {
    const userIds: number[] = safeDataRecent.map(item => item?.hs_usid).filter(Boolean)
    if (userIds.length > 0) {
      try {
        dataForAverages =
          (await Recent_fetch_Averages({
            userIds: userIds,
            caller: functionName,
            uq_graph_recent_usersAverage: recentAvg // Use from database
          })) || []
      } catch (error) {
        console.error('Error fetching averages:', error)
      }
    }
  }

  const safeDataForAverages = dataForAverages || []

  //
  // TOP graph - with null check
  //
  const TopGraphData: GraphStructure =
    safeDataTop.length > 0 ? topGraph(safeDataTop) : emptyGraphStructure

  //
  // Line graph for User Results - with null check
  //
  const sortedDataUserResults = [...safeDataUserResults].sort(
    (a, b) => (a?.hs_hsid || 0) - (b?.hs_hsid || 0)
  )
  const UserLineGraph: GraphStructure =
    sortedDataUserResults.length > 0 ? lineGraph(sortedDataUserResults) : emptyGraphStructure

  //
  // Recent graph - with null check
  //
  const userIdsForRecent = safeDataRecent.map(item => item?.hs_usid).filter(Boolean)
  const RecentGraphData: GraphStructure =
    safeDataRecent.length > 0 && userIdsForRecent.length > 0
      ? recentGraph(safeDataRecent, safeDataForAverages, userIdsForRecent, countryCode)
      : emptyGraphStructure

  //--------------------------------------------------------------------------------
  //  Generate the data for the TOP results graph
  //--------------------------------------------------------------------------------
  function topGraph(
    dataTop: { hs_usid: number; us_name: string; percentage: number }[]
  ): GraphStructure {
    //
    //  Derive the names and percentages from the data
    //
    const names: string[] = dataTop.map(item => item?.us_name || 'Unknown').filter(Boolean)
    const data: number[] = dataTop.map(item => item?.percentage || 0)
    const keys: number[] = dataTop.map(item => item?.hs_usid || 0)

    // If still no data after mapping, return empty
    if (names.length === 0) {
      return emptyGraphStructure
    }

    //
    //  Datasets
    //
    const GraphData: GraphStructure = {
      labels: names,
      datasets: [
        {
          label: `Top %`,
          data: data,
          keys: keys,
          keyType: 'usid',
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
    dataUserResults: { hs_hsid: number; hs_datetime: Date; hs_correctpercent: number }[]
  ): GraphStructure {
    //
    //  Derive the names and percentages from the data
    //
    const labels: string[] = dataUserResults
      .map(item => {
        if (!item?.hs_datetime) return 'Unknown'
        return convertUTCtoLocal({
          datetimeUTC: item.hs_datetime,
          to_localcountryCode: countryCode,
          to_dateFormat: 'MMMdd'
        })
      })
      .filter(Boolean)

    const data: number[] = dataUserResults.map(item => item?.hs_correctpercent || 0)
    const keys: number[] = dataUserResults.map(item => item?.hs_hsid || 0)

    // If no data, return empty
    if (labels.length === 0) {
      return emptyGraphStructure
    }

    //
    //  Datasets
    //
    const GraphData: GraphStructure = {
      labels: labels,
      datasets: [
        {
          label: `Score %`,
          data: data,
          keys: keys,
          keyType: 'hsid',
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          tension: 0.4
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
    dataForAverages: structure_UsershistoryRecentResults[],
    userIds: number[],
    countryCode: string
  ): GraphStructure {
    //
    // Create a map of user data for easy lookup
    //
    const recentMap = new Map<number, structure_UsershistoryRecentResults>()
    dataRecent.forEach(item => {
      if (item?.hs_usid) {
        recentMap.set(item.hs_usid, item)
      }
    })

    const averagesMap = new Map<number, structure_UsershistoryRecentResults>()
    dataForAverages.forEach(item => {
      if (item?.hs_usid) {
        averagesMap.set(item.hs_usid, item)
      }
    })

    //
    // Build arrays in the same order as userIds
    //
    const names: string[] = []
    const data_individualPercentages: number[] = []
    const tooltipDates: string[] = []

    userIds.forEach(userId => {
      const recentItem = recentMap.get(userId)
      if (recentItem) {
        names.push(recentItem.us_name || 'Unknown')
        data_individualPercentages.push(recentItem.hs_correctpercent || 0)

        // Format date for tooltip
        if (recentItem?.hs_datetime) {
          try {
            const date = convertUTCtoLocal({
              datetimeUTC: recentItem.hs_datetime,
              to_localcountryCode: countryCode,
              to_dateFormat: 'MMM dd, yyyy'
            })
            tooltipDates.push(date)
          } catch (error) {
            tooltipDates.push('Invalid date')
          }
        } else {
          tooltipDates.push('No date')
        }
      } else {
        // This user exists in userIds but not in dataRecent
        // This shouldn't happen, but handle it gracefully
        names.push('Unknown')
        data_individualPercentages.push(0)
        tooltipDates.push('No data')
      }
    })

    //
    // Calculate average percentages (already in userIds order)
    //
    const data_averagePercentages: number[] = calculatePercentages(dataForAverages, userIds)

    //
    //  Keys
    //
    const keys: number[] = [...userIds]

    // If no names, return empty
    if (names.length === 0 || names.every(name => name === 'Unknown')) {
      return emptyGraphStructure
    }

    //
    //  Datasets
    //
    const GraphData: GraphStructure = {
      labels: names,
      datasets: [
        {
          label: 'Latest %',
          data: data_individualPercentages,
          keys: keys,
          keyType: 'usid',
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          tooltipData: tooltipDates
        },
        {
          label: `${recentAvg}-Result Average %`,
          data: data_averagePercentages,
          keys: keys,
          keyType: 'usid',
          backgroundColor: 'rgba(255, 159, 64, 0.6)'
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
    //  Safety checks
    //
    if (!dataForAverages?.length || !userIds?.length) {
      return []
    }

    //
    //  Calculate average percentages for each user
    //
    const averagePercentages: number[] = new Array(userIds.length).fill(0)
    const userSumMap = new Map<number, { total: number; max: number }>()

    // Aggregate data by user
    for (const record of dataForAverages) {
      if (!record) continue
      const { hs_usid, hs_totalpoints, hs_maxpoints } = record
      if (!hs_usid) continue

      const current = userSumMap.get(hs_usid) || { total: 0, max: 0 }
      userSumMap.set(hs_usid, {
        total: current.total + (hs_totalpoints || 0),
        max: current.max + (hs_maxpoints || 0)
      })
    }

    // Calculate percentages
    for (const [userId, sums] of userSumMap.entries()) {
      const index = userIds.indexOf(userId)
      if (index !== -1 && sums.max > 0) {
        averagePercentages[index] = Math.round((100 * sums.total) / sums.max)
      }
    }

    return averagePercentages
  }

  //--------------------------------------------------------------------------------
  return (
    <div className='h-screen flex flex-col gap-4'>
      <GraphSummaryWrapper
        UserLineGraph={UserLineGraph}
        TopGraphData={TopGraphData}
        RecentGraphData={RecentGraphData}
        safeDataUserAverage={safeDataUserAverage}
        userMonths={userMonths}
        topMonths={topMonths}
        recentUsers={recentUsers}
        recentAvg={recentAvg}
      />
    </div>
  )
}
