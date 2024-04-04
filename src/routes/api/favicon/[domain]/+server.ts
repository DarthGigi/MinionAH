import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params }) => {
  const domain = decodeURIComponent(params.domain);

  const favicon = await fetch(`https://www.google.com/s2/favicons?sz=256&domain_url=${domain}`);

  if (!favicon.ok) {
    return new Response(null, { status: favicon.status });
  }

  const headers = new Headers(favicon.headers);
  const body = await favicon.arrayBuffer();

  return new Response(body, {
    headers: {
      "Content-Type": headers.get("Content-Type") || "image/png",
      "Cache-Control": "public, max-age=604800, immutable"
    }
  });
};
