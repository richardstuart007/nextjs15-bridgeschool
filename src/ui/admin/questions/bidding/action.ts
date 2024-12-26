'use server'

import { table_update } from '@/src/lib/tables/tableGeneric/table_update'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
//
//  Errors and Messages
//
export type StateSetup = {
  message?: string | null
  errors: {
    R1B1?: string | null
    R1B2?: string | null
    R1B3?: string | null
    R1B4?: string | null
    R2B1?: string | null
    R2B2?: string | null
    R2B3?: string | null
    R2B4?: string | null
    R3B1?: string | null
    R3B2?: string | null
    R3B3?: string | null
    R3B4?: string | null
    R4B1?: string | null
    R4B2?: string | null
    R4B3?: string | null
    R4B4?: string | null
    R5B1?: string | null
    R5B2?: string | null
    R5B3?: string | null
    R5B4?: string | null
    R6B1?: string | null
    R6B2?: string | null
    R6B3?: string | null
    R6B4?: string | null
    R7B1?: string | null
    R7B2?: string | null
    R7B3?: string | null
    R7B4?: string | null
  }
  databaseUpdated?: boolean
}
//
//  hand names
//
const bidding_names = [
  'R1B1',
  'R1B2',
  'R1B3',
  'R1B4',
  'R2B1',
  'R2B2',
  'R2B3',
  'R2B4',
  'R3B1',
  'R3B2',
  'R3B3',
  'R3B4',
  'R4B1',
  'R4B2',
  'R4B3',
  'R4B4',
  'R5B1',
  'R5B2',
  'R5B3',
  'R5B4',
  'R6B1',
  'R6B2',
  'R6B3',
  'R6B4',
  'R7B1',
  'R7B2',
  'R7B3',
  'R7B4'
]
//
// Valid Values
//
const VALIDVALUES = [
  '1C',
  '1D',
  '1H',
  '1S',
  '1NT',
  '2C',
  '2D',
  '2H',
  '2S',
  '2NT',
  '3C',
  '3D',
  '3H',
  '3S',
  '3NT',
  '4C',
  '4D',
  '4H',
  '4S',
  '4NT',
  '5C',
  '5D',
  '5H',
  '5S',
  '5NT',
  '6C',
  '6D',
  '6H',
  '6S',
  '6NT',
  '7C',
  '7D',
  '7H',
  '7S',
  '7NT'
]
const SPECIALBIDS = ['PASS', 'X', 'XX', '?']

export async function Maint(_prevState: StateSetup, formData: FormData): Promise<StateSetup> {
  const functionName = 'MaintBidding'
  //
  // Retrieve values from formData and store them in an array
  //
  const values = bidding_names.map(name => formData.get(name) as string | null)
  //
  // Initialize an errors object to accumulate any validation errors
  //
  const errors: StateSetup['errors'] = {
    R1B1: null,
    R1B2: null,
    R1B3: null,
    R1B4: null,
    R2B1: null,
    R2B2: null,
    R2B3: null,
    R2B4: null,
    R3B1: null,
    R3B2: null,
    R3B3: null,
    R3B4: null,
    R4B1: null,
    R4B2: null,
    R4B3: null,
    R4B4: null,
    R5B1: null,
    R5B2: null,
    R5B3: null,
    R5B4: null,
    R6B1: null,
    R6B2: null,
    R6B3: null,
    R6B4: null,
    R7B1: null,
    R7B2: null,
    R7B3: null,
    R7B4: null
  }
  //
  // initialise return values
  //
  let message = ''
  let databaseUpdated = false
  let ok = true
  //
  //  Check values are valid
  //
  checkValidValues()
  //
  //  Update Database
  //
  if (ok) await updateDatabase()
  //
  //  return values
  //
  return {
    errors: errors,
    message: message,
    databaseUpdated: databaseUpdated
  }

  // ----------------------------------------------------------------------
  // Check for valid bidding
  // ----------------------------------------------------------------------
  function checkValidValues() {
    //
    // Counts
    //
    let highestValidIndex = -1
    let noMoreBids = false
    let consecutivePasses = 0
    //
    //  Lop through all values
    //
    values.forEach((bid, index) => {
      //
      //  Get the bidding name
      //
      const biddingName = bidding_names[index] as keyof StateSetup['errors']
      //
      // PASS counts
      //
      if (bid === 'PASS') {
        consecutivePasses++
      } else {
        consecutivePasses = 0
      }
      //
      //  Ignore empty bid
      //
      if (bid === '' || !bid || consecutivePasses === 3) {
        noMoreBids = true
        return
      }
      //
      // If an empty bid has been encountered, no further bids can be made
      //
      if (noMoreBids && bid !== '') {
        errors[biddingName] = 'No further bids'
        message = 'Bids stopped after an empty bid'
        ok = false
        return
      }
      //
      // If three consecutive passes have been encountered
      //
      if (consecutivePasses > 3) {
        errors[biddingName] = '3 passes already'
        message = 'Cannot bid after three consecutive passes'
        ok = false
        return
      }
      //
      // Check if the bid is in SPECIALBIDS
      //
      if (SPECIALBIDS.includes(bid)) return
      //
      // Check if the bid is in VALIDVALUES
      //
      const validIndex = VALIDVALUES.indexOf(bid)
      if (validIndex === -1) {
        errors[biddingName] = `Invalid bid`
        message = 'Invalid bids'
        ok = false
        return
      }
      //
      // Ensure bids are non-descending
      //
      if (validIndex <= highestValidIndex) {
        errors[biddingName] = `Bid out of sequence`
        message = 'Bids out of sequence'
        ok = false
        return
      }

      //
      // Update the highest valid index
      //
      highestValidIndex = validIndex
    })
  }

  // ----------------------------------------------------------------------
  // Update the database
  // ----------------------------------------------------------------------
  async function updateDatabase() {
    //
    //  Convert hidden fields value to numeric
    //
    const qqidString = formData.get('qqid') as string | 0
    const qqid = Number(qqidString)
    //
    // Update data into the database
    //
    try {
      //
      //  Create the hand strings
      //
      const rounds = []
      for (let i = 0; i < values.length; i += 4) {
        const round = values.slice(i, i + 4).map(bid => bid || 'N')
        if (round.some(bid => bid !== 'N')) {
          rounds.push(round)
        }
      }

      // Format the rounds as a string
      const qrounds = `{${rounds.map(round => `{${round.join(',')}}`).join(',')}}`
      //
      //  update parameters
      //
      const updateParams = {
        table: 'questions',
        columnValuePairs: [{ column: 'qrounds', value: qrounds }],
        whereColumnValuePairs: [{ column: 'qqid', value: qqid }]
      }
      //
      //  Update the database
      //
      await table_update(updateParams)
      message = `Database updated successfully.`
      databaseUpdated = true
      //
      //  Errors
      //
    } catch (error) {
      ok = false
      message = 'Database Error: Failed to Update.'
      const errorMessage = 'Database Error: Failed to Update Bidding.'
      writeLogging(functionName, errorMessage)
      return {
        message: errorMessage,
        errors: undefined,
        databaseUpdated: false
      }
    }
  }
  // ----------------------------------------------------------------------
}
