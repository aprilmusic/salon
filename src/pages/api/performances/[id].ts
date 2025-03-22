import { PrismaClient } from '@prisma/client'
import { NextApiResponse } from 'next'
import { NextApiRequest } from 'next'
import { z } from 'zod'
import { performanceSchema, makeResponseSchema } from '@/lib/types'

const prisma = new PrismaClient()

export default async function requestHandler(request: NextApiRequest, response: NextApiResponse) {
    if (request.method === 'GET') {
        const result = await handleGetPerformanceById(getPerformanceByIdParamsSchema.parse(request.query))
        return response.status(200).json(result)
    } else if (request.method === 'PATCH') {
        const result = await handleUpdatePerformanceById(handleUpdatePerformanceByIdParamsSchema.parse({ ...request.query, ...request.body }))
        return response.status(200).json(result)
    } else {
        response.setHeader('Allow', ['GET', 'PATCH'])
        response.status(405).end(`Method ${request.method} Not Allowed`)
    }
}

const getPerformanceByIdParamsSchema = z.object({
    id: z.string()
})

export const getPerformanceByIdResponseSchema = z.union([
    performanceSchema
    ,
    z.object({
        error: z.string()
    })
])

export type GetPerformanceByIdParams = z.infer<typeof getPerformanceByIdParamsSchema>
export type GetPerformanceByIdResponse = z.infer<typeof getPerformanceByIdResponseSchema>

async function handleGetPerformanceById(
    { id }: GetPerformanceByIdParams
): Promise<GetPerformanceByIdResponse> {
    try {
        const performance = await prisma.performance.findUnique({
            where: { id },
        })

        if (!performance) {
            return { error: 'Performance not found' }
        }

        return performance
    } catch (error) {
        console.error('Error fetching performance:', error)
        return { error: `Failed to fetch performance. ${JSON.stringify(error)}` }
    } finally {
        await prisma.$disconnect()
    }
}

const handleUpdatePerformanceByIdParamsSchema = performanceSchema
type HandleUpdatePerformanceByIdParams = z.infer<typeof handleUpdatePerformanceByIdParamsSchema>

export const handleUpdatePerformanceByIdResponseSchema = makeResponseSchema(performanceSchema)
export type HandleUpdatePerformanceByIdResponse = z.infer<typeof handleUpdatePerformanceByIdResponseSchema>

async function handleUpdatePerformanceById(
    { id, ...data }: HandleUpdatePerformanceByIdParams,
): Promise<HandleUpdatePerformanceByIdResponse> {
    try {
        const result = await prisma.performance.update({
            where: {
                id
            },
            data,

        })
        return { success: true, result }

    } catch (error) {
        console.error('Error updating performance:', error)
        return { success: false, error: { message: `Failed to update performance: ${JSON.stringify(error)}` } }
    } finally {
        await prisma.$disconnect()
    }
}

