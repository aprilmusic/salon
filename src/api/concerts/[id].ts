import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getConcertById(id: string) {
    try {
        const concert = await prisma.concert.findUnique({
            where: {
                id: id
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
            throw new Error('Concert not found')
        }

        return concert
    } catch (error) {
        console.error('Error fetching concert:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}
