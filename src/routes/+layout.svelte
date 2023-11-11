<script lang="ts">
  import { dev } from "$app/environment";
  import { onNavigate } from "$app/navigation";
  import Navbar from "$lib/components/Navbar.svelte";
  import { inject } from "@vercel/analytics";
  import "../app.css";
  inject({ mode: dev ? "development" : "production", debug: false });

  onNavigate((navigation) => {
    //@ts-expect-error
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      //@ts-expect-error
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

<Navbar />

<slot />
