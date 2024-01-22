import type { RequestHandler } from "./$types";
import PushNotifications from "@pusher/push-notifications-server";
import { INSTANCE_ID, SECRET_KEY } from "$env/static/private";

const beamsClient = new PushNotifications({
  instanceId: INSTANCE_ID,
  secretKey: SECRET_KEY
});

export const GET: RequestHandler = async ({ request, locals, url }) => {
  const queryUserId = url.searchParams.get("user_id");

  const user = locals.user;
  if (!user) {
    return new Response(null, {
      status: 401,
      statusText: "Unauthorized"
    });
  }

  if (user.id != queryUserId) {
    return new Response(null, {
      status: 401,
      statusText: "Inconsistent request"
    });
  } else {
    const beamsToken = beamsClient.generateToken(user.id);
    return new Response(JSON.stringify(beamsToken), {
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
  return new Response();
};
