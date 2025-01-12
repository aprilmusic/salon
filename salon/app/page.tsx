import ConcertProgram from "./components/ConcertProgram";
import { Cormorant_Garamond, Playfair_Display } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600"],
});

export default function Home() {
  return (
    <main
      className={`min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 py-16 ${cormorant.className}`}
    >
      <div className="container mx-auto px-8">
        <h1
          className={`text-5xl font-semibold text-center mb-12 text-amber-800 ${playfair.className}`}
        >
          Salon (Jan 12, 2024)
        </h1>
        <ConcertProgram />
      </div>
    </main>
  );
}
