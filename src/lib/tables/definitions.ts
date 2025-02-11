import { DateTime } from 'next-auth/providers/kakao'

export type table_Reference = {
  rf_rfid: number
  rf_ref: string
  rf_desc: string
  rf_link: string
  rf_who: string
  rf_type: string
  rf_owner: string
  rf_subject: string
  rf_sbid: number
  rf_cntquestions: number
}

export type table_ReferenceSubject = {
  rf_rfid: number
  rf_ref: string
  rf_desc: string
  rf_link: string
  rf_who: string
  rf_type: string
  rf_owner: string
  rf_subject: string
  rf_sbid: number
  rf_cntquestions: number
  sb_owner: string
  sb_subject: string
  sb_title: string
  sb_cntquestions: number
  sb_cntreference: number
  sb_sbid: number
}

export type table_Logging = {
  lg_lgid: number
  lg_datetime: DateTime
  lg_msg: string
  lg_functionname: string
  lg_session: number
  lg_severity: string
}

export type table_Owner = {
  ow_owner: string
  ow_owid: number
}

export type table_Subject = {
  sb_owner: string
  sb_subject: string
  sb_title: string
  sb_cntquestions: number
  sb_cntreference: number
  sb_sbid: number
}

export type table_Questions = {
  qq_qqid: number
  qq_owner: string
  qq_detail: string
  qq_subject: string
  qq_points: number[]
  qq_ans: string[]
  qq_seq: number
  qq_rounds: string[][] | null
  qq_north: string[] | null
  qq_east: string[] | null
  qq_south: string[] | null
  qq_west: string[] | null
  qq_sbid: number
  qq_rfid: number
}

export type table_Reftype = {
  rt_type: string
  rt_title: string
  rt_rtid: number
}

export type table_Sessions = {
  ss_ssid: number
  ss_datetime: DateTime
  ss_usid: number
}

export type table_SessionsUser = {
  ss_ssid: number
  ss_datetime: DateTime
  ss_usid: number
  us_name: string
  us_email: string
  us_joined: DateTime
  us_fedid: string
  us_admin: boolean
  us_fedcountry: string
  us_provider: string
  us_sortquestions: boolean
  us_skipcorrect: boolean
  us_maxquestions: number
}

export type table_Users = {
  us_usid: number
  us_name: string
  us_email: string
  us_joined: DateTime
  us_fedid: string
  us_admin: boolean
  us_fedcountry: string
  us_provider: string
  us_sortquestions: boolean
  us_skipcorrect: boolean
  us_maxquestions: number
}

export type table_Usershistory = {
  hs_hsid: number
  hs_datetime: DateTime
  hs_owner: string
  hs_subject: string
  hs_questions: number
  hs_qid: number[]
  hs_ans: number[]
  hs_usid: number
  hs_points: number[]
  hs_maxpoints: number
  hs_totalpoints: number
  hs_correctpercent: number
  hs_sbid: number
  hs_rfid: number
}

export type table_UsershistorySubjectUser = {
  hs_hsid: number
  hs_datetime: DateTime
  hs_owner: string
  hs_subject: string
  hs_questions: number
  hs_qid: number[]
  hs_ans: number[]
  hs_usid: number
  hs_points: number[]
  hs_maxpoints: number
  hs_totalpoints: number
  hs_correctpercent: number
  hs_sbid: number
  hs_rfid: number
  sb_owner: string
  sb_subject: string
  sb_title: string
  sb_cntquestions: number
  sb_cntreference: number
  sb_sbid: number
  us_usid: number
  us_name: string
  us_email: string
  us_joined: DateTime
  us_fedid: string
  us_admin: boolean
  us_fedcountry: string
  us_provider: string
}
export type table_Userspwd = {
  up_usid: number
  up_email: string
  up_hash: string
}

export type table_Usersowner = {
  uo_usid: number
  uo_owner: string
}

export type table_Who = {
  wh_who: string
  wh_title: string
  wh_whid: number
}
