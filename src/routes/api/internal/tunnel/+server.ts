import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, fetch }) => {
  try {
    const envelope = await request.text();

    const pieces = envelope?.split("\n");

    const header = JSON.parse(pieces[0]);

    const { host, pathname, username } = new URL(header.dsn);

    const projectId = pathname.slice(1);

    const url = `https://${host}/api/${projectId}/envelope/?sentry_key=${username}&sentry_version=${header.sdk.version.split(".")[0]}&sentry_client=${header.sdk.name}/${header.sdk.version}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-sentry-envelope"
      },
      body: envelope
    });

    return json(
      { message: "Success", data: response?.data },
      {
        status: 201
      }
    );
  } catch (e) {
    const error = e?.response || e?.message;

    return json(
      { message: "invalid request", error: error },
      {
        status: 400
      }
    );
  }
};
