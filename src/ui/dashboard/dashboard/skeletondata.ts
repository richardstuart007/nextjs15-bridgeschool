import {
  structure_UsershistoryTopResults,
  structure_UsershistoryRecentResults
} from '@/src/lib/tables/structures'
//---------------------------------------------------------------------
//  Top results data
//---------------------------------------------------------------------
export function fetch_TopResults() {
  const structure_UsershistoryTopResults: structure_UsershistoryTopResults[] = [
    {
      hs_uid: 1,
      us_name: 'Alice Johnson',
      record_count: 120,
      total_points: 950,
      total_maxpoints: 1000,
      percentage: 95.0
    },
    {
      hs_uid: 2,
      us_name: 'Bob Smith',
      record_count: 110,
      total_points: 880,
      total_maxpoints: 1000,
      percentage: 88.0
    },
    {
      hs_uid: 3,
      us_name: 'Charlie Brown',
      record_count: 105,
      total_points: 840,
      total_maxpoints: 1000,
      percentage: 84.0
    },
    {
      hs_uid: 4,
      us_name: 'Diana Prince',
      record_count: 115,
      total_points: 920,
      total_maxpoints: 1000,
      percentage: 92.0
    },
    {
      hs_uid: 5,
      us_name: 'Ethan Hunt',
      record_count: 100,
      total_points: 800,
      total_maxpoints: 1000,
      percentage: 80.0
    }
  ]
  //
  //  Return rows
  //
  return structure_UsershistoryTopResults
}
//---------------------------------------------------------------------
//  Recent result data last
//---------------------------------------------------------------------
export function fetch_RecentResults1() {
  const structure_UsershistoryRecentResults: structure_UsershistoryRecentResults[] = [
    {
      hs_hid: 101,
      hs_uid: 1,
      us_name: 'Alice Johnson',
      hs_totalpoints: 190,
      hs_maxpoints: 200,
      hs_correctpercent: 95.0
    },
    {
      hs_hid: 102,
      hs_uid: 2,
      us_name: 'Bob Smith',
      hs_totalpoints: 176,
      hs_maxpoints: 200,
      hs_correctpercent: 88.0
    },
    {
      hs_hid: 103,
      hs_uid: 3,
      us_name: 'Charlie Brown',
      hs_totalpoints: 168,
      hs_maxpoints: 200,
      hs_correctpercent: 84.0
    },
    {
      hs_hid: 104,
      hs_uid: 4,
      us_name: 'Diana Prince',
      hs_totalpoints: 184,
      hs_maxpoints: 200,
      hs_correctpercent: 92.0
    },
    {
      hs_hid: 105,
      hs_uid: 5,
      us_name: 'Ethan Hunt',
      hs_totalpoints: 160,
      hs_maxpoints: 200,
      hs_correctpercent: 80.0
    }
  ]
  //
  //  Return rows
  //
  return structure_UsershistoryRecentResults
}
//---------------------------------------------------------------------
//  Recent results data
//---------------------------------------------------------------------
export function fetch_RecentResultsAverages() {
  const UsershistoryRecentResults5: structure_UsershistoryRecentResults[] = [
    {
      hs_hid: 201,
      hs_uid: 1,
      us_name: 'Alice Johnson',
      hs_totalpoints: 185,
      hs_maxpoints: 200,
      hs_correctpercent: 92.5
    },
    {
      hs_hid: 202,
      hs_uid: 2,
      us_name: 'Bob Smith',
      hs_totalpoints: 170,
      hs_maxpoints: 200,
      hs_correctpercent: 85.0
    },
    {
      hs_hid: 203,
      hs_uid: 3,
      us_name: 'Charlie Brown',
      hs_totalpoints: 160,
      hs_maxpoints: 200,
      hs_correctpercent: 80.0
    },
    {
      hs_hid: 204,
      hs_uid: 4,
      us_name: 'Diana Prince',
      hs_totalpoints: 190,
      hs_maxpoints: 200,
      hs_correctpercent: 95.0
    },
    {
      hs_hid: 205,
      hs_uid: 5,
      us_name: 'Ethan Hunt',
      hs_totalpoints: 150,
      hs_maxpoints: 200,
      hs_correctpercent: 75.0
    }
  ]
  //
  //  Return rows
  //
  return UsershistoryRecentResults5
}
