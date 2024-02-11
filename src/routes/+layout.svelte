<script lang="ts">
  import { dev } from "$app/environment";
  import Navbar from "$lib/layouts/Navbar.svelte";
  import { preferences } from "$lib/stores/preferences";
  import { inject } from "@vercel/analytics";
  import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";
  import "../app.css";
  import { Toaster } from "$lib/components/ui/sonner";
  inject({ mode: dev ? "development" : "production", debug: false });
  if (!dev) {
    injectSpeedInsights();
  }

  preferences.subscribe((value) => {
    if (typeof window !== "undefined") {
      if (value.minecraftFont) {
        document.body.classList.add("font-minecraft");
      } else {
        document.body.classList.remove("font-minecraft");
      }
    }
  });
</script>

<Navbar />
<Toaster theme="dark" closeButton={true} />

<slot />
