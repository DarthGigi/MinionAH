<script lang="ts">
  import { dev } from "$app/environment";
  import Navbar from "$lib/layouts/Navbar.svelte";
  import { preferences } from "$lib/stores/preferences";
  import { inject } from "@vercel/analytics";
  import { pwaInfo } from "virtual:pwa-info";
  // import { onMount } from "svelte";
  import "../app.css";

  inject({ mode: dev ? "development" : "production", debug: false });

  preferences.subscribe((value) => {
    if (typeof window !== "undefined") {
      if (value.minecraftFont) {
        document.body.classList.add("font-minecraft");
      } else {
        document.body.classList.remove("font-minecraft");
      }
    }
  });

  $: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : "";

  // onMount(async () => {
  //   await navigator.serviceWorker.register("/service-worker.js", {
  //     type: dev ? "module" : "classic"
  //   });
  // });
</script>

<svelte:head>
  {@html webManifestLink}
</svelte:head>

<Navbar />

<slot />
