import { Button } from "frames.js/next";
import { getBrianTransactionOptions } from "../../lib/kv";
import { getFrameMessage } from "frames.js/getFrameMessage";
import { formatUnits } from "viem";
import { TransactionCalldataRequestStatus } from "../../lib/brian-api";
import { frames } from "../frames";
import { getURL } from "@/app/lib/url-utils";
import { XmtpFrameMessageReturnType } from "frames.js/xmtp";

const handleRequest = frames(async (ctx) => {
  const url = new URL(ctx.request.url);
  
  const { searchParams } = url;
  const requestId = searchParams.get("id");
  const status = searchParams.get("status");
  let connectedAddress: `0x${string}`;

  if (ctx.clientProtocol?.id === "xmtp") {
    connectedAddress = (ctx.message as unknown as XmtpFrameMessageReturnType)
      .verifiedWalletAddress as `0x${string}`;
  } else {
    const body = await ctx.request.json();
    const message = await getFrameMessage(body);
    connectedAddress = message.requesterVerifiedAddresses[0] as `0x${string}`;
  }
  if (status === "start") {
    const inputText = ctx.message?.inputText;
    const address = connectedAddress;

    const res = await fetch(`${getURL()}/frames/api/brian-task`, {
      method: "POST",
      headers: {
        "x-secret": process.env.SECRET!,
      },
      body: JSON.stringify({
        prompt: inputText,
        address: address,
        id: requestId,
      }),
    });
    if (!res.ok) {
      return {
        image: `${getURL()}/images/error.png`,
        imageOptions: {
          aspectRatio: "1:1",
        },
        buttons: [
             <Button action="post" target={{pathname:`/captcha/validate`, search:`id=${requestId}`}}>
             🔢 Submit captcha
           </Button>,
        ]
       
      };
    }
  }

  const { result: txOptions, status: requestStatus } =
    await getBrianTransactionOptions(requestId!);

  if (requestStatus === TransactionCalldataRequestStatus.ERROR) {
    return {
      image: `${getURL()}/images/error.png`,
      imageOptions: {
        aspectRatio: "1:1",
      },
      buttons: [
        <Button action="post" target={{pathname:`/build`, search:`id=${requestId}&restart=true`}}>
          🔢 Submit prompt
        </Button>,
      ],
    };
  }

  if (requestStatus === TransactionCalldataRequestStatus.LOADING) {
    const requestTimestamp = searchParams.get("requestTimestamp");
    const timeDiff = Date.now() - parseInt(requestTimestamp!);

    // check if more than 30 seconds passed
    if (timeDiff > 1000 * 30) {
      return {
        image: `${getURL()}/images/loading-timeout.png`,
        imageOptions: {
          aspectRatio: "1:1",
        },
        buttons: [
          <Button action="post" target={{pathname:`/loading`, search:`id=${requestId}&requestTimestamp=${requestTimestamp}&status=loading`}}>
          🔢 Submit prompt
          </Button>,
          <Button action="post" target={{pathname:`/build`, search:`id=${requestId}&restart=true`}}>
          🔄 Try again
          </Button>,
        ],
      };
    }
    return {
      image: `${getURL()}/images/loading.gif`,
      imageOptions: {
        aspectRatio: "1:1",
      },
      buttons: [
        <Button action="post" target={{pathname:`/loading`, search:`id=${requestId}&requestTimestamp=${requestTimestamp}&status=loading`}}>
        💬 Show response
        </Button>,
      ],
    };
  }
  // return image depending on the txOptions action
  if(txOptions!.action === "transfer") {
    return {
      image: (
        <div tw="relative flex items-center justify-center">
          <img
            src={`${getURL()}/images/options-1.png`}
            tw="absolute"
          />
          <div tw="text-white flex flex-col mt-16">
            <div
              key={txOptions!.action}
              tw="flex flex-row items-center justify-start rounded-lg bg-[#030620] px-4 h-[110px] w-[350px] mb-4"
            >
              <div tw="flex flex-col items-center mr-4">
                <img
                  src={txOptions!.data.fromToken.logoURI}
                  alt={`${txOptions!.data.fromToken.symbol} logo`}
                  tw="w-6 h-6 mb-2"
                />
                <img
                  src={txOptions!.data.toToken.logoURI}
                  alt={`${txOptions!.data.toToken.symbol} logo`}
                  tw="w-6 h-6"
                />
              </div>
              <div tw="flex flex-col text-[10px]">
                <div tw="flex">
                  <span tw="text-gray-500 mr-1">From:</span>{" "}
                  {txOptions!.data.fromToken.symbol}
                </div>
                <div tw="flex">
                  <span tw="text-gray-500 mr-1">To:</span>{" "}
                  {txOptions!.data.toToken.symbol}
                </div>
                <div tw="flex">
                <span tw="text-gray-500 mr-1">From Chain ID:</span>{" "}
                {txOptions!.data.fromChainId}
                </div>
                <div tw="flex">
                  <span tw="text-gray-500 mr-1">To Chain ID:</span>{" "}
                  {txOptions!.data.toChainId}
                </div>
              <div tw="flex">
                <span tw="text-gray-500 mr-1">Receiver:</span>{" "}
                {txOptions!.data.receiver}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
      imageOptions: {
        aspectRatio: "1:1",
        width: 400,
        height: 400,
      },
      buttons: [
        <Button action="post" target={{pathname:`/confirm`, search:`id=${requestId}&action=${"build"}`}}>
        ✅ Execute Route
        </Button>,
        <Button action="post" target={{pathname:`/build`, search:`id=${requestId}&restart=true`}}>
        ↩️ Start over
        </Button>,
      ] as any,
    };
  } else if(txOptions!.action === "swap" || txOptions!.action === "bridge" || txOptions!.action === "unwrap native" || txOptions!.action === "wrap native") {
    return {
      image: (
        <div tw="relative flex items-center justify-center">
      <img src={`${getURL()}/images/options-1.png`} tw="absolute" />
      <div tw="text-white flex flex-col mt-16">
        <div
          key={txOptions!.action}
          tw="flex flex-row items-center justify-start rounded-lg bg-[#030620] px-2 h-[450px] w-[1000px] mb-4"
        >
          <div tw="flex flex-col text-[30px] flex-grow">
            <div tw="flex">
              <span tw="text-gray-500 mr-1">From:</span>{" "}
              {txOptions!.data.fromToken.symbol}
              <img
                src={txOptions!.data.fromToken.logoURI}
                alt={`${txOptions!.data.fromToken.symbol} logo`}
                tw="w-8 h-8 mb-4 ml-2"
              />
            </div>
            <div tw="flex">
              <span tw="text-gray-500 mr-1">To:</span>{" "}
              {txOptions!.data.toToken.symbol}
              <img
                src={txOptions!.data.toToken.logoURI}
                alt={`${txOptions!.data.toToken.symbol} logo`}
                tw="w-8 h-8 mb-4 ml-2"
              />
            </div>
            <div tw="flex">
              <span tw="text-gray-500 mr-1">From Chain ID:</span>{" "}
              {txOptions!.data.fromChainId}
            </div>
            <div tw="flex">
              <span tw="text-gray-500 mr-1">To Chain ID:</span>{" "}
              {txOptions!.data.toChainId}
            </div>
            <div tw="flex">
              <span tw="text-gray-500 mr-1">Solver:</span>{" "}
              {txOptions!.solver}
            </div>
            <div tw="flex">
              <span tw="text-gray-500 mr-1">Receive min:</span>{" "}
              {Number(
                formatUnits(
                  BigInt(txOptions!.data.toAmountMin),
                  txOptions!.data.toToken.decimals
                ).toString()
              ).toFixed(8)}{" "}
              {txOptions!.data.toToken.symbol}{" "}
              <span tw="text-gray-500">
                ({Number(txOptions!.data.toAmountUSD).toFixed(2)} USD)
              </span>
            </div>
            <div tw="flex">
              <span tw="text-gray-500 mr-1">Receiver:</span>{" "}
              {txOptions!.data.receiver}
            </div>
          </div>
        </div>
      </div>
    </div>
    ),
      imageOptions: {
        aspectRatio: "1:1",
        width: 400,
        height: 400,
      },
      buttons: [
        <Button action="post" target={{pathname:`/confirm`, search:`id=${requestId}&action=build`}}>
        ✅ Execute Route
        </Button>,
        <Button action="post" target={{pathname:`/build`, search:`id=${requestId}&restart=true`}}>
        ↩️ Start over
        </Button>,
      ] as any,
    };
  } else {
    return {
      image: `${getURL()}/images/error.png`,
      imageOptions: {
        aspectRatio: "1:1",
      },
      buttons: [
        <Button action="post" target={{pathname:`/build`, search:`id=${requestId}&restart=true`}}>
        🔄 Try again
        </Button>,
      ],
    };
  } 
});

export const GET = handleRequest;
export const POST = handleRequest;
