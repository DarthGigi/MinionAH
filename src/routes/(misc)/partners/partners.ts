export type CardData = {
  image: string;
  title: string;
  subTitle?: string;
  description: string;
  banner?: string;
  links: {
    name: string;
    url: string;
  }[];
};

export const partners: CardData[] = [
  {
    image: "https://res.cloudinary.com/minionah/image/upload/v1/partners/icons/skyblock%20university",
    title: "Skyblock University",
    subTitle: "@sbuni",
    description: "Skyblock University was founded with one goal in mind: to help brand new, early, and mid-game Hypixel Skyblock players by empowering them and equipping them with the tools, resources, and mentors they need to continually grow, learn, and progress.",
    banner: "https://res.cloudinary.com/minionah/image/upload/v1/partners/banners/skyblock%20university%20banner",
    links: [
      {
        name: "Discord",
        url: "https://discord.gg/sbuni"
      },
      {
        name: "Hypixel Forums",
        url: "https://hypixel.net/threads/skyblock-university-helping-early-and-mid-game-players-no-reqs-friendly-and-welcoming-community-5-3k-member-discord-9-guilds.5730713/"
      }
    ]
  },
  {
    image: "https://res.cloudinary.com/minionah/image/upload/v1/partners/icons/sbh",
    title: "Skyblock Hub",
    subTitle: "@sbh",
    description: 'Skyblock Hub is a Discord server that focuses on carry services. We have an active, friendly, and well moderated community, many giveaways and events, and a support channel to answer any questions you may have about SkyBlock progression. We would love for you to check out our server, even if it\'s just a pop-in just to say "hi!".',
    banner: "https://res.cloudinary.com/minionah/image/upload/v1/partners/banners/sbh%20banner",
    links: [
      {
        name: "Discord",
        url: "https://discord.gg/QFQ64B4Whn"
      }
    ]
  }
];
