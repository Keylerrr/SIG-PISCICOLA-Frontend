import { Comic_Neue } from "next/font/google";
import "./globals.css";

const comicNeue = Comic_Neue({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
  variable: "--font-comic",
});

export const metadata = {
  title: "Póngase Trucha",
  description: "App piscícola",
  icons: {
    icon: "/images/PongaseTrucha.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${comicNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}