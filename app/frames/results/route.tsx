import { Button } from "frames.js/next";
import { getFrameMessage } from "frames.js/getFrameMessage";
import { frames } from "../frames";
import { arbitrum, base } from "viem/chains";
import { validateFrameMessage } from "../../lib/pinata";
import { getURL } from "@/app/lib/url-utils";

const handleRequest = frames(async (ctx) => {
  const body = await ctx.request.json();
  const url = new URL(ctx.request.url);
  const { searchParams } = url;
  const requestId = searchParams.get("id");
  const chainId = searchParams.get("chainId");
  const message = await getFrameMessage(body);
  const txBaseUrl =
    parseInt(chainId!) === base.id
      ? `https://basescan.org/tx/` :
      parseInt(chainId!) === arbitrum.id ?
       `https://arbiscan.io/tx/` : 
       `https://optimistic.etherscan.io/tx/`
  return {
    postUrl: "/captcha/validate?id=",
    image: `${getURL()}/images/end.png`,
    imageOptions: {
      aspectRatio: "1:1",
    },
    buttons: [
        <Button action="link" target={`${txBaseUrl}${message.transactionId}`}>
        🔗 Transaction
        </Button>,

        <Button action="link" target={`https://docs.brianknows.org/`}>
        📚 Brian API
        </Button>,

        <Button action="post" target={{pathname:`/build`, search:`id=${requestId}&restart=${"true"}`}}>
         ↩️ Start again
        </Button>,
    ],
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
