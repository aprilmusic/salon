import Head from "next/head";
import { Cormorant_Garamond } from "next/font/google";
import Concert from "@/components/Concert";
import { Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { GetLatestConcertResponse, getLatestConcertResponseSchema } from "./api/concerts/latest";
import { Spinner } from "@chakra-ui/react"
import { useAdmin } from "@/lib/hooks/useAdmin";


const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
});

export default function Home() {
  const [concert, setConcert] = useState<GetLatestConcertResponse | null>(null);
  const { isAdmin } = useAdmin();

  useEffect(() => {
    async function fetchLatestConcert() {
      try {
        const response = await fetch('/api/concerts/latest');
        const data = await response.json();
        setConcert(getLatestConcertResponseSchema.parse(data));
      } catch (error) {
        console.error('Error fetching latest concert:', error);
      }
    }
    fetchLatestConcert();
  }, []);

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
        bgGradient="var(--background)"
        py={16}
        px={8}
        fontFamily={cormorant.className}
      >
        {isAdmin && (
          <div className="text-4xl mb-4 text-center">🎵</div>
        )}
        {concert?.success ? (
          <Concert concert={concert.result} />) : (<Spinner />)}
      </Box>
    </>
  );
}
