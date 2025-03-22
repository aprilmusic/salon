import { concertSchema, makeResponseSchema } from '@/lib/types'
import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { parse } from 'cookie'

const prisma = new PrismaClient()
const ADMIN_COOKIE_NAME = 'admin_token';
const ADMIN_COOKIE_VALUE = process.env.ADMIN_SECRET || 'your-secure-secret-here';

export default async function requestHandler(request: NextApiRequest, response: NextApiResponse) {
    if (request.method === 'GET') {
        const result = await handleGetConcerts(getConcertsParamsSchema.parse(request.query))
        response.status(200).json(result)
    } else if (request.method === 'POST') {
        const cookies = parse(request.headers.cookie || '');
        const adminToken = cookies[ADMIN_COOKIE_NAME];

        if (adminToken !== ADMIN_COOKIE_VALUE) {
            return response.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        }

        const result = await handleCreateConcert(createConcertParamsSchema.parse(request.body))
        response.status(200).json(result)
    } else {
        response.setHeader('Allow', ['GET', 'POST'])
        response.status(405).end(`Method ${request.method} Not Allowed`)
    }
}

const getConcertsParamsSchema = z.object({})
type GetConcertsParams = z.infer<typeof getConcertsParamsSchema>

export const getConcertsResponseSchema = makeResponseSchema(z.array(concertSchema))
export type GetConcertsResponse = z.infer<typeof getConcertsResponseSchema>


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function handleGetConcerts(_: GetConcertsParams): Promise<GetConcertsResponse> {
    console.log('GET /api/concerts')
    try {
        const concerts = await prisma.concert.findMany({
            include: {
                performances: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        })

        return {
            success: true, result: concerts.map(concert => ({
                ...concert,
                date: concert.date.toISOString()
            }))
        }
    } catch (error) {
        console.error('Error fetching concerts:', error)
        return {
            success: false, error: { message: 'Failed to fetch concerts' }
        }
    } finally {
        await prisma.$disconnect()
    }
}


const createConcertParamsSchema = concertSchema.omit({ id: true })
type CreateConcertParams = z.infer<typeof createConcertParamsSchema>

export const createConcertResponseSchema = makeResponseSchema(concertSchema)
type CreateConcertResponse = z.infer<typeof createConcertResponseSchema>

export async function handleCreateConcert({ performances, ...concertData }: CreateConcertParams): Promise<CreateConcertResponse> {
    try {
        console.log('POST /api/concerts', concertData, performances)
        // Validate request data

        const concert = await prisma.concert.create({
            data: {
                ...concertData,
                date: new Date(concertData.date),
                performances: {
                    createMany: {
                        data: performances
                    }
                }
            },
            include: {
                performances: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        })

        return {
            success: true, result: {
                ...concert,
                date: concert.date.toISOString()
            }
        }
    } catch (error) {
        console.error('Error creating concert:', error)
        return { success: false, error: { message: 'Failed to create concert' } }
    } finally {
        await prisma.$disconnect()
    }
}

