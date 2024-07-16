import { Button } from "frames.js/next";
import { frames } from "./frames";
import { vercelURL } from "../lib/utils";
import { getURL } from "../lib/url-utils";

const handleRequest = frames(async (ctx) => {
  console.log("handleRequest");
  return {
    image: `${getURL()}/images/intro.gif`,
    postUrl: "https://brianknows.org",
    imageOptions: {
      aspectRatio: "1:1",
    },
    buttons: [
      <Button action="post" key="1" target="/captcha">
        🤖 Start
      </Button>,
      <Button action="post" key="2" target="/instructions">
        ℹ️ Instructions
      </Button>,
      <Button action="link" key="3" target="https://www.brianknows.org/">
        📚 Brian API
      </Button>,
    ],
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
