<script lang="ts">
  import { dev } from "$app/environment";
  import Navbar from "$lib/layouts/Navbar.svelte";
  import { inject } from "@vercel/analytics";
  import "../app.css";
  inject({ mode: dev ? "development" : "production", debug: false });
</script>

<Navbar />

<slot />
