import { Button } from "frames.js/next";
import { generateCaptchaChallenge } from "../../lib/captcha";
import { frames } from "../frames";
import { appURL } from "@/app/lib/url-utils";

const handleRequest = frames(async () => {
  const { id, numA, numB } = await generateCaptchaChallenge();
  return {
    image: (
      <div tw="relative flex items-center justify-center text-blue-500">
        <img src={`${appURL()}/images/captcha.png`} tw="absolute" />
        <div tw="relative z-10 flex items-center justify-center pt-10 text-8xl text-white font-bold">
          {numA} + {numB} = ?
        </div>
      </div>
    ),
    imageOptions: {
      aspectRatio: "1:1",
    },
    textInput: "Enter the result",
    buttons: [
      <Button
        action="post"
        target={{ pathname: `/captcha/validate`, search: `id=${id}` }}
      >
        🔢 Submit captcha
      </Button>,
    ],
  };
});
export const GET = handleRequest;
export const POST = handleRequest;
