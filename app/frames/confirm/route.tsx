import { Button } from "frames.js/next";
import { getBrianTransactionOptions } from "../../lib/kv";
import { getFrameMessage } from "frames.js/getFrameMessage";
import { frames } from "../frames";
import { NATIVE } from "../../lib/constants/utils";
import { createPublicClient, http } from "viem";
import { formatUnits } from "ethers/lib/utils";
import { XmtpFrameMessageReturnType } from "frames.js/xmtp";
import { appURL } from "@/app/lib/url-utils";
import { extractChain } from "viem";
import { mainnet, base, optimism, arbitrum } from "viem/chains";
import { ERC20_ABI } from "@/app/lib/constants/erc20";

const handleRequest = frames(async (ctx) => {
  const url = new URL(ctx.request.url);
  const { searchParams } = url;
  const requestId = searchParams.get("id");
  const action = searchParams.get("action");
  const txData = await getBrianTransactionOptions(requestId!);

  let connectedAddress: `0x${string}`;
  console.log("ctx.clientProtocol?.id", ctx.clientProtocol?.id);

  if (ctx.clientProtocol?.id === "xmtp") {
    connectedAddress = (ctx.message as unknown as XmtpFrameMessageReturnType)
      .verifiedWalletAddress as `0x${string}`;
  } else {
    const body = await ctx.request.json();
    const message = await getFrameMessage(body);
    connectedAddress = message.requesterVerifiedAddresses[0] as `0x${string}`;
  }

  const from = txData.result?.data.steps[0]?.from;
  const isETH = txData.result?.data?.fromToken.address! === NATIVE;
  const fromAmountNormalized = formatUnits(
    txData?.result?.data.fromAmount!,
    txData?.result?.data.fromToken!.decimals
  );
  const shortAddress =
    connectedAddress?.slice(0, 6) + "..." + connectedAddress?.slice(-4);
  const routerSolver = txData.result?.solver === "Enso" ? "Enso" : "Lifi";
  // problem is here
  let chainId;
  if (txData.result?.data.steps[0]!.chainId! === 10) {
    chainId = optimism.id;
  } else if (txData.result?.data.steps[0]!.chainId! === 8453) {
    chainId = base.id;
  } else if (txData.result?.data.steps[0]!.chainId! === 42161) {
    chainId = arbitrum.id;
  } else if (txData.result?.data.steps[0]!.chainId! === 1) {
    chainId = mainnet.id;
  }
  // from chainid to chain
  const chain = extractChain({
    chains: [mainnet, base, optimism, arbitrum],
    id: chainId!,
  });

  const publicClient = createPublicClient({
    chain: chain,
    transport: http(),
  });

  let allowance;
  if (txData.result?.data.fromToken.address! !== NATIVE) {
    allowance = (await publicClient.readContract({
      address: txData.result?.data.fromToken.address! as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [
        connectedAddress,
        txData.result?.data.steps[0]!.to! as `0x${string}`,
      ],
    })) as BigInt;
  }
  console.log("allowance", allowance);

  if (action === "approve") {
    // add a time delay here
    await new Promise((r) => setTimeout(r, 3000));
  }

  if (
    txData.result?.data.fromToken.address! !== NATIVE &&
    Number(allowance) < BigInt(txData.result?.data.fromAmount!)
  ) {
    return {
      image: (
        <div tw="relative flex items-center justify-center">
          <img src={`${appURL()}/images/approve.png`} tw="absolute" />
          <div tw="text-white flex flex-col mt-16">
            <div
              key={txData!.result?.action}
              tw="flex flex-row items-center justify-start rounded-lg bg-[#030620] px-4 h-[200px] w-[900px] mb-4"
            >
              <div tw="flex flex-col text-white text-[40px] ">
                <div tw="flex">
                  <span tw="text-gray-500 mr-1">You (</span>
                  <span tw="text-gray-500 mr-1">{shortAddress}</span>
                  <span tw="text-gray-500">) are going to approve </span>
                </div>
                <div tw="flex">
                  <span tw="text-gray-500">
                    {routerSolver} router to spend {fromAmountNormalized}{" "}
                    {txData.result?.data?.fromToken.symbol!}
                  </span>
                </div>
                <div tw="flex">
                  <span tw="text-gray-500">
                    {" "}
                    for the {txData.result?.action!} transaction{" "}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      imageOptions: {
        aspectRatio: "1:1",
      },
      buttons: [
        <Button
          action="tx"
          target={{
            pathname: `/api/approve-calldata`,
            search: `id=${requestId}`,
          }}
          post_url={`/confirm?id=${requestId}&action=approve`}
        >
          ✅ Approve
        </Button>,

        <Button
          action="post"
          target={{
            pathname: `/confirm`,
            search: `id=${requestId}&action=${"refresh"}`,
          }}
        >
          🔁 Refresh
        </Button>,

        <Button
          action="post"
          target={{ pathname: `/loading`, search: `id=${requestId}` }}
        >
          ↩️ Go back
        </Button>,
      ],
    };
  }

  return {
    image: (
      <div tw="relative flex items-center justify-center">
        <img src={`${appURL()}/images/selected.png`} tw="absolute" />
        <div tw="relative z-10 flex flex-col items-center pt-8 px-8">
          <div tw=" text-white text-[30px] text-center">
            {txData.result?.data.description}
          </div>
          {connectedAddress?.toLowerCase() !== from?.toLowerCase() && (
            <div tw="text-[16px] text-amber-500 mt-2">
              Make sure to use your Farcaster connected wallet.
            </div>
          )}
        </div>
      </div>
    ),
    imageOptions: {
      aspectRatio: "1:1",
    },
    buttons: [
      <Button
        action="tx"
        target={{ pathname: `/api/calldata`, search: `id=${requestId}` }}
        post_url={`/results?id=${requestId}&chainId=${txData.result?.data
          .steps[0]!.chainId!}`}
      >
        ✅ Confirm
      </Button>,

      <Button
        action="post"
        target={{ pathname: `/loading`, search: `id=${requestId}` }}
      >
        ❌ Reject
      </Button>,
    ],
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
