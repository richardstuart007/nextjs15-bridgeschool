export function buildSql_Readable(sqlQuery: string, values: (string | number)[]): string {
  let readableSql = sqlQuery
  for (let i = 0; i < values.length; i++) {
    const placeholder = `$${i + 1}`
    const value = values[i]
    readableSql = readableSql.replace(placeholder, String(value))
  }
  return readableSql
}
