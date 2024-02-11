import { persisted } from "svelte-persisted-store";

export const preferences = persisted("preferences", {
  romanNumerals: true,
  minecraftFont: true
});

export const internalPreferences = persisted("internalPreferences", {
  isNewToSite: true,
  hasSeenWelcomeGuideToast: false
});
