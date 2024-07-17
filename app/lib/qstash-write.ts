import { Client } from "@upstash/qstash";
import { appURL } from "./url-utils";

const qstashClient = new Client({
  // Add your token to a .env file
  token: process.env.QSTASH_TOKEN!,
});

export async function createNewBrianTask(
  id: string,
  prompt: string,
  address: string
) {
  console.log("qstash-write", appURL());
  const message = await qstashClient.publishJSON({
    url: `${appURL()}/frames/api/brian-worker`,
    body: {
      prompt,
      address,
      id,
    },
  });
  console.log("Task created:", message);
}
