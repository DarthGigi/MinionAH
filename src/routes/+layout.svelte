<script lang="ts">
  import { dev } from "$app/environment";
  import { Toaster } from "$lib/components/ui/sonner";
  import Navbar from "$lib/layouts/Navbar.svelte";
  import { preferences } from "$lib/stores/preferences";
  import { inject } from "@vercel/analytics";
  import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";
  import "../app.css";
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
</script>

<Navbar />
<Toaster theme="dark" closeButton={true} />

<slot />
