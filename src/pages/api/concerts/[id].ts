import { PrismaClient } from '@prisma/client'
import { NextApiResponse } from 'next'
import { NextApiRequest } from 'next'
import { z } from 'zod'
import { concertSchema, makeResponseSchema } from '@/lib/types'
import { parse } from 'cookie'

const prisma = new PrismaClient()
const ADMIN_COOKIE_NAME = 'admin_token';
const ADMIN_COOKIE_VALUE = process.env.ADMIN_SECRET || 'your-secure-secret-here';

export default async function requestHandler(request: NextApiRequest, response: NextApiResponse) {
    if (request.method === 'GET') {
        console.log(request.query.id)
        console.log(request.body)
        const result = await handleGetConcertById(getConcertByIdParamsSchema.parse(request.query))
        return response.status(200).json(result)
    } else if (request.method === 'PATCH') {
        const result = await handleUpdateConcertById(handleUpdateConcertByIdParamsSchema.parse({ ...request.query, ...request.body }))
        return response.status(200).json(result)
    } else if (request.method === 'DELETE') {
        const cookies = parse(request.headers.cookie || '');
        const adminToken = cookies[ADMIN_COOKIE_NAME];

        if (adminToken !== ADMIN_COOKIE_VALUE) {
            return response.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        }

        const result = await handleDeleteConcertById(handleDeleteConcertByIdParamsSchema.parse({
            id: request.query.id as string,
            passcode: request.body.passcode
        }))
        return response.status(200).json(result)
    } else {
        response.setHeader('Allow', ['GET', 'PATCH', 'DELETE'])
        response.status(405).end(`Method ${request.method} Not Allowed`)
    }
}

const getConcertByIdParamsSchema = z.object({
    id: z.string()
})

export const getConcertByIdResponseSchema = makeResponseSchema(concertSchema)

type GetConcertByIdParams = z.infer<typeof getConcertByIdParamsSchema>
export type GetConcertByIdResponse = z.infer<typeof getConcertByIdResponseSchema>

async function handleGetConcertById(
    { id }: GetConcertByIdParams
): Promise<GetConcertByIdResponse> {
    try {
        const concert = await prisma.concert.findUnique({
            where: { id },
            include: {
                performances: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        })

        if (!concert) {
            return { success: false, error: { message: 'Concert not found' } }
        }

        return {
            success: true, result: {
                ...concert,
                date: concert.date.toISOString()
            }
        }
    } catch (error) {
        console.error('Error fetching concert:', error)
        return { success: false, error: { message: `Failed to fetch concert. ${JSON.stringify(error)}` } }
    } finally {
        await prisma.$disconnect()
    }
}

const handleUpdateConcertByIdParamsSchema = z.object({
    id: z.string(),
    date: z.string().optional(),
    passcode: z.string().optional()

})
type HandleUpdateConcertByIdParams = z.infer<typeof handleUpdateConcertByIdParamsSchema>

export const handleUpdateConcertByIdResponseSchema = makeResponseSchema(concertSchema)
export type HandleUpdateConcertByIdResponse = z.infer<typeof handleUpdateConcertByIdResponseSchema>

async function handleUpdateConcertById(
    { id, ...data }: HandleUpdateConcertByIdParams,
): Promise<HandleUpdateConcertByIdResponse> {
    try {
        const result = await prisma.concert.update({
            where: {
                id
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
        return {
            success: true,
            result: {
                ...result,
                date: result.date.toISOString()
            }
        }

    } catch (error) {
        console.error('Error updating concert:', error)
        return { success: false, error: { message: `Failed to update concert: ${JSON.stringify(error)}` } }
    } finally {
        await prisma.$disconnect()
    }
}

const handleDeleteConcertByIdParamsSchema = z.object({
    id: z.string(),
    passcode: z.string()
})
type HandleDeleteConcertByIdParams = z.infer<typeof handleDeleteConcertByIdParamsSchema>

export const handleDeleteConcertByIdResponseSchema = makeResponseSchema(z.object({ success: z.boolean() }))
export type HandleDeleteConcertByIdResponse = z.infer<typeof handleDeleteConcertByIdResponseSchema>

async function handleDeleteConcertById(
    { id, passcode }: HandleDeleteConcertByIdParams
): Promise<HandleDeleteConcertByIdResponse> {
    try {
        // First verify the concert exists and check the passcode
        const concert = await prisma.concert.findUnique({
            where: { id }
        });

        if (!concert) {
            return { success: false, error: { message: 'Concert not found' } };
        }

        if (concert.passcode !== passcode) {
            return { success: false, error: { message: 'Invalid passcode' } };
        }

        // If passcode is correct, proceed with deletion
        await prisma.concert.delete({ where: { id } })
        return { success: true, result: { success: true } }
    } catch (error) {
        console.error('Error deleting concert:', error)
        return { success: false, error: { message: `Failed to delete concert: ${JSON.stringify(error)}` } }
    } finally {
        await prisma.$disconnect()
    }
}
