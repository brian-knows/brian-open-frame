import { Button } from "frames.js/next";
import { frames } from "../../frames/frames";
import { appURL } from "@/app/lib/url-utils";

const handleRequest = frames(async (ctx) => {
    console.log("handleRequest");
    return {
        image: (
            <div tw="relative flex items-center justify-center">
              <img src={`${appURL()}/images/instructions.png`} tw="absolute" />
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
