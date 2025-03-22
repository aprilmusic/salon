import { performanceSchema, makeResponseSchema } from '@/lib/types'
import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'

const prisma = new PrismaClient()

export default async function requestHandler(request: NextApiRequest, response: NextApiResponse) {
    if (request.method === 'POST') {
        const result = await handleCreatePerformance(createPerformanceParamsSchema.parse(request.body))
        response.status(200).json(result)

    } else if (request.method === 'DELETE') {
        const result = await handleDeletePerformance(deletePerformanceParamsSchema.parse(request.body))
        response.status(200).json(result)
    } else {
        response.setHeader('Allow', ['GET', 'POST', 'DELETE'])
        response.status(405).end(`Method ${request.method} Not Allowed`)
    }
}


const createPerformanceParamsSchema = performanceSchema.omit({ id: true }).extend({
    concertId: z.string(),
    passcode: z.string()
})
type CreatePerformanceParams = z.infer<typeof createPerformanceParamsSchema>

export const createPerformanceResponseSchema = makeResponseSchema(performanceSchema)
export type CreatePerformanceResponse = z.infer<typeof createPerformanceResponseSchema>

export async function handleCreatePerformance(data: CreatePerformanceParams): Promise<CreatePerformanceResponse> {
    try {
        // Verify the concert exists and check the passcode
        const concert = await prisma.concert.findUnique({
            where: { id: data.concertId }
        });

        if (!concert) {
            return { success: false, error: { message: 'Concert not found' } };
        }

        if (concert.passcode !== data.passcode) {
            return { success: false, error: { message: 'Invalid passcode' } };
        }

        // If passcode is correct, proceed with creation
        // Remove passcode from data before creating the performance
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passcode, ...performanceData } = data;

        const performance = await prisma.performance.create({
            data: performanceData
        })
        return { success: true, result: performance }
    } catch (error) {
        console.error('Error creating performance:', error)
        return { success: false, error: { message: 'Failed to create performance' } }
    } finally {
        await prisma.$disconnect()
    }
}

// delete performance
const deletePerformanceParamsSchema = z.object({
    id: z.string(),
    concertId: z.string(),
    passcode: z.string()
})
type DeletePerformanceParams = z.infer<typeof deletePerformanceParamsSchema>

export const deletePerformanceResponseSchema = makeResponseSchema(z.object({ success: z.boolean() }))
export type DeletePerformanceResponse = z.infer<typeof deletePerformanceResponseSchema>

export async function handleDeletePerformance(params: DeletePerformanceParams): Promise<DeletePerformanceResponse> {
    try {
        // First verify the concert exists and check the passcode
        const concert = await prisma.concert.findUnique({
            where: { id: params.concertId }
        });

        if (!concert) {
            return { success: false, error: { message: 'Concert not found' } };
        }

        if (concert.passcode !== params.passcode) {
            return { success: false, error: { message: 'Invalid passcode' } };
        }

        // If passcode is correct, proceed with deletion
        await prisma.performance.delete({
            where: { id: params.id }
        })
        return { success: true, result: { success: true } }
    } catch (error) {
        console.error('Error deleting performance:', error)
        return { success: false, error: { message: 'Failed to delete performance' } }
    } finally {
        await prisma.$disconnect()
    }
}

