import type { ParamMatcher } from "@sveltejs/kit";
const regex = /^(?!.*\.\.)[a-z0-9_.]{2,32}$/;

export const match = ((param) => {
  return regex.test(param);
}) satisfies ParamMatcher;
