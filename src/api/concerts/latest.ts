import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getLatestConcert() {
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

        return latestConcert
    } catch (error) {
        console.error('Error fetching latest concert:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}
