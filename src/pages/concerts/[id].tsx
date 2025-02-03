import { Box } from "@chakra-ui/react";
import { Cormorant_Garamond } from "next/font/google";
import Concert from "@/components/Concert";

const cormorant = Cormorant_Garamond({
    subsets: ["latin"],
    weight: ["300", "400", "600"],
});

export default function ConcertPage({ id }: { id: string }) {
    return (
        <Box
            as="main"
            minH="100vh"
            bgGradient="linear-gradient(#fff8e1, #ffe0b2)"
            py={16}
            px={8}
            fontFamily={cormorant.className}
        >
            <Concert id={id} />
        </Box>
    );
}

