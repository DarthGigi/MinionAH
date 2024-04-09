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
  import type { ToasterProps } from "svelte-sonner";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb";
  import { writable } from "svelte/store";

  // Initialize Firebase
  const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);

  const paths = writable<string[]>([]);

  let position: ToasterProps["position"] = "bottom-right";
  let closeButton: ToasterProps["closeButton"] = true;

  inject({ mode: dev ? "development" : "production", debug: false });
  if (!dev) {
    injectSpeedInsights();
  }

  page.subscribe((value) => {
    const urls = value.url.pathname.split("/").filter((url) => url !== "user" && Boolean(url));
    paths.set(urls);
  });

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
    if (window.innerWidth < 768) {
      position = "top-center";
      closeButton = false;
    }

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
              window.location.href = `/user/${payload.data?.username}/chat`;
            }
          }
        });
      });
    }
  });
</script>

<svelte:window
  on:resize={() => {
    if (window.innerWidth < 768) {
      position = "top-center";
      closeButton = false;
    } else {
      position = "bottom-right";
      closeButton = true;
    }
  }} />

<Navbar />
<Toaster theme="dark" {closeButton} {position} />

{#if $page.url.pathname !== "/"}
  <Breadcrumb.Root class="py-2">
    <Breadcrumb.List class="justify-center">
      <Breadcrumb.Item>
        <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
      </Breadcrumb.Item>
      {#each $paths as path}
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Breadcrumb.Link href={`/${path}`} class="capitalize">{path}</Breadcrumb.Link>
        </Breadcrumb.Item>
      {/each}
    </Breadcrumb.List>
  </Breadcrumb.Root>
{/if}

<slot />
