import { sentrySvelteKit } from "@sentry/sveltekit";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";

export default defineConfig({
  plugins: [
    devtoolsJson(),
    sentrySvelteKit({
      sourceMapsUploadOptions: {
        org: "minionah",
        project: "minionah"
      }
    }),
    sveltekit()
  ],
  build: {
    sourcemap: true
  }
});
