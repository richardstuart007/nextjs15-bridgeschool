'use server'

import { table_update } from '@/src/lib/tables/tableGeneric/table_update'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
//
//  Errors and Messages
//
export type StateSetup = {
  message?: string | null
  errors: {
    NS?: string | null
    NH?: string | null
    ND?: string | null
    NC?: string | null
    ES?: string | null
    EH?: string | null
    ED?: string | null
    EC?: string | null
    SS?: string | null
    SH?: string | null
    SD?: string | null
    SC?: string | null
    WS?: string | null
    WH?: string | null
    WD?: string | null
    WC?: string | null
  }
  databaseUpdated?: boolean
}
//
//  hand names
//
const hand_name = [
  'NS',
  'NH',
  'ND',
  'NC',
  'ES',
  'EH',
  'ED',
  'EC',
  'SS',
  'SH',
  'SD',
  'SC',
  'WS',
  'WH',
  'WD',
  'WC'
]

export async function Maint(_prevState: StateSetup, formData: FormData): Promise<StateSetup> {
  const functionName = 'Mainthands'
  //
  // Retrieve values from formData and store them in an array
  //
  const values = hand_name.map(name => formData.get(name) as string | null)
  //
  // Initialize an errors object to accumulate any validation errors
  //
  const errors: StateSetup['errors'] = {
    NS: null,
    NH: null,
    ND: null,
    NC: null,
    ES: null,
    EH: null,
    ED: null,
    EC: null,
    SS: null,
    SH: null,
    SD: null,
    SC: null,
    WS: null,
    WH: null,
    WD: null,
    WC: null
  }
  //
  // initialise return values
  //
  let message = ''
  let databaseUpdated = false
  let ok = true
  //
  // Check for duplicate cards across hands
  //
  let availableSpades = 'AKQJT987654321'
  let availableHearts = 'AKQJT987654321'
  let availableDiamonds = 'AKQJT987654321'
  let availableClubs = 'AKQJT987654321'
  checkDuplicates()
  //
  // Check not too many cards
  //
  if (ok) checkCardCount()
  //
  //  Update message
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
  // Check for duplicates
  // ----------------------------------------------------------------------
  function checkDuplicates() {
    //
    // Step 3: Check each hand for available cards
    //
    hand_name.forEach((hand, index) => {
      const handValue = values[index] || ''
      const handCards = handValue.split('')
      //
      // Loop through cards of the current hand
      //
      handCards.forEach(card => {
        //
        //  Suit is the second character of hand (NS = North, Spades)
        //
        const suit = hand[1] as 'S' | 'H' | 'D' | 'C'
        //
        // Call the helper function to handle card availability and update the errors array
        //
        checkCardAvailability(suit, card, hand as keyof StateSetup['errors'], errors)
      })
    })
  }
  // ----------------------------------------------------------------------
  // check availability and update any duplicate errors
  // ----------------------------------------------------------------------
  function checkCardAvailability(
    suit: 'S' | 'H' | 'D' | 'C',
    card: string,
    hand: keyof StateSetup['errors'],
    errors: StateSetup['errors']
  ) {
    let availableCards: string
    //
    // Determine the available cards based on the suit
    //
    switch (suit) {
      case 'S':
        availableCards = availableSpades
        break
      case 'H':
        availableCards = availableHearts
        break
      case 'D':
        availableCards = availableDiamonds
        break
      case 'C':
        availableCards = availableClubs
        break
      default:
        return
    }
    //
    // Duplicates
    //
    if (!availableCards.includes(card)) {
      if (errors && errors[hand] === null) {
        errors[hand] = `Duplicates: ${card}`
      } else if (errors && errors[hand] !== null) {
        errors[hand] = `${errors[hand]} , ${card}`
      }
      message = 'Duplicates'
      ok = false
    } else {
      //
      // Remove the used card from the available set of cards
      //
      switch (suit) {
        case 'S':
          availableSpades = availableSpades.replace(card, '')
          break
        case 'H':
          availableHearts = availableHearts.replace(card, '')
          break
        case 'D':
          availableDiamonds = availableDiamonds.replace(card, '')
          break
        case 'C':
          availableClubs = availableClubs.replace(card, '')
          break
      }
    }
  }
  // ----------------------------------------------------------------------
  //  Check that no hand has more than 13 cards
  // ----------------------------------------------------------------------
  function checkCardCount() {
    //
    //  Hand ranges N,E,S,W
    //
    const handRanges = [
      { start: 0, end: 3 },
      { start: 4, end: 7 },
      { start: 8, end: 11 },
      { start: 12, end: 15 }
    ]
    //
    //  Process each hand
    //
    for (let i = 0; i < handRanges.length; i++) {
      const { start, end } = handRanges[i]
      //
      // Count cards for each hand within the specified range
      //
      let totalCardsForHand = 0
      for (let i = start; i <= end; i++) {
        const handValue = values[i] || ''
        totalCardsForHand += handValue.length
        //
        // Check if the total card count exceeds 13
        //
        if (totalCardsForHand > 13) {
          const handName = hand_name[i]
          errors[handName as keyof StateSetup['errors']] = `Too many cards in hand`
          ok = false
          break
        }
      }
    }
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
      const northString = formatHand(values[0], values[1], values[2], values[3])
      const eastString = formatHand(values[4], values[5], values[6], values[7])
      const southString = formatHand(values[8], values[9], values[10], values[11])
      const westString = formatHand(values[12], values[13], values[14], values[15])
      //
      //  update parameters
      //
      const updateParams = {
        table: 'questions',
        columnValuePairs: [
          { column: 'qnorth', value: northString },
          { column: 'qeast', value: eastString },
          { column: 'qsouth', value: southString },
          { column: 'qwest', value: westString }
        ],
        whereColumnValuePairs: [{ column: 'qqid', value: qqid }]
      }
      //
      //  Update the database
      //
      await table_update(updateParams)
      message = `Database updated successfully.`
      databaseUpdated = true
      const errorMessage = 'Database Error: Failed to Update Library.'
      writeLogging(functionName, errorMessage)
      return {
        message: errorMessage,
        errors: undefined,
        databaseUpdated: false
      }
      //
      //  Errors
      //
    } catch (error) {
      ok = false
      message = 'Database Error: Failed to Update.'
    }
  }
  // ----------------------------------------------------------------------
  //  Format Hand
  // ----------------------------------------------------------------------
  function formatHand(
    spades: string | null,
    hearts: string | null,
    diamonds: string | null,
    clubs: string | null
  ): string {
    //
    // If the suit is empty, return 'n', otherwise return the suit value
    //
    const formatSuit = (suit: string | null): string => {
      return suit === null || suit.length === 0 ? 'n' : suit
    }
    //
    // Format each suit
    //
    const formattedSpades = formatSuit(spades)
    const formattedHearts = formatSuit(hearts)
    const formattedDiamonds = formatSuit(diamonds)
    const formattedClubs = formatSuit(clubs)
    //
    // Return the whole hand in the desired format, with commas between suits
    //
    const sqlString = `{${formattedSpades},${formattedHearts},${formattedDiamonds},${formattedClubs}}`
    return sqlString
  }
  // ----------------------------------------------------------------------
}
