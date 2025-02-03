"use client"

import { Playfair_Display } from "next/font/google";
import { useEffect, useState } from "react";
import { Box, Card, Text, Container, Heading } from "@chakra-ui/react";
import { Concert, Performance } from "@prisma/client";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "600"],
});

type ConcertWithPerformances = Concert & {
    performances: Performance[]
}


export default function ConcertListPage() {
    const [concerts, setConcerts] = useState<ConcertWithPerformances[]>([]);
    console.log(concerts)
    useEffect(() => {
        async function fetchConcerts() {
            try {
                const response = await fetch('/api/concerts');
                const data = await response.json();
                setConcerts(data);
            } catch (error) {
                console.error('Error fetching concerts:', error);
            }
        }
        console.log('fetching concerts')
        fetchConcerts();
    }, []);


    return (
        <Container maxW="container.xl" px={8}>
            <Heading
                as="h1"
                size="2xl"
                textAlign="center"
                mb={12}
                color="#ff8f00"
                fontFamily={playfair.className}
                fontWeight="semibold"
            >
                All concerts
            </Heading>
            <Box display="flex" flexDirection="column" gap={8}>
                {concerts.map((concert) => (
                    <Card.Root
                        key={concert.id}
                        bg="rgba(255, 255, 255, 0.8)"
                        backdropFilter="blur(8px)"
                        borderColor="#ffe082"
                    >
                        <Card.Body p={4} fontFamily={playfair.className}>
                            <Heading
                                as="h2"
                                size="lg"
                                fontSize="1.5rem"
                                color="#ef6c00"
                                mb={4}
                                fontFamily={playfair.className}
                            >
                                {new Date(concert.date).toLocaleDateString()}
                            </Heading>
                            <Box display="flex" flexDirection="column" gap={4}>
                                {concert.performances.map((performance) => (
                                    <Box key={performance.id}>
                                        <Text color="#ffa000" fontSize="md" mb={2}>
                                            {performance.title}
                                        </Text>
                                    </Box>
                                ))}
                            </Box>
                        </Card.Body>
                    </Card.Root>
                ))}
            </Box>
        </Container>
    );
}