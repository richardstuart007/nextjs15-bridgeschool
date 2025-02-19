export type structure_SessionsInfo = {
  bsuid: number
  bsname: string
  bsemail: string
  bsadmin: boolean
  bsid: number
  bssortquestions: boolean
  bsskipcorrect: boolean
  bsmaxquestions: number
}

export type structure_ContextInfo = {
  cx_usid: number
  cx_bsid: number
  cx_dbName: string
  cx_shrink: boolean
}

export type structure_UserAuth = {
  id: string
  name: string
  email: string
  password: string
}

export interface structure_UsershistoryTopResults {
  hs_usid: number
  us_name: string
  record_count: number
  total_points: number
  total_maxpoints: number
  percentage: number
}

export interface structure_UsershistoryRecentResults {
  hs_hsid: number
  hs_usid: number
  us_name: string
  hs_totalpoints: number
  hs_maxpoints: number
  hs_correctpercent: number
}

export interface structure_ProviderSignInParams {
  provider: string
  email: string
  name: string
}

export interface structure_Country {
  code: string
  label: string
  phone: string
  timezone: string
}
//
// Column-value pairs
//
export type ColumnValuePair = {
  column: string
  value: string | number
}
export type TableColumnValuePairs = {
  table: string
  whereColumnValuePairs: ColumnValuePair[]
}
