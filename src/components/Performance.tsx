import { Heading } from "@chakra-ui/react";
import { Text, Card } from "@chakra-ui/react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "600"],
});


export default function Performance({ title, composer, performers }: { title: string, composer: string, performers: string }) {
    return (
        <Card.Root
            bg="rgba(255, 255, 255, 0.8)"
            backdropFilter="blur(8px)"
            borderColor="#ffe082"
        >
            <Card.Body p={4} fontFamily={playfair.className}>
                <Heading
                    as="h1"
                    size="lg"
                    fontSize="1.5rem"
                    color="#ef6c00" // amber-800
                    mb={4}
                    fontFamily={playfair.className}
                >
                    {title}
                </Heading>
                <Text color="#ffa000" fontSize="md" mb={2}>
                    Composer: {composer}
                </Text>
                <Text color="#ffb300" fontSize="md">
                    Performers: {performers}
                </Text>
            </Card.Body>
        </Card.Root>
    );
}