import Performance from "./Performance";
import { Playfair_Display } from "next/font/google";
import { Box, Container, Heading, Text } from "@chakra-ui/react";
import { useState, useEffect } from 'react';

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "600"],
});

export default function Concert({ id }: { id: string | undefined }) {
    const [concert, setConcert] = useState<{
        date: Date;
        performances: Array<{
            title: string;
            composer: string;
            performers: string;
        }>;
    } | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchConcert() {
            try {
                const url = id ? `/api/concerts/${id}` : '/api/concerts/latest';
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Failed to fetch concert');
                }
                const data = await response.json();
                setConcert(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setIsLoading(false);
            }
        }

        fetchConcert();
    }, [id]);

    if (isLoading) {
        return <Container maxW="container.xl" px={8}><Text>Loading...</Text></Container>;
    }

    if (error) {
        return <Container maxW="container.xl" px={8}><Text color="red.500">{error}</Text></Container>;
    }

    if (!concert) {
        return <Container maxW="container.xl" px={8}><Text>Concert not found</Text></Container>;
    }

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
                Salon ({new Date(concert.date).toLocaleDateString()})
            </Heading>
            <Box display="flex" flexDirection="column" gap={8}>
                {concert.performances.map((item, index) => (
                    <Performance
                        key={index}
                        title={item.title}
                        composer={item.composer}
                        performers={item.performers}
                    />
                ))}
            </Box>
        </Container>
    );
}