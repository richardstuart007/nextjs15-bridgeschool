//
//  All valid tables
//
export const TABLES = {
  DATABASE: 'tdb_database',
  HISTORY: 'ths_history',
  LOGGING: 'tlg_logging',
  OWNER: 'tow_owner',
  QUESTIONS: 'tqq_questions',
  REFERENCE: 'trf_reference',
  REFERENCETYPE: 'trt_reftype',
  SUBJECT: 'tsb_subject',
  SESSIONS: 'tss_sessions',
  USERSFRIENDS: 'tuf_friends',
  USERSOWNER: 'tuo_usersowner',
  USERSPWD: 'tup_userspwd',
  USERS: 'tus_users',
  WHO: 'twh_who'
} as const

export type TableName = (typeof TABLES)[keyof typeof TABLES]
