import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from '@/components/ui/provider'

function RecitalBanner() {
  return (
    <a
      href="https://sfsalon.art/recital"
      style={{
        display: 'block',
        background: '#bfdbfe',
        color: '#1e3a5f',
        textAlign: 'center',
        padding: '10px 16px',
        fontSize: '15px',
        fontWeight: 500,
        textDecoration: 'none',
      }}
    >
      Salon Recital is coming soon! <span style={{ textDecoration: 'underline' }}>Fill out this form</span> to help us plan it 🎶
    </a>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider>
      <RecitalBanner />
      <Component {...pageProps} />
    </Provider>
  );
}
