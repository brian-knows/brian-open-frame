import { fetchMetadata } from "frames.js/next";
import { Metadata } from "next";
import { cloneElement } from "react";

export async function generateMetadata(): Promise<Metadata> {
  console.log("Generating metadata");
  return {
    title: "Open Frames Next.js Example",
    other: {
      ...(await fetchMetadata(
        new URL(
          "/frames",
          process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "http://localhost:3000"
        )
      )),
    },
  };
}

export default async function Home() {
  return <div>Open Frames Next.js Example</div>;
}
