import { sentrySvelteKit } from "@sentry/sveltekit";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
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
  },
  optimizeDeps: {
    exclude: ["@node-rs/argon2", "@node-rs/bcrypt"]
  }
});
