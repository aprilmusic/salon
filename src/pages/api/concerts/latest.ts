import { PrismaClient } from '@prisma/client'
import { NextApiResponse } from 'next'
import { NextApiRequest } from 'next'
import { z } from 'zod'
import { concertSchema, makeResponseSchema } from '@/lib/types'

const prisma = new PrismaClient()

export default async function requestHandler(request: NextApiRequest, response: NextApiResponse) {
    if (request.method === 'GET') {
        const result = await handleGetLatestConcert(getLatestConcertParamsSchema.parse(request.query))
        response.status(200).json(result)
    } else {
        response.setHeader('Allow', ['GET', 'POST'])
        response.status(405).end(`Method ${request.method} Not Allowed`)
    }
}

const getLatestConcertParamsSchema = z.object({})
type GetLatestConcertParams = z.infer<typeof getLatestConcertParamsSchema>

export const getLatestConcertResponseSchema = makeResponseSchema(concertSchema)
export type GetLatestConcertResponse = z.infer<typeof getLatestConcertResponseSchema>


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function handleGetLatestConcert(_: GetLatestConcertParams): Promise<GetLatestConcertResponse> {
    console.log('GET /api/concerts')
    try {
        const latestConcert = await prisma.concert.findFirst({
            orderBy: {
                date: 'desc'
            },
            include: {
                performances: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        })

        if (!latestConcert) {
            return { success: false, error: { message: 'No concerts found' } }
        }

        return {
            success: true, result: {
                ...latestConcert,
                date: latestConcert.date.toISOString()
            }
        }
    } catch (error) {
        console.error('Error fetching latest concert:', error)
        return { success: false, error: { message: 'Failed to fetch latest concert' } }
    } finally {
        await prisma.$disconnect()
    }
}