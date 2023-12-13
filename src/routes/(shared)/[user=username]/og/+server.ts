import { toReactElement } from "@ethercorps/svelte-h2j";
import { ImageResponse } from "@vercel/og";
import type { Config } from "@sveltejs/adapter-vercel";
import type { RequestHandler } from "./$types";

// export const config: Config = {
//   runtime: "edge"
// };

const errorTemplate = toReactElement(`
<div tw="flex h-full w-full text-white text-7xl flex-col items-center justify-center bg-[#131313]">
<span>Something went wrong</span>
<span tw="text-3xl mt-10">Something went wrong while trying to generate the image</span>
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
      console.error(error);
      return new Response(null, {
        status: 500
      });
    }
  }

  const template = toReactElement(`
  <div tw="flex h-full w-full flex-col items-center justify-center bg-[#131313]">
    <div tw="flex w-full max-w-2xl justify-center rounded-lg border border-neutral-700 bg-neutral-800 shadow">
      <div tw="mx-auto flex flex-col items-center rounded py-20">
        <div tw="flex mb-3 items-center h-44 w-44 shadow-lg overflow-hidden justify-center rounded-full bg-neutral-700">
          <img tw="h-full w-full p-4" src="data:image/png;base64,${user.avatar}" />
        </div>
        <span tw="mb-1 text-4xl font-medium text-white">${user.username}</span>
      </div>
    </div>
  </div>
  `);

  try {
    return new ImageResponse(template, {
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
    console.error(error);
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
      console.error(error);
      return new Response(null, {
        status: 500
      });
    }
  }
};
