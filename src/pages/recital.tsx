import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "https://forms.gle/GFWLmYwFCemQE9z8A",
      permanent: false,
    },
  };
};

export default function Recital() {
  return null;
}
