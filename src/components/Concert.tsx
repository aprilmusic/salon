import Performance from "./Performance";
import { Playfair_Display } from "next/font/google";
import { Box, Container, Heading } from "@chakra-ui/react";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "600"],
});

type ProgramItem = {
    title: string;
    composer: string;
    performers: string;
};

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

export default function Concert() {
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
                Salon (Jan 12, 2024)
            </Heading>
            <Box display="flex" flexDirection="column" gap={8}>
                {programData.map((item, index) => (
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