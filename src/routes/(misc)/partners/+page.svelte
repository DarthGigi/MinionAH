<script lang="ts">
  import SvelteSeo from "svelte-seo";
  import PartnerCard from "./partner-card.svelte";
  import { partners } from "./partners";
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
    {#each partners as partner}
      <PartnerCard cardData={partner} />
    {/each}
  </div>
</div>
