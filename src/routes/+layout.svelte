<script lang="ts">
  import { dev } from "$app/environment";
  import { PUBLIC_VAPID_KEY } from "$env/static/public";
  import MessageToast from "$lib/components/MessageToast.svelte";
  import { Toaster } from "$lib/components/ui/sonner";
  import { firebaseConfig } from "$lib/firebase";
  import Navbar from "$lib/layouts/Navbar.svelte";
  import { preferences } from "$lib/stores/preferences";
  import { requestNotificationPermission } from "$lib/utilities";
  import { inject } from "@vercel/analytics";
  import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";
  import type { FirebaseApp } from "firebase/app";
  import { initializeApp } from "firebase/app";
  import { getMessaging, getToken, onMessage } from "firebase/messaging";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { page } from "$app/stores";
  import "../app.css";

  // Initialize Firebase
  const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);

  inject({ mode: dev ? "development" : "production", debug: false });
  if (!dev) {
    injectSpeedInsights();
  }

  preferences.subscribe((value) => {
    if (typeof window !== "undefined") {
      if (value.minecraftFont) {
        document.body.dataset.font = "minecraft";
      } else {
        document.body.dataset.font = "default";
      }
    }
  });

  onMount(async () => {
    const serviceWorker = navigator.serviceWorker.register("/service-worker.js", {
      type: dev ? "module" : "classic"
    });
    const permission = await requestNotificationPermission();
    if (permission === "granted") {
      const messaging = getMessaging(firebaseApp);
      getToken(messaging, {
        vapidKey: PUBLIC_VAPID_KEY,
        serviceWorkerRegistration: await serviceWorker
      });
      onMessage(messaging, (payload) => {
        if ($page.url.pathname.endsWith("/chat")) return;
        toast(payload.notification?.title || "New message", {
          description: MessageToast,
          componentProps: {
            image: payload.notification?.image || "/favicon.png",
            text: payload.notification?.body || "You have a new message",
            username: payload.data?.username || "Unknown"
          },
          action: {
            label: "View",
            onClick: () => {
              window.location.href = `/${payload.data?.username}/chat`;
            }
          }
        });
      });
    }
  });
</script>

<Navbar />
<Toaster theme="dark" closeButton={true} />

<slot />
