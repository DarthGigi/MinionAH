import { handleErrorWithSentry, replayIntegration } from "@sentry/sveltekit";
import * as Sentry from "@sentry/sveltekit";
import { dev } from "$app/environment";

Sentry.init({
  dsn: "https://c7b9b7a1b4e2f091d9a1dc913b23dffc@o4507042038087680.ingest.us.sentry.io/4507042039791616",
  tracesSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: dev ? 1.0 : 0.1,

  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: dev ? 1.0 : 0.1,

  // If you don't want to use Session Replay, just remove the line below:
  integrations: [replayIntegration()],

  // Disable Sentry during development
  enabled: !dev,
  environment: dev ? "development" : "production"
});

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
