import { Button } from "frames.js/next";
import { vercelURL } from "../../lib/utils";
import { frames } from "../../frames/frames";
import { getURL } from "@/app/lib/url-utils";

const handleRequest = frames(async (ctx) => {
    console.log("handleRequest");
    return {
        image: (
            <div tw="relative flex items-center justify-center">
              <img src={`${getURL()}/images/instructions.png`} tw="absolute" />
            </div>
          ),
        imageOptions: {
            aspectRatio: "1:1",
        },
        buttons: [
          <Button action="post" target="/frames">
            🔙 Go back
          </Button>,
        ],
    };
});

export const GET = handleRequest;
export const POST = handleRequest;
