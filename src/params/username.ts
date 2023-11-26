import type { ParamMatcher } from "@sveltejs/kit";

const regex = /^[a-zA-Z0-9_]{3,16}$/;

export const match = ((param) => {
  return regex.test(param);
}) satisfies ParamMatcher;
