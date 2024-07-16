import { kv } from "@vercel/kv";
import { TransactionCalldataResponse } from "@/app/lib/brian-api";
import { ENSO_ROUTER_ABI, LIFI_DIAMOND_PROXY_ABI } from "@/app/lib/constants/lifi-diamond-proxy-abi";
import { transaction } from "frames.js/core";
import { Abi} from "viem";



export const POST = async (req: Request) => {
  const url = new URL(req.url);
  const { searchParams } = url;
  const requestId = searchParams.get("id");
  
  //return NextResponse.json(txCalldata);
  const transactionCalldata = await kv.get<TransactionCalldataResponse>(
    `request/${requestId}`
  );
  // get from chain id
  const fromChainId = transactionCalldata?.result?.data.steps[0]?.chainId;
  // get the transaction calldata of the chosen transaction object
  const transactionCalldataForUser =
    transactionCalldata?.result?.data.steps[0]?.data;
  // get the transaction value of the chosen transaction object
  const transactionValue = transactionCalldata?.result?.data.steps[0]?.value;
  // get the transaction to address of the chosen transaction object
  const transactionToAddress = transactionCalldata?.result?.data.steps[0]?.to;
  // set abi for the transaction object
  const abi = transactionToAddress === "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE" ? LIFI_DIAMOND_PROXY_ABI : ENSO_ROUTER_ABI;
  
  return transaction({
    chainId: "eip155:".concat(fromChainId!.toString()),
    method: "eth_sendTransaction",
    //attribution: false,
    params: {
      abi: abi as Abi, 
      to: transactionToAddress as `0x${string}`,
      data: transactionCalldataForUser as `0x${string}`,
      value: transactionValue,
    },
  });
};
