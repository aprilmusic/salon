import Head from "next/head";
import { Cormorant_Garamond } from "next/font/google";
import Concert from "@/components/Concert";
import { Box } from "@chakra-ui/react";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
});

export default function Home() {
  return (
    <>
      <Head>
        <title>SFSalon.art</title>
        <meta name="description" content="Home-brewed concerts in the heart of San Francisco" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Box
        as="main"
        minH="100vh"
        bgGradient="linear-gradient(#fff8e1, #ffe0b2)"
        py={16}
        px={8}
        fontFamily={cormorant.className}
      >
        <Concert />
      </Box>
    </>
  );
}
