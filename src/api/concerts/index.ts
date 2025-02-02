import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getAllConcerts() {
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

        return concerts
    } catch (error) {
        console.error('Error fetching concerts:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}
