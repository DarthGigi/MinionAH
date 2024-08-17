import { PUBLIC_SENTRY_HOST, PUBLIC_SENTRY_PROJECT_ID } from "$env/static/public";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const SENTRY_PROJECT_IDS = [PUBLIC_SENTRY_PROJECT_ID];

export const POST: RequestHandler = async ({ request, fetch }) => {
  try {
    const envelopeBytes = await request.arrayBuffer();

    const envelope = new TextDecoder().decode(envelopeBytes);

    const piece = envelope.split("\n")[0];

    const header = JSON.parse(piece);

    const dsn = new URL(header["dsn"]);

    const projectId = dsn.pathname?.replace("/", "");

    if (dsn.hostname !== PUBLIC_SENTRY_HOST) {
      throw new Error(`Invalid sentry hostname: ${dsn.hostname}`);
    }

    if (!projectId || !SENTRY_PROJECT_IDS.includes(projectId)) {
      throw new Error(`Invalid sentry project id: ${projectId}`);
    }

    const upstream_sentry_url = `https://${PUBLIC_SENTRY_HOST}/api/${projectId}/envelope/`;

    await fetch(upstream_sentry_url, {
      method: "POST",
      body: envelopeBytes
    });

    return json({}, { status: 200 });
  } catch (e) {
    console.error("Error tunneling to Sentry", e);
    return json({ error: "Error tunneling to Sentry" }, { status: 500 });
  }
};
