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
    console.log('GET /api/concerts/latest')
    try {
        // Get all concerts and handle featured logic in JavaScript
        const allConcerts = await prisma.concert.findMany({
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

        if (allConcerts.length === 0) {
            return { success: false, error: { message: 'No concerts found' } }
        }

        // Try to find a featured concert, otherwise use the latest
        const featuredConcert = allConcerts.find(concert => concert.featured === true)
        const latestConcert = featuredConcert || allConcerts[0]

        return {
            success: true, result: {
                id: latestConcert.id,
                name: latestConcert.name,
                date: latestConcert.date.toISOString(),
                passcode: latestConcert.passcode,
                frozen: latestConcert.frozen,
                featured: latestConcert.featured,
                videoLink: latestConcert.videoLink,
                performances: latestConcert.performances.map(p => ({
                    id: p.id,
                    title: p.title,
                    composer: p.composer,
                    performers: p.performers,
                    order: p.order
                }))
            }
        }
    } catch (error) {
        console.error('Error fetching latest concert:', error)
        return { success: false, error: { message: 'Failed to fetch latest concert' } }
    } finally {
        await prisma.$disconnect()
    }
}