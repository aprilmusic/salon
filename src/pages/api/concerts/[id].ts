import { PrismaClient } from '@prisma/client'
import { NextApiResponse } from 'next'
import { NextApiRequest } from 'next'

const prisma = new PrismaClient()
export async function GET(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const concert = await prisma.concert.findUnique({
            where: {
                id: req.query.id as string
            },
            include: {
                performances: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        })

        if (!concert) {
            return res.send({ error: 'Concert not found' })
        }

        return res.send(concert)
    } catch (error) {
        console.error('Error fetching concert:', error)
        return res.send({ error: 'Failed to fetch concert' })
    } finally {
        await prisma.$disconnect()
    }
}

export async function PATCH(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const data = req.body
        const updatedConcert = await prisma.concert.update({
            where: {
                id: req.query.id as string
            },
            data,
            include: {
                performances: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        })

        return res.send(updatedConcert)
    } catch (error) {
        console.error('Error updating concert:', error)
        return res.send({ error: 'Failed to update concert' })
    } finally {
        await prisma.$disconnect()
    }
}

export default function requestHandler(request: NextApiRequest, response: NextApiResponse) {
    if (request.method === 'GET') {
        return GET(request, response)
    } else if (request.method === 'PATCH') {
        return PATCH(request, response)
    }
}   