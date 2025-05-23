import { persisted } from "svelte-persisted-store";

type InternalStorage = {
  fcmToken: string | undefined;
  lastSeenVersion: string;
};

export const preferences = persisted("preferences", {
  romanNumerals: true,
  minecraftFont: false,
  infiniteScroll: true
});

export const internalPreferences = persisted("internalPreferences", {
  isNewToSite: true,
  hasSeenWelcomeGuideToast: false,
  hasSeenDiscordToast: false,
  hasSeenDeviceNotificationsToast: false,
  hasSeenEmailNotificationsToast: false,
  hasSeenDiscordNotificationsToast: false
});

export const internalStorage = persisted<InternalStorage>("internalStorage", {
  fcmToken: undefined,
  lastSeenVersion: "0.0.0"
});
