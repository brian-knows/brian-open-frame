import { Button } from "frames.js/next";
import { frames } from "../frames";
import { arbitrum, base } from "viem/chains";
import { appURL } from "@/app/lib/url-utils";

const handleRequest = frames(async (ctx) => {
  const url = new URL(ctx.request.url);
  const { searchParams } = url;
  const requestId = searchParams.get("id");
  const chainId = searchParams.get("chainId");
  const txBaseUrl =
    parseInt(chainId!) === base.id
      ? `https://basescan.org/tx/`
      : parseInt(chainId!) === arbitrum.id
      ? `https://arbiscan.io/tx/`
      : `https://optimistic.etherscan.io/tx/`;
  return {
    postUrl: "/captcha/validate?id=",
    image: `${appURL()}/images/end.png`,
    imageOptions: {
      aspectRatio: "1:1",
    },
    buttons: [
      <Button
        action="link"
        target={`${txBaseUrl}${ctx.message?.transactionId}`}
      >
        🔗 Transaction
      </Button>,

      <Button action="link" target={`https://docs.brianknows.org/`}>
        📚 Brian API
      </Button>,

      <Button
        action="post"
        target={{
          pathname: `/build`,
          search: `id=${requestId}&restart=${"true"}`,
        }}
      >
        ↩️ Start again
      </Button>,
    ],
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
