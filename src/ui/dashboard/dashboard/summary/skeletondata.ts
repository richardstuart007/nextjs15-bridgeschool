import {
  structure_UsershistoryTopResults,
  structure_UsershistoryRecentResults
} from '@/src/lib/tables/structures'
//---------------------------------------------------------------------
//  Top results data
//---------------------------------------------------------------------
export function fetchTopResultsData() {
  const structure_UsershistoryTopResults: structure_UsershistoryTopResults[] = [
    {
      r_uid: 1,
      u_name: 'Alice Johnson',
      record_count: 120,
      total_points: 950,
      total_maxpoints: 1000,
      percentage: 95.0
    },
    {
      r_uid: 2,
      u_name: 'Bob Smith',
      record_count: 110,
      total_points: 880,
      total_maxpoints: 1000,
      percentage: 88.0
    },
    {
      r_uid: 3,
      u_name: 'Charlie Brown',
      record_count: 105,
      total_points: 840,
      total_maxpoints: 1000,
      percentage: 84.0
    },
    {
      r_uid: 4,
      u_name: 'Diana Prince',
      record_count: 115,
      total_points: 920,
      total_maxpoints: 1000,
      percentage: 92.0
    },
    {
      r_uid: 5,
      u_name: 'Ethan Hunt',
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
export function fetchRecentResultsData1() {
  const structure_UsershistoryRecentResults: structure_UsershistoryRecentResults[] = [
    {
      r_hid: 101,
      r_uid: 1,
      u_name: 'Alice Johnson',
      r_totalpoints: 190,
      r_maxpoints: 200,
      r_correctpercent: 95.0
    },
    {
      r_hid: 102,
      r_uid: 2,
      u_name: 'Bob Smith',
      r_totalpoints: 176,
      r_maxpoints: 200,
      r_correctpercent: 88.0
    },
    {
      r_hid: 103,
      r_uid: 3,
      u_name: 'Charlie Brown',
      r_totalpoints: 168,
      r_maxpoints: 200,
      r_correctpercent: 84.0
    },
    {
      r_hid: 104,
      r_uid: 4,
      u_name: 'Diana Prince',
      r_totalpoints: 184,
      r_maxpoints: 200,
      r_correctpercent: 92.0
    },
    {
      r_hid: 105,
      r_uid: 5,
      u_name: 'Ethan Hunt',
      r_totalpoints: 160,
      r_maxpoints: 200,
      r_correctpercent: 80.0
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
export function fetchRecentResultsData5() {
  const UsershistoryRecentResults5: structure_UsershistoryRecentResults[] = [
    {
      r_hid: 201,
      r_uid: 1,
      u_name: 'Alice Johnson',
      r_totalpoints: 185,
      r_maxpoints: 200,
      r_correctpercent: 92.5
    },
    {
      r_hid: 202,
      r_uid: 2,
      u_name: 'Bob Smith',
      r_totalpoints: 170,
      r_maxpoints: 200,
      r_correctpercent: 85.0
    },
    {
      r_hid: 203,
      r_uid: 3,
      u_name: 'Charlie Brown',
      r_totalpoints: 160,
      r_maxpoints: 200,
      r_correctpercent: 80.0
    },
    {
      r_hid: 204,
      r_uid: 4,
      u_name: 'Diana Prince',
      r_totalpoints: 190,
      r_maxpoints: 200,
      r_correctpercent: 95.0
    },
    {
      r_hid: 205,
      r_uid: 5,
      u_name: 'Ethan Hunt',
      r_totalpoints: 150,
      r_maxpoints: 200,
      r_correctpercent: 75.0
    }
  ]
  //
  //  Return rows
  //
  return UsershistoryRecentResults5
}
