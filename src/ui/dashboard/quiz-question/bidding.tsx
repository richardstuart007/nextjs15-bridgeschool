import { useEffect, useState, type JSX } from 'react';
import Image from 'next/image'
import { table_Questions } from '@/src/lib/tables/definitions'

interface QuizBiddingProps {
  question: table_Questions
}

export default function QuizBidding({ question }: QuizBiddingProps): JSX.Element | null {
  const [biddingData, setBiddingData] = useState<(string | null)[][]>([])
  const [suitData, setSuitData] = useState<(string | null)[][]>([])

  useEffect(() => {
    if (question?.qrounds) {
      const bids: (string | null)[][] = []
      const suits: (string | null)[][] = []

      question.qrounds.forEach(round => {
        const roundBids: (string | null)[] = []
        const roundSuits: (string | null)[] = []

        round.forEach(bidsuit => {
          if (typeof bidsuit !== 'string') {
            roundBids.push(null)
            roundSuits.push(null)
          } else {
            let bid: string | null = bidsuit.substring(0, 1)
            let suit: string | null = bidsuit.substring(1, 2)

            switch (bid) {
              case 'P':
                bid = 'Pass'
                suit = null
                break
              case '?':
              case 'X':
                suit = null
                break
              case ' ':
              case 'n':
              case 'N':
                bid = null
                suit = null
                break
              default:
                if (suit === 'N') {
                  bid = bidsuit
                  suit = null
                }
                break
            }

            roundBids.push(bid)
            roundSuits.push(suit)
          }
        })

        bids.push(roundBids)
        suits.push(roundSuits)
      })

      setBiddingData(bids)
      setSuitData(suits)
    }
  }, [question])

  if (!question?.qrounds) return null

  return (
    <div className='my-1 rounded-md bg-green-50 border border-green-300 min-w-[300px] max-w-[400px]'>
      <table className='table-auto'>
        <thead className='rounded-lg text-xs'>
          <tr>
            <th scope='col' className='px-2 font-semibold'>
              North
            </th>
            <th scope='col' className='px-4 font-semibold'>
              East
            </th>
            <th scope='col' className='px-4 font-semibold'>
              South
            </th>
            <th scope='col' className='px-4 font-semibold'>
              West
            </th>
          </tr>
        </thead>
        <tbody>
          {biddingData.map((roundBids, idx) => (
            <tr key={idx} className='text-xs'>
              {roundBids.map((bid, colIdx) => (
                <td key={colIdx} className='whitespace-nowrap'>
                  <div className='flex items-center justify-center'>
                    {/* Bid */}
                    {bid}

                    {/* Suit Symbol */}
                    {suitData[idx][colIdx] !== null && (
                      <div>
                        {suitData[idx][colIdx] === 'S' && (
                          <Image src='/suits/spade.svg' width={10} height={10} alt='spade' />
                        )}
                        {suitData[idx][colIdx] === 'H' && (
                          <Image src='/suits/heart.svg' width={10} height={10} alt='heart' />
                        )}
                        {suitData[idx][colIdx] === 'D' && (
                          <Image src='/suits/diamond.svg' width={10} height={10} alt='diamond' />
                        )}
                        {suitData[idx][colIdx] === 'C' && (
                          <Image src='/suits/club.svg' width={10} height={10} alt='club' />
                        )}
                      </div>
                    )}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
