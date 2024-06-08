import { sentrySvelteKit } from "@sentry/sveltekit";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sentrySvelteKit({
      sourceMapsUploadOptions: {
        org: "minionah",
        project: "minionah"
      },
      adapter: "vercel"
    }),
    sveltekit()
  ],
  build: {
    sourcemap: true
  }
});
