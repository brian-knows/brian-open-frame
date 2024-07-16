import fs from "node:fs";
import * as path from "node:path";
import { headers } from "next/headers";
import { createPublicClient, http, parseEther, parseUnits } from "viem";
import { arbitrum, base, optimism } from "viem/chains";
import { ERC20_ABI } from "./constants/erc20";

// function to check token allowance
export async function checkAllowance(
  tokenAddress: string, //fromToken address returned from brian
  owner: string, // user wallet connected
  spender: string, // "toAddress" address returned from brian
  chainId: number // fromChainId returned from brian
): Promise<bigint> {
  console.log("Checking allowance", tokenAddress, owner, spender, chainId);
  return BigInt(0);
}

// function to check token allowance
export async function checkAllowance2(
  tokenAddress: string, //fromToken address returned from brian
  owner: string, // user wallet connected
  spender: string, // "toAddress" address returned from brian
  chainId: number // fromChainId returned from brian
): Promise<bigint> {
  let chain;
  if (chainId === 10) {
    chain = optimism;
  } else if (chainId === 8453) {
    chain = base;
  } else if (chainId === 42161) {
    chain = arbitrum;
  }
  const publicClient = createPublicClient({
    chain: chain,
    transport: http(),
  });
  console.log("Checking allowance", tokenAddress, owner, spender);
  const allowance = await publicClient.readContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [owner, spender],
  });
  console.log("Allowance", allowance);

  return allowance as bigint;
}

const DEFAULT_DEBUGGER_URL =
  process.env.DEBUGGER_URL ?? "http://localhost:3010/";

export const DEFAULT_DEBUGGER_HUB_URL =
  process.env.NODE_ENV === "development"
    ? new URL("/hub", DEFAULT_DEBUGGER_URL).toString()
    : undefined;

export function currentURL(pathname: string): URL {
  const headersList = headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "http";

  try {
    return new URL(pathname, `${protocol}://${host}`);
  } catch (error) {
    return new URL("http://localhost:3000");
  }
}

export function vercelURL() {
  return process.env.NEXT_PUBLIC_APP_URL
    ? process.env.NEXT_PUBLIC_APP_URL
    : "http://localhost:3000";
}

export function appURL() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  } else {
    const url =
      process.env.NEXT_PUBLIC_APP_URL || vercelURL() || "http://localhost:3000";
    return url;
  }
}

export function createDebugUrl(frameURL: string | URL): string {
  try {
    const url = new URL("/", DEFAULT_DEBUGGER_URL);

    url.searchParams.set("url", frameURL.toString());

    return url.toString();
  } catch (error) {
    return "#";
  }
}

export const FRAMES_BASE_PATH = "/frames";

const regularFontData = fs.readFileSync(
  path.join(process.cwd(), "public/assets", "BricolageGrotesque-Regular.ttf")
);

const boldFontData = fs.readFileSync(
  path.join(process.cwd(), "public/assets", "BricolageGrotesque-Bold.ttf")
);
export const imageOptions = {
  debug: false,
  width: 1080,
  height: 1080,
  fonts: [
    {
      data: regularFontData,
      name: "Bricolage-Regular",
    },
    {
      data: boldFontData,
      name: "Bricolage-Bold",
    },
  ],
};
