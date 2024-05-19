<script lang="ts">
  import SvelteSeo from "svelte-seo";
</script>

<SvelteSeo
  title="MinionAH - The Auction House for SkyBlock Minions"
  description="MinionAH is the best place to trade Hypixel SkyBlock minions. Minion auction house has a modern design, has QOL features for trading skyblock minions, and more."
  themeColor="#171717"
  canonical="https://minionah.com"
  keywords="MinionAH, Hypixel SkyBlock, minions, auction house, minion trading, skyblock auction, skyblock minions, Hypixel minions, buy minions, sell minions, minionah, skyblock, minion ah, minion auctions, minion skyblock"
  openGraph={{
    type: "website",
    url: "https://minionah.com",
    title: "MinionAH: The Auction House for SkyBlock Minions",
    description: "MinionAH is the best place to trade Hypixel SkyBlock minions. Minion auction house has a modern design, has QOL features for trading skyblock minions, and more.",
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
    title: "MinionAH: The Auction House for SkyBlock Minions",
    description: "MinionAH is the best place to trade Hypixel SkyBlock minions. Minion auction house has a modern design, has QOL features for trading skyblock minions, and more.",
    image: "https://minionah.com/assets/images/ogBanner.png?v=2",
    imageAlt: "MinionAH"
  }} />
<slot />
