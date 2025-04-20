import Head from "next/head";
import { Alex_Brush, Playfair_Display } from "next/font/google";
import Concert from "@/components/Concert";
import { Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { GetLatestConcertResponse, getLatestConcertResponseSchema } from "./api/concerts/latest";
import { Spinner } from "@chakra-ui/react"
import { useAdmin } from "@/lib/hooks/useAdmin";


const alexBrush = Alex_Brush({
  subsets: ["latin"],
  weight: ["400"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600"],
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
        bg="var(--background)"
        className={playfair.className}
      >
        <div className="content-container">
          <Box py={16} px={8}>
            {isAdmin && (
              <div className={`text-4xl mb-4 text-center ${alexBrush.className}`}>🎵</div>
            )}
            {concert?.success ? (
              <Concert concert={concert.result} />) : (<Spinner />)}
          </Box>
        </div>
      </Box>
    </>
  );
}
