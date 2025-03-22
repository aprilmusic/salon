import { Button, Heading } from "@chakra-ui/react";
import { Text, Card } from "@chakra-ui/react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "600"],
});

const handleDeletePerformance = async (id: string) => {
    try {
        const response = await fetch('/api/performances', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id })
        })
        if (!response.ok) {
            throw new Error('Failed to delete performance')
        }
        window.location.reload()
    } catch (error) {
        console.error('Error deleting performance:', error)
    }
}

export default function Performance({ title, composer, performers, id }: { title: string, composer: string, performers: string, id: string }) {
    return (
        <Card.Root
            bg="var(--background)"
            backdropFilter="blur(8px)"
            borderColor="var(--border)"
        >
            <Card.Body p={4} fontFamily={playfair.className}>
                <Heading
                    as="h1"
                    size="lg"
                    fontSize="1.5rem"
                    color="var(--text-primary)" // amber-800
                    mb={4}
                    fontFamily={playfair.className}
                >
                    {title}
                </Heading>
                <Text color="var(--text-secondary)" fontSize="md" mb={2}>
                    Composer: {composer}
                </Text>
                <Text color="var(--text-tertiary)" fontSize="md">
                    Performers: {performers}
                </Text>
            </Card.Body>
            <Card.Footer display="flex" justifyContent="flex-end" p={4}>
                <Button variant="outline" colorScheme="red" onClick={() => handleDeletePerformance(id)}>Delete</Button>
            </Card.Footer>
        </Card.Root>
    );
}