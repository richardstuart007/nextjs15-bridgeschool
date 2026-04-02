'use server'

import { table_update } from '@/src/lib/tables/tableGeneric/table_update'
import { getAuthSession } from '@/src/lib/dataAuth/getAuthSession'
import { write_Logging } from '@/src/lib/tables/tableSpecific/write_logging'

interface GraphPrefs {
  us_graph_user_months?: number
  us_graph_top_months?: number
  us_graph_recent_users?: number
  us_graph_recent_avg?: number
}

export async function update_tus_GraphPrefs(prefs: GraphPrefs, caller: string = '') {
  const functionName = 'update_tus_GraphPrefs'

  try {
    // Get current user
    const authSession = await getAuthSession(functionName)
    const us_usid = authSession?.user?.au_usid

    if (!us_usid) {
      throw new Error('No authenticated user found')
    }

    // Build column value pairs for only the fields that changed
    const columnValuePairs = []

    if (prefs.us_graph_user_months !== undefined) {
      columnValuePairs.push({
        column: 'us_graph_user_months',
        value: prefs.us_graph_user_months
      })
    }

    if (prefs.us_graph_top_months !== undefined) {
      columnValuePairs.push({
        column: 'us_graph_top_months',
        value: prefs.us_graph_top_months
      })
    }

    if (prefs.us_graph_recent_users !== undefined) {
      columnValuePairs.push({
        column: 'us_graph_recent_users',
        value: prefs.us_graph_recent_users
      })
    }

    if (prefs.us_graph_recent_avg !== undefined) {
      columnValuePairs.push({
        column: 'us_graph_recent_avg',
        value: prefs.us_graph_recent_avg
      })
    }

    // If no changes, return early
    if (columnValuePairs.length === 0) {
      return { success: true }
    }

    // Update the user record using table_update
    await table_update({
      caller: functionName,
      table: 'tus_users',
      columnValuePairs,
      whereColumnValuePairs: [{ column: 'us_usid', value: us_usid }]
    })

    // Log the update
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: `Updated graph preferences for user ${us_usid}: ${JSON.stringify(prefs)}`,
      lg_severity: 'I'
    })

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    write_Logging({
      lg_caller: caller,
      lg_functionname: functionName,
      lg_msg: errorMessage,
      lg_severity: 'E'
    })
    console.error('Error updating graph preferences:', error)
    return { success: false, error: errorMessage }
  }
}
