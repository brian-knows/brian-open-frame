import { fetchMetadata } from "frames.js/next";
import { Metadata } from "next";
import { appURL } from "./lib/url-utils";

export async function generateMetadata(): Promise<Metadata> {
  console.log("Generating metadata");
  return {
    title: "Open Frames Next.js Example",
    other: {
      ...(await fetchMetadata(new URL("/frames", appURL()))),
    },
  };
}

export default async function Home() {
  return <div>Open Frames Next.js Example</div>;
}
