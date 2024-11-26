import localFont from "next/font/local";

export const GeistSans = localFont({
  src: [
    {
      path: "/fonts/GeistSans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "/fonts/GeistSans-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-geist-sans",
});