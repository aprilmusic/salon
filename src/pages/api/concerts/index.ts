import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()
export async function GET(request: NextApiRequest, response: NextApiResponse) {
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

        return response.send(concerts)
    } catch (error) {
        console.error('Error fetching concerts:', error)
        return response.send({ error: 'Failed to fetch concerts' })
    } finally {
        await prisma.$disconnect()
    }
}


type ProgramItem = {
    title: string;
    composer: string;
    performers: string;
}
const programData: ProgramItem[] = [
    {
        title: "July",
        composer: "Lyn Lapid",
        performers: "Aivant Goyal",
    },
    {
        title: "wish",
        composer: "chriung",
        performers: "Chris Chung",
    },
    {
        title: "Maine",
        composer: "Noah Kahan",
        performers: "Alvin Adjei",
    },
    {
        title: "The Piphany",
        composer: "Luis",
        performers: "Luis",
    },
    {
        title: "Civic Center / UN Plaza",
        composer: "April Chen",
        performers: "April Chen",
    },
    {
        title: "Big T's First DJ set",
        composer: "Big T (lovers by choice)",
        performers: "Big T (cousins by chance)",
    },
    {
        title: "Vulnerable",
        composer: "Tiffany Day",
        performers: "Aivant Goyal",
    },
    {
        title: "run away",
        composer: "chriung",
        performers: "Chris Chung",
    },
    {
        title: "Closer",
        composer: "Alvin Adjei",
        performers: "Alvin Adjei",
    },
    {
        title: "Liebestod (Paraphrase of Tristan und Isolde)",
        composer: "Liszt",
        performers: "April Chen",
    },
    {
        title: "Vienna",
        composer: "Billy Joel",
        performers: "Alvin Adjei (accompanied by April)",
    },
];

export async function POST(request: NextApiRequest, response: NextApiResponse) {
    try {
        const requestData = request.body


        // Get 3-5 random performances from programData
        const numPerformances = Math.floor(Math.random() * 3) + 3 // Random number between 3-5
        const shuffled = [...programData].sort(() => 0.5 - Math.random())
        const selectedPerformances = shuffled.slice(0, numPerformances)

        // Create performances data with order
        const performances = selectedPerformances.map((perf, index) => ({
            ...perf,
            order: index + 1
        }))

        const concertData = {
            ...requestData,
            date: new Date(requestData.date),
            performances: {
                create: performances
            }
        }

        const concert = await prisma.concert.create({
            data: concertData,
            include: {
                performances: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        })

        return response.send(concert)
    } catch (error) {
        console.error('Error creating concert:', error)
        return response.send({ error: 'Failed to create concert' })
    } finally {
        await prisma.$disconnect()
    }
}

export default function requestHandler(request: NextApiRequest, response: NextApiResponse) {
    if (request.method === 'GET') {
        return GET(request, response)
    } else if (request.method === 'POST') {
        return POST(request, response)
    }
}   