import { DateTime } from 'next-auth/providers/kakao'

export type table_Library = {
  lrlid: number
  lrref: string
  lrdesc: string
  lrlink: string
  lrwho: string
  lrtype: string
  lrowner: string
  lrgroup: string
  lrgid: number
}

export type table_LibraryGroup = {
  lrlid: number
  lrref: string
  lrdesc: string
  lrlink: string
  lrwho: string
  lrtype: string
  lrowner: string
  lrgroup: string
  lrgid: number
  ogowner: string
  oggroup: string
  ogtitle: string
  ogcntquestions: number
  ogcntlibrary: number
  oggid: number
}

export type table_Logging = {
  lgid: number
  lgdatetime: DateTime
  lgmsg: string
  lgfunctionname: string
  lgsession: number
  lgseverity: string
}

export type table_Owner = {
  oowner: string
  ooid: number
}

export type table_Ownergroup = {
  ogowner: string
  oggroup: string
  ogtitle: string
  ogcntquestions: number
  ogcntlibrary: number
  oggid: number
}

export type table_Questions = {
  qqid: number
  qowner: string
  qdetail: string
  qgroup: string
  qpoints: number[]
  qans: string[]
  qseq: number
  qrounds: string[][] | null
  qnorth: string[] | null
  qeast: string[] | null
  qsouth: string[] | null
  qwest: string[] | null
  qgid: number
}

export type table_Reftype = {
  rttype: string
  rttitle: string
  rtrid: number
}

export type table_Sessions = {
  s_id: number
  s_datetime: DateTime
  s_uid: number
  s_signedin: boolean
  s_sortquestions: boolean
  s_skipcorrect: boolean
  s_dftmaxquestions: number
}

export type table_Users = {
  u_uid: number
  u_name: string
  u_email: string
  u_joined: DateTime
  u_fedid: string
  u_admin: boolean
  u_fedcountry: string
  u_provider: string
}

export type table_Usershistory = {
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
}

export type table_UsershistoryGroupUser = {
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
  oggid: number
  u_uid: number
  u_name: string
  u_email: string
  u_joined: DateTime
  u_fedid: string
  u_admin: boolean
  u_fedcountry: string
  u_provider: string
}
export type table_Userspwd = {
  upuid: number
  upemail: string
  uphash: string
}

export type table_Usersowner = {
  uouid: number
  uoowner: string
}

export type table_Who = {
  wwho: string
  wtitle: string
  wwid: number
}

export type table_pg_tables = {
  schemaname: string
  tablename: string
}
