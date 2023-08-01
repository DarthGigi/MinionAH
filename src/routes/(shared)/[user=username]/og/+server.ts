import type { RequestHandler } from "./$types";
export const config = {
  runtime: "edge"
};

function formatNumber(num: number) {
  if (num != null) {
    let suffix = "";
    if (num >= 1000000) {
      num = num / 1000000;
      suffix = "m";
    } else if (num >= 1000) {
      num = num / 1000;
      suffix = "k";
    }
    if (suffix) {
      if (num % 1 === 0) {
        return num.toFixed(0) + suffix;
      } else {
        return num.toFixed(num < 10 ? 1 : 2) + suffix;
      }
    } else {
      return num.toString();
    }
  } else {
    return "N/A";
  }
}

import { ImageResponse } from "@ethercorps/sveltekit-og";

const errorTemplate = `
<div tw="flex h-full w-full text-white text-7xl flex-col items-center justify-center bg-[#131313]">
<span>Something went wrong</span>
<span tw="text-3xl mt-10">User not found</span>
</div>
`;

const fontFile400 = await fetch("https://raw.githubusercontent.com/etherCorps/sveltekit-og/main/static/inter-latin-ext-400-normal.woff");

const fontFile700 = await fetch("https://raw.githubusercontent.com/etherCorps/sveltekit-og/main/static/inter-latin-ext-700-normal.woff");

const fontData400: ArrayBuffer = await fontFile400.arrayBuffer();
const fontData700: ArrayBuffer = await fontFile700.arrayBuffer();

export const GET: RequestHandler = async ({ params }) => {
  const username = params.user;

  const user = await prisma.user.findUnique({
    where: {
      username: username
    }
  });

  if (!user) {
    return await ImageResponse(errorTemplate, {
      height: 630,
      width: 1200,
      fonts: [
        {
          name: "Inter Latin",
          data: fontData400,
          weight: 400
        },
        {
          name: "Inter Latin",
          data: fontData700,
          weight: 700
        }
      ]
    });
  }

  const template = `
  <div tw="flex h-full w-full flex-col items-center justify-center bg-[#131313]">
    <div tw="flex w-full max-w-sm justify-center rounded-lg border border-neutral-700 bg-neutral-800 shadow">
      <div tw="mx-auto flex flex-col items-center rounded py-10">
        <img tw="mb-3 h-24 w-24 rounded-full shadow-lg" src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64" />
        <span tw="mb-1 text-xl font-medium text-white">${user.username}</span>
        <span tw="text-sm text-neutral-400">${user.id}</span>
      </div>
    </div>
  </div>
  `;

  return await ImageResponse(template, {
    height: 430,
    width: 819.05,
    fonts: [
      {
        name: "Inter Latin",
        data: fontData400,
        weight: 400
      },
      {
        name: "Inter Latin",
        data: fontData700,
        weight: 700
      }
    ]
  });
};
