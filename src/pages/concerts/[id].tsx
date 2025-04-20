import { Box } from "@chakra-ui/react";
import { Playfair_Display } from "next/font/google";
import Concert from "@/components/Concert";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { GetConcertByIdResponse, getConcertByIdResponseSchema } from "../api/concerts/[id]";
import { Spinner } from "@chakra-ui/react"

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "600"],
});

export default function ConcertPage() {
    const [concert, setConcert] = useState<GetConcertByIdResponse | null>(null);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        async function fetchConcert() {
            try {
                const response = await fetch('/api/concerts/' + id);
                const data = await response.json();
                console.log(data)
                setConcert(getConcertByIdResponseSchema.parse(data));
            } catch (error) {
                console.error('Error fetching latest concert:', error);
            }
        }
        fetchConcert();
    }, [id]);

    return (
        <Box
            as="main"
            minH="100vh"
            bg="var(--background)"
            className={playfair.className}
        >
            <div className="content-container">
                <Box py={4} px={3}>
                    {concert?.success ? (
                        <Concert concert={concert.result} />
                    ) : (
                        <Spinner />
                    )}
                </Box>
            </div>
        </Box>
    );
}

