import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";

export default defineConfig({
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts"
    })
  ],
  build: {
    sourcemap: true
  },
  ssr: {
    noExternal: ["@pusher/push-notifications-web"]
  }
});
