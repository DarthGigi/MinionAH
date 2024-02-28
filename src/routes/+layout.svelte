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
  import Hammer from "lucide-svelte/icons/hammer";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import "../app.css";
  import type { LayoutData } from "./$types";

  export let data: LayoutData;

  // Initialize Firebase
  const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);

  inject({ mode: dev ? "development" : "production", debug: false });
  if (!dev && !data.maintenance) {
    injectSpeedInsights();
  }

  preferences.subscribe((value) => {
    if (data.maintenance) return;
    if (typeof window !== "undefined") {
      if (value.minecraftFont) {
        document.body.dataset.font = "minecraft";
      } else {
        document.body.dataset.font = "default";
      }
    }
  });

  onMount(async () => {
    if (data.maintenance) return;
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
        toast(payload.notification?.title || "New message", {
          description: MessageToast,
          componentProps: {
            image: payload.notification?.image || "/favicon.ico",
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

{#if data.maintenance}
  <div class="flex h-screen w-screen flex-col items-center justify-center p-6 font-sans">
    <img src="/assets/images/favicons/favicon.png" alt="MinionAH" class="mb-4 h-24 w-24" />
    <h1 class="text-2xl font-bold md:text-4xl">MinionAH is under maintenance</h1>
    <p class="text-lg">Our minions are working hard on making the site better.</p>
    <p class="mt-6 text-base">In the meantime, you can join our <a href="https://discord.minionah.com" class="underline">Discord server</a> for updates.</p>
    <p class="mt-16 flex items-center gap-2 text-base">
      <Hammer class="animate-hammer h-5 w-5 origin-bottom-left" />
      We'll be back soon!
    </p>
  </div>
  <style>
    .animate-hammer {
      animation: hammer 1s infinite;
    }

    @keyframes hammer {
      0% {
        transform: rotate(0deg);
      }
      50% {
        transform: rotate(10deg);
      }
      100% {
        transform: rotate(0deg);
      }
    }
  </style>
{:else}
  <Navbar />
  <Toaster theme="dark" closeButton={true} />

  <slot />
{/if}
