export type structure_SessionsInfo = {
  si_usid: number
  si_name: string
  si_email: string
  si_admin: boolean
  si_ssid: number
  si_sortquestions: boolean
  si_skipcorrect: boolean
  si_maxquestions: number
}

export type structure_ContextInfo = {
  cx_usid: number
  cx_ssid: number
  cx_dbName: string
  cx_shrink: boolean
  cx_detail: boolean
}

export type structure_UserAuth = {
  id: string
  name: string
  email: string
  password: string
  au_ssid: string
  au_usid: string
  au_name: string
  au_email: string
}

export type structure_UsershistoryTopResults = {
  hs_usid: number
  us_name: string
  record_count: number
  total_points: number
  total_maxpoints: number
  percentage: number
}

export type structure_UsershistoryRecentResults = {
  hs_hsid: number
  hs_usid: number
  us_name: string
  hs_totalpoints: number
  hs_maxpoints: number
  hs_correctpercent: number
}

export type structure_ProviderSignInParams = {
  provider: string
  email: string
  name: string
}

export type structure_Country = {
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
