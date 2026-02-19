import { table_Questions } from '@/src/lib/tables/definitions'
import Image from 'next/image'
import type { JSX } from 'react'

interface QuizHandsProps {
  question: table_Questions
}

export default function QuizHands({ question }: QuizHandsProps): JSX.Element | null {
  //
  //  No Hands
  //
  if (
    !Array.isArray(question.qq_north) &&
    !Array.isArray(question.qq_east) &&
    !Array.isArray(question.qq_south) &&
    !Array.isArray(question.qq_west)
  )
    return null
  //
  // Helper function to check if all values in the hand are 'n' or 'N'
  //
  type Hand = string[]
  const isEmptyHand = (hand: Hand) =>
    !Array.isArray(hand) || hand.length === 0 || hand.every(card => card === 'n' || card === 'N')
  //
  //  Build Hand Data for Positions
  //
  const handData = [
    { position: 'North', hand: question.qq_north },
    { position: 'East', hand: question.qq_east },
    { position: 'South', hand: question.qq_south },
    { position: 'West', hand: question.qq_west }
  ]
    .filter(handObj => Array.isArray(handObj.hand) && !isEmptyHand(handObj.hand))
    .map(handObj => ({
      ...handObj,
      hand:
        handObj.hand?.map(card =>
          typeof card === 'string' && (card === 'n' || card === 'N') ? '' : (card ?? '')
        ) || []
    }))
  //
  // If after filtering nothing valid remains
  //
  if (handData.length === 0) return null
  //------------------------------------------------------------------------------------
  return (
    <div className='my-1 rounded-md bg-green-50 border border-green-300 min-w-[300px] max-w-[400px]'>
      <table className='table-auto'>
        <thead className='rounded-lg  text-sm font-normal'>
          <tr>
            <th scope='col' className='px-4 font-medium'></th>
            <th scope='col' className='px-4 font-medium'>
              <Image src='/suits/spade.svg' width={10} height={10} alt='spade' />
            </th>
            <th scope='col' className='px-4 font-medium'>
              <Image src='/suits/heart.svg' width={10} height={10} alt='heart' />
            </th>
            <th scope='col' className='px-4 font-medium'>
              <Image src='/suits/diamond.svg' width={10} height={10} alt='diamond' />
            </th>
            <th scope='col' className='px-4 font-medium'>
              <Image src='/suits/club.svg' width={10} height={10} alt='club' />
            </th>
          </tr>
        </thead>
        <tbody>
          {handData.map((handObj, idx) => (
            <tr key={idx}>
              <td className='text-xs px-2 font-semibold'>
                <div className='flex items-center justify-center'>{handObj.position}</div>
              </td>
              {handObj.hand.map((cellValue, i) => (
                <td key={i} className='whitespace-nowrap'>
                  <div className='text-xs flex items-center justify-center'>{cellValue}</div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
