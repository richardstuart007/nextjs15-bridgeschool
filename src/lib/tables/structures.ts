import { DateTime } from 'next-auth/providers/kakao'

export type structure_HistoryGroup = {
  r_hid: number
  r_datetime: DateTime
  r_owner: string
  r_group: string
  r_questions: number
  r_qid: number[]
  r_ans: number[]
  r_uid: number
  r_points: number[]
  r_maxpoints: number
  r_totalpoints: number
  r_correctpercent: number
  r_gid: number
  r_sid: number
  ogowner: string
  oggroup: string
  ogtitle: string
  ogcntquestions: number
  ogcntlibrary: number
  u_name: string
}

export type structure_SessionsInfo = {
  bsuid: number
  bsname: string
  bsemail: string
  bsadmin: boolean
  bsid: number
  bssignedin: boolean
  bssortquestions: boolean
  bsskipcorrect: boolean
  bsdftmaxquestions: number
}

export type structure_ContextInfo = {
  cxuid: number
  cxid: number
}

export type structure_UserAuth = {
  id: string
  name: string
  email: string
  password: string
}

export interface structure_UsershistoryTopResults {
  r_uid: number
  u_name: string
  record_count: number
  total_points: number
  total_maxpoints: number
  percentage: number
}

export interface structure_UsershistoryRecentResults {
  r_hid: number
  r_uid: number
  u_name: string
  r_totalpoints: number
  r_maxpoints: number
  r_correctpercent: number
}

export interface structure_ProviderSignInParams {
  provider: string
  email: string
  name: string
}
