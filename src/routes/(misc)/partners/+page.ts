import type { PageLoad } from "./$types";
import type { CardData } from "./types";

export const load = (async ({ fetch }) => {
  return {
    partners: fetch("https://gist.githubusercontent.com/DarthGigi/6bce727192aff43a71963b95f27a7763/raw/partners.json").then((res) => res.json()) as Promise<CardData[]>
  };
}) satisfies PageLoad;
