import { Card, CardContent } from "./ui/card";
import { Playfair_Display } from "next/font/google";

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
    title: "Liebestod (Paraphrase of Tristan und Isolde)",
    composer: "Liszt",
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
    title: "Civic Center / UN Plaza",
    composer: "April Chen",
    performers: "April Chen",
  },
];

export default function ConcertProgram() {
  return (
    <div className="space-y-8">
      {programData.map((item, index) => (
        <Card
          key={index}
          className="bg-white/80 backdrop-blur-sm border-amber-200"
        >
          <CardContent className="p-4">
            <h2
              className={`text-2xl font-semibold text-amber-800 mb-4 ${playfair.className}`}
            >
              {item.title}
            </h2>
            <p className="text-amber-700 text-lg mb-2">
              Composer: {item.composer}
            </p>
            <p className="text-amber-600 text-lg">
              Performers: {item.performers}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
