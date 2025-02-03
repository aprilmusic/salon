import { PrismaClient } from '@prisma/client'
import { NextApiResponse } from 'next'
import { NextApiRequest } from 'next'

const prisma = new PrismaClient()

export async function GET(req: NextApiRequest, res: NextApiResponse) {
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

        return res.send(latestConcert)
    } catch (error) {
        console.error('Error fetching latest concert:', error)
        return res.send({ error: 'Failed to fetch latest concert' })
    } finally {
        await prisma.$disconnect()
    }
}

export default function requestHandler(request: NextApiRequest, response: NextApiResponse) {
    if (request.method === 'GET') {
        return GET(request, response)
    }
}   