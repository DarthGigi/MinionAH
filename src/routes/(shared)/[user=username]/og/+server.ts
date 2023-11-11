import { toReactElement } from "@ethercorps/svelte-h2j";
import { ImageResponse } from "@vercel/og";
// import { PrismaClient } from "@prisma/client/edge";
// import { withAccelerate } from "@prisma/extension-accelerate";
import type { Config } from "@sveltejs/adapter-vercel";
import type { RequestHandler } from "./$types";

// export const config: Config = {
//   runtime: "edge"
// };

// const prismaEdge = new PrismaClient().$extends(withAccelerate());

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

const errorTemplate = toReactElement(`
<div tw="flex h-full w-full text-white text-7xl flex-col items-center justify-center bg-[#131313]">
<span>Something went wrong</span>
<span tw="text-3xl mt-10">User not found</span>
</div>`);

export const GET: RequestHandler = async ({ params, fetch }) => {
  const fontData400 = await fetch("https://og-playground.vercel.app/inter-latin-ext-400-normal.woff").then((res) => res.arrayBuffer());
  const fontData700 = await fetch("https://og-playground.vercel.app/inter-latin-ext-700-normal.woff").then((res) => res.arrayBuffer());

  const username = params.user;

  const user = await prisma.user.findUnique({
    where: {
      username: username
    }
  });

  if (!user) {
    try {
      return new ImageResponse(errorTemplate, {
        height: 630,
        width: 1200,
        fonts: [
          {
            name: "Inter",
            data: fontData400,
            weight: 400,
            style: "normal"
          },
          {
            name: "Inter",
            data: fontData700,
            weight: 700,
            style: "normal"
          }
        ]
      });
    } catch (error) {
      console.log(error);
      return new Response(null, {
        status: 500
      });
    }
  }

  const template = toReactElement(`
  <div tw="flex h-full w-full flex-col items-center justify-center bg-[#131313]">
    <div tw="flex w-full max-w-sm justify-center rounded-lg border border-neutral-700 bg-neutral-800 shadow">
      <div tw="mx-auto flex flex-col items-center rounded py-10">
        <img tw="mb-3 h-24 w-24 rounded-full shadow-lg" src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64" />
        <span tw="mb-1 text-xl font-medium text-white">${user.username}</span>
        <span tw="text-sm text-neutral-400">${user.id}</span>
      </div>
    </div>
  </div>
  `);

  try {
    return new ImageResponse(template, {
      height: 430,
      width: 819.05,
      fonts: [
        {
          name: "Inter",
          data: fontData400,
          weight: 400,
          style: "normal"
        },
        {
          name: "Inter",
          data: fontData700,
          weight: 700,
          style: "normal"
        }
      ]
    });
  } catch (error) {
    console.log(error);
    return new Response(null, {
      status: 500
    });
  }
};
