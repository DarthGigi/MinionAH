import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { vitePluginSvelteKitOG } from "@ethercorps/svelte-h2j/vite";

export default defineConfig({
  plugins: [sveltekit(), vitePluginSvelteKitOG()]
});
