import { persisted } from "svelte-persisted-store";

export const preferences = persisted("preferences", {
  romanNumerals: true,
  minecraftFont: true
});
