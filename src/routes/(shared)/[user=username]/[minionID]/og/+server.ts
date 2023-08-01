import type { RequestHandler } from "./$types";

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
<span tw="text-3xl mt-10">Minion not found</span>
</div>
`;

const fontFile400 = await fetch("https://raw.githubusercontent.com/etherCorps/sveltekit-og/main/static/inter-latin-ext-400-normal.woff");

const fontFile700 = await fetch("https://raw.githubusercontent.com/etherCorps/sveltekit-og/main/static/inter-latin-ext-700-normal.woff");

const fontData400: ArrayBuffer = await fontFile400.arrayBuffer();
const fontData700: ArrayBuffer = await fontFile700.arrayBuffer();

export const GET: RequestHandler = async ({ params }) => {
  const minionID = params.minionID;
  const username = params.user;

  const minion = await prisma.minionSeller.findUnique({
    where: {
      id: minionID,
      AND: [
        {
          user: {
            username: username
          }
        }
      ]
    },
    include: {
      minion: true,
      user: {
        select: {
          accent_color: true,
          avatar: true,
          banner: true,
          id: true,
          locale: true,
          loggedInAt: false,
          username: true
        }
      }
    }
  });

  if (!minion) {
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
    <div tw="flex w-full max-w-sm flex-col rounded-lg border border-neutral-700 bg-neutral-800 shadow">
      <div tw="mx-auto flex flex-col items-center rounded py-10">
        <img tw="mb-3 h-24 w-24 rounded-full shadow-lg" src="https://cdn.discordapp.com/avatars/${minion.user.id}/${minion.user.avatar}.png?size=64" />
        <span tw="mb-1 text-xl font-medium text-white">${minion.user.username}</span>
        <span tw="text-sm text-neutral-400">${minion.user.id}</span>
      </div>
      <div tw="flex w-full flex-col items-center justify-center rounded">
        <div tw="flex h-12 w-12 rounded-full bg-neutral-700 p-1">
          <img tw="h-full w-full" src="https://mc-heads.net/head/${minion.minion.texture}" />
        </div>
         <span tw="text-lg font-medium text-white">${minion.minion.name.replace(/ [IVX]+$/, "")}</span>
        <div tw="mx-auto mt-4 flex w-full items-center justify-center border-t border-neutral-700">
          <div tw="relative flex w-0 flex-1 items-center justify-center overflow-hidden text-lg font-medium text-neutral-200">
            <span tw="flex-shrink-0 rounded-full bg-neutral-400 px-2 py-0.5 text-lg font-medium text-neutral-800 group-hover:scale-125 group-hover:text-neutral-900">${` Tier ${["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][minion.minion.generator_tier - 1]} (${minion.minion.generator_tier})`}</span>
          </div>
          <div tw="relative border-l border-r border-neutral-700 -ml-px flex w-0 flex-1 overflow-hidden">
            <span tw="relative w-0 flex-1 items-center justify-center overflow-hidden py-4 text-lg font-medium text-neutral-200 group-hover:scale-125 group-hover:text-neutral-900">
              <img tw="mr-1 h-6 w-6" src="https://minions.mrgigi.me/assets/images/coin.png" /> ${formatNumber(minion.price)}
              <span tw="ml-1 text-lg text-neutral-200/50 group-hover:ml-0 group-hover:text-neutral-900/0">/</span>
              <span tw="text-lg text-neutral-200/50 group-hover:-ml-0.5 group-hover:text-neutral-900">each</span>
            </span>
          </div>
          <div tw="relative flex w-0 flex-1 items-center justify-center text-sm font-medium text-neutral-200">
            <span tw="flex-shrink-0 rounded-full bg-neutral-400 px-2 py-0.5 text-lg font-medium text-neutral-800 group-hover:scale-125 group-hover:text-neutral-900">${` Amount: ${minion.amount}`}</span>
          </div>
        </div>
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