//
//  All valid tables
//
export const TABLES = {
  DATABASE: 'tdb_database',
  HISTORY: 'ths_history',
  LOGGING: 'tlg_logging',
  MENULINKS: 'tml_menulinks',
  OWNER: 'tow_owner',
  QUESTIONS: 'tqq_questions',
  REFERENCE: 'trf_reference',
  REFERENCETYPE: 'trt_reftype',
  SUBJECT: 'tsb_subject',
  SESSIONS: 'tdb_sessions',
  USERSOWNER: 'tuo_usersowner',
  USERSPWD: 'tup_userspwd',
  USERS: 'tus_users',
  WHO: 'twh_who'
} as const

export type TableName = (typeof TABLES)[keyof typeof TABLES]

// ────────────────────────────────────────────────
// Tables whose lookups should be cached (static/reference data)
// These are read-heavy, rarely/never change after deployment
// ────────────────────────────────────────────────
export const CACHED_TABLES = new Set<TableName>([
  TABLES.DATABASE,
  TABLES.REFERENCE,
  TABLES.REFERENCETYPE,
  TABLES.SUBJECT,
  TABLES.QUESTIONS,
  TABLES.OWNER,
  TABLES.WHO
])
