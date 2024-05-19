<script lang="ts">
  import { dev } from "$app/environment";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { PUBLIC_VAPID_KEY } from "$env/static/public";
  import MessageToast from "$lib/components/MessageToast.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb";
  import { Toaster } from "$lib/components/ui/sonner";
  import { firebaseConfig } from "$lib/firebase";
  import Navbar from "$lib/layouts/Navbar.svelte";
  import { internalStorage, preferences } from "$lib/stores/preferences";
  import { requestNotificationPermission } from "$lib/utilities";
  import { inject } from "@vercel/analytics";
  import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";
  import type { FirebaseApp } from "firebase/app";
  import { initializeApp } from "firebase/app";
  import { getMessaging, getToken, onMessage } from "firebase/messaging";
  import { onMount } from "svelte";
  import SvelteSeo from "svelte-seo";
  import type { ToasterProps } from "svelte-sonner";
  import { toast } from "svelte-sonner";
  import { writable } from "svelte/store";
  import "../app.css";
  import type { LayoutData } from "./$types";
  import BugReport from "./bug-report.svelte";

  export let data: LayoutData;

  const paths = writable<string[]>([]);
  const blacklistedPaths = ["/", "api"];

  const position = writable<ToasterProps["position"]>("bottom-right");
  const closeButton = writable<ToasterProps["closeButton"]>(true);

  inject({ mode: dev ? "development" : "production", debug: false });
  if (!dev) {
    injectSpeedInsights();
  }

  page.subscribe((value) => {
    const urls = value.url.pathname.split("/").filter((url) => Boolean(url));
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
      position.set("top-center");
      closeButton.set(false);
    }
    const serviceWorker = navigator.serviceWorker.register("/service-worker.js", {
      type: dev ? "module" : "classic"
    });

    // Initialize Firebase
    const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);

    const permission = await requestNotificationPermission();
    if (permission === "granted") {
      const messaging = getMessaging(firebaseApp);
      const token = await getToken(messaging, {
        vapidKey: PUBLIC_VAPID_KEY,
        serviceWorkerRegistration: await serviceWorker
      });
      internalStorage.update((state) => ({
        ...state,
        fcmToken: token
      }));
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
            onClick: async () => {
              await goto(`/user/${payload.data?.username}/chat`);
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
      position.set("top-center");
      closeButton.set(false);
    } else {
      position.set("bottom-right");
      closeButton.set(true);
    }
  }} />

<SvelteSeo applicationName="MinionAH" />

<Navbar />

<BugReport {data} />

<Toaster theme="dark" closeButton={$closeButton} position={$position} />

{#if $paths.length > 0 && !blacklistedPaths.some((path) => $paths.includes(path))}
  <Breadcrumb.Root class="py-2">
    <Breadcrumb.List class="justify-center">
      <Breadcrumb.Item>
        <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
      </Breadcrumb.Item>
      {#each $paths as path, index}
        {#if path !== "user"}
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            {#if $paths[index - 1] === "user"}
              <Breadcrumb.Link href={`/user/${path}`} class="capitalize">{path}</Breadcrumb.Link>
            {:else if $paths[index - 2] === "user"}
              <Breadcrumb.Link href={`/user/${$paths[index - 1]}/${path}`} class="capitalize">{path}</Breadcrumb.Link>
            {:else}
              <Breadcrumb.Link href={`/${$paths.slice(0, index + 1).join("/")}`} class="capitalize">{path}</Breadcrumb.Link>
            {/if}
          </Breadcrumb.Item>
        {/if}
      {/each}
    </Breadcrumb.List>
  </Breadcrumb.Root>
{/if}

<slot />
