import { Button } from "frames.js/next";
import { validateCaptchaChallenge } from "../../../lib/captcha";
import { frames } from "../../../frames/frames";
import { appURL } from "@/app/lib/url-utils";

const handleRequest = frames(async (ctx) => {
  const captchaId = ctx.url.searchParams.get("id");
  const inputText = ctx.message?.inputText;

  if (!inputText) {
    return {
      image: (
        <div tw="relative flex items-center justify-center">
          <img src={`${appURL()}/images/captcha-error.png`} />
        </div>
      ),
      imageOptions: {
        aspectRatio: "1:1",
      },
      buttons: [
        <Button action="post" target="/captcha">
          🔄 Try again
        </Button>,
      ],
    };
  }

  const isValidCaptcha = await validateCaptchaChallenge(
    captchaId!,
    parseInt(inputText)
  );
  console.log(isValidCaptcha, "isValidCaptcha");

  if (!isValidCaptcha) {
    console.error("Invalid captcha", { captchaId, inputText });
    return {
      image: (
        <div tw="relative flex items-center justify-center">
          <img src={`${appURL()}/images/captcha-error.png`} />
        </div>
      ),
      imageOptions: {
        aspectRatio: "1:1",
      },
      buttons: [
        <Button action="post" target="/captcha">
          🔄 Try again
        </Button>,
      ],
    };
  }
  return {
    image: `${appURL()}/images/instructions.gif`,
    textInput: "Swap 0.1 ETH to USDC on Arbitrum",
    imageOptions: {
      aspectRatio: "1:1",
    },
    buttons: [
      <Button
        action="post"
        target={{
          pathname: `/loading`,
          search: `id=${captchaId}&requestTimestamp=${Date.now()}&status=start`,
        }}
      >
        🔢 Submit prompt
      </Button>,
    ],
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
