import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess({ script: true }),

  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter(),
    csp: {
      directives: {
        "script-src": ["self", "unsafe-eval", "unsafe-inline", "https://*.pusher.com", "https://*.posthog.com", "https://*.minionah.com", "https://*.cloudflareinsights.com", "https://*.googletagmanager.com"],
        "worker-src": ["self", "blob:", "https://*.minionah.com"],
        "img-src": ["self", "data:", "https://*.imgur.com", "https://*.imgbb.com", "https://*.vgy.me", "https://*.gyazo.com", "https://*.prnt.sc", "https://*.prntscr.com", "https://*.tenor.com", "https://*.giphy.com", "https://*.gfycat.com", "https://*.discordapp.net", "https://*.discordapp.com", "https://*.discord.com", "https://*.minionah.com", "https://*.cloudinary.com", "https://*.hypixel.net"],
        "style-src": ["self", "unsafe-inline", "https://*.posthog.com", "https://*.minionah.com"]
      },
      mode: "auto"
    },
    csrf: {
      checkOrigin: false
    },
    serviceWorker: {
      register: false
    },
    paths: {
      relative: false
    },

    alias: {
      $generated: "src/generated",
      $components: "src/components"
    }
  }
};

export default config;
