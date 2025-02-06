import type { Cookies } from "@sveltejs/kit";

export function setSessionTokenCookie(cookies: Cookies, token: string, expiresAt: Date): void {
  cookies.set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    expires: expiresAt,
    path: "/"
  });
}

export function deleteSessionTokenCookie(cookies: Cookies): void {
  cookies.set("session", "", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 0,
    path: "/"
  });
}
