<script lang="ts">
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import Earth from "lucide-svelte/icons/earth";
  import SvelteSeo from "svelte-seo";
  import type { PageData } from "./$types";
  import PartnerCard from "./partner-card.svelte";

  const { data }: { data: PageData } = $props();
  const partners = data.partners;
</script>

<SvelteSeo
  title="MinionAH - Partnerships"
  description="We are proud to be partnered with the following communities. If you are interested in partnering with us, please reach out to us."
  themeColor="#171717"
  canonical="https://minionah.com/partners"
  keywords="MinionAH, Hypixel SkyBlock, minions, auction house, minion trading, skyblock auction, skyblock minions, Hypixel minions, buy minions, sell minions, minionah, skyblock, minion ah, minion auctions, minion skyblock"
  openGraph={{
    type: "website",
    url: "https://minionah.com/partners",
    title: "MinionAH: Partnerships",
    description: "We are proud to be partnered with the following communities. If you are interested in partnering with us, please reach out to us.",
    images: [
      {
        url: "https://minionah.com/assets/images/ogBanner.png?v=2",
        secure_url: "https://minionah.com/assets/images/ogBanner.png?v=2",
        alt: "MinionAH",
        width: 1200,
        height: 630,
        type: "image/png"
      }
    ],
    site_name: "MinionAH",
    locale: "en_US"
  }}
  twitter={{
    card: "summary_large_image",
    creator: "@iDarthGigi",
    title: "MinionAH: Partnerships",
    description: "We are proud to be partnered with the following communities. If you are interested in partnering with us, please reach out to us.",
    image: "https://minionah.com/assets/images/ogBanner.png?v=2",
    imageAlt: "MinionAH"
  }} />

<div class="relative mx-auto flex w-full max-w-sm flex-col items-center justify-center gap-3">
  <h2 class="text-center text-6xl font-semibold leading-none text-foreground">Partnerships</h2>
  <p class="text-center text-xs text-accent">We are proud to be partnered with the following communities. <br /> If you are interested in partnering with us, please reach out to us.</p>
</div>

<div class="py-8 max-md:pb-20">
  <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 px-4 sm:px-6 lg:px-8">
    {#await partners}
      {#each Array(4)}
        <Card.Root class="w-full max-w-[32rem] animate-pulse self-stretch border-border bg-background">
          <Card.Header class="flex flex-col items-center justify-center space-y-0 max-md:gap-6 md:flex-row md:justify-between">
            <div class="group flex flex-row items-center justify-start gap-2">
              <Avatar.Root class="pointer-events-none select-none">
                <Avatar.Image class="transition-all duration-300" />
                <Avatar.Fallback class="transition-all duration-300"></Avatar.Fallback>
              </Avatar.Root>
              <div class="flex flex-col">
                <Card.Title class="h-4 w-40 rounded bg-muted"></Card.Title>
                <Card.Description class="mt-1 h-3 w-8 rounded bg-muted"></Card.Description>
              </div>
            </div>
            <div class="flex flex-row-reverse flex-wrap items-center justify-center gap-2">
              <div class="group">
                <Avatar.Root class="size-7 select-none">
                  <Avatar.Image class="pointer-events-none h-full w-full rounded-full bg-accent p-0.5 transition-all duration-300" alt="Favicon" />
                  <Avatar.Fallback class="pointer-events-none h-full w-full rounded-full bg-accent p-0.5 transition-all duration-300">
                    <Earth />
                  </Avatar.Fallback>
                </Avatar.Root>
              </div>
            </div>
          </Card.Header>
          <Card.Content class="space-y-2 text-sm">
            <p class="h-12 w-full rounded bg-muted"></p>
            <p class="h-12 w-full rounded bg-muted"></p>
          </Card.Content>
          <Card.Footer class="flex flex-1 items-center justify-center">
            <Avatar.Root asChild>
              <div class="group relative flex aspect-video h-auto w-full shrink-0 overflow-hidden rounded-xl border border-border shadow-sm">
                <Avatar.Image class="pointer-events-none select-none object-cover transition-all duration-300" />
                <Avatar.Fallback class="pointer-events-none select-none rounded-xl transition-all duration-300"></Avatar.Fallback>
              </div>
            </Avatar.Root>
          </Card.Footer>
        </Card.Root>
      {/each}
    {:then partners}
      {#each partners.filter((partner) => !partner.hidden) as partner}
        <PartnerCard cardData={partner} />
      {/each}
    {:catch error}
      <p class="text-center text-2xl font-semibold leading-none text-red-500">Error: {error.message}</p>
    {/await}
  </div>
</div>
