import adapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter(),
    csp: {
      directives: {
        "script-src": ["self", "unsafe-eval", "https://*.vercel-scripts.com", "https://*.vercel.app", "https://*.pusher.com", "sha256-y2WkUILyE4eycy7x+pC0z99aZjTZlWfVwgUAfNc1sY8="],
        "worker-src": ["self", "blob:", "https://*.minionah.com"],
        "img-src": ["self", "data:", "https://*.vercel.app", "https://*.vercel-scripts.com", "https://*.imgur.com", "https://*.imgbb.com", "https://*.vgy.me", "https://*.gyazo.com", "https://*.prnt.sc", "https://*.prntscr.com", "https://*.tenor.com", "https://*.giphy.com", "https://*.gfycat.com", "https://*.discordapp.net", "https://*.discordapp.com", "https://*.discord.com", "https://*.minionah.com", "https://*.cloudinary.com"],
        "style-src": ["self", "unsafe-inline"]
      },
      mode: "auto"
    },
    csrf: {
      checkOrigin: true
    },
    serviceWorker: {
      register: false
    }
  }
};

export default config;
