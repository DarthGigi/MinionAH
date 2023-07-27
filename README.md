<p align=center>
<img src="https://raw.githubusercontent.com/DarthGigi/MinionAH/main/static/assets/images/banner.png" alt="Banner">
</p>

<p align=center>
<img src="https://img.shields.io/github/license/DarthGigi/MinionAH?style=for-the-badge" alt="license">
<img src="https://img.shields.io/github/languages/count/DarthGigi/MinionAH?style=for-the-badge" alt="languages">
<img src="https://img.shields.io/github/languages/top/DarthGigi/MinionAH?style=for-the-badge" alt="top language">
<img src="https://img.shields.io/website?style=for-the-badge&url=https%3A%2F%2Fminions.mrgigi.me" alt="website status">
</p>

# 📑 Table of Contents

- [📑 Table of Contents](#-table-of-contents)
- [🏦 MinionAH](#-minionah)
  - [💰 Purchasing Minions](#-purchasing-minions)
  - [🤔 Why MinionAH](#-why-minionah)
  - [🌐 Community](#-community)
  - [📜 Credits](#-credits)
- [🔒 Privacy/Data](#-privacydata)
- [🤝 Contributing](#-contributing)
  - [🧰 Setup for Development](#-setup-for-development)
  - [📝 License](#-license)

# 🏦 MinionAH

MinionAH is a seamless and easy-to-use way to purchase and sell Hypixel SkyBlock minions with a beautiful interface. It's designed with precision and a good user experience in mind and is perfect for _any_ SkyBlock player.

MinionAH makes it easy to sell minions and view information about minions with a glance.

![MinionAH](/static/assets/images/showcase1.png)
As shown, it's easy to find minions on MinionAH. But it even gets better with a beautiful hover animation. Clicking the card or the user will open the seller's Discord profile. Clicking the minion will open the wiki page of the minion for even more information.

![Minion Animation](/static/assets/images/showcase2.gif)
It's also super easy to search for minions on MinionAH.

![Minion Animation](/static/assets/images/showcase3.gif)
After logging in with Discord, you can access your profile page where you can sell a minion, see a list of your minions and delete minions you sell or no longer want to sell.

![Minion Animation](/static/assets/images/showcase4.gif)
Creating minions is very easy too. You simply select a minion from the minion dropdown, or just start typing the name of the minion. Next, select the tier and fill how many minions you're selling and the price (for each). Finally, just click Create and you're done!

![Minion Animation](/static/assets/images/showcase5.gif)

## 💰 Purchasing Minions

The way you buy minions is essentially the same as you would if using Discord servers to sell your minions. You simply DM the user that sells the minion and discuss when you both can get online and trade. As mentioned before, you can click on the card or the user to open their discord account in Discord itself.  
A chat/message system will most likely be added to communicate more easily later.

## 🤔 Why MinionAH

(Written by Gigi)  
"I made MinionAH because as you know, you can't sell Minions in the in-game Auction House (which is kind of annoying). Instead, you need to join various Discord servers and post "ad" messages in the right channels or in the in-game chat. In both cases, the message also "disappears" since so many others are doing the same thing.  
That's why I thought, "There must surely be a better way to tackle this problem." So I decided to work on MinionAH.

## 🌐 Community

<a href="https://discord.gg/3TuQwwym3T">
  <img src="https://discordapp.com/api/guilds/1133219625497284638/widget.png?style=banner3" alt="Discord Server" />
</a>

## 📜 Credits

[Gigi](https://github.com/DarthGigi) - Main Developer + Had the idea  
[@ConwayTech](https://github.com/ConwayTech-Dev) - Side Developer + Does a few other things

# 🔒 Privacy/Data

Here is all the data stored with MinionAH (more technical stuff incoming):​

- IP: Whether you are logged in or not, we store your IP on the server (not the database) solely for rate-limiting purposes. You can make 60 requests per minute (searching/filtering, loading more minions, logging in, basically every time you do something on the website even loading the website, is a request). This is to prevent any malicious users from spamming requests and overloading the database and hosting provider (in which case we would need to pay more). Again, since this is not stored in the database but the server itself, not even I can see your IP.​

If you log in via Discord, I get "access" to your Discord account, but the "access" is very limited (this is how every "Sign in via Discord" app/bot/website works).  
Basically, Discord sends an extremely limited authentication token for your account so we can request the necessary info about your account for the website. Here is what info we request from Discord and store in the database:

- Discord ID
- Username
- Avatar
- Banner
- Accent color
- Locale (not doing anything with it, but might add localization support later)
- Date/time of last logged in (not data that Discord gives me, but needed so that I can delete accounts that were last logged in an X amount of days/months ago, not sure how long I should make this yet).

# 🤝 Contributing

Feel free to contribute to MinionAH! Just make a Pull Request.

## 🧰 Setup for Development

1. Clone the repository

   ```bash
    git clone https://github.com/DarthGigi/MinionAH.git
   ```

2. Go into the directory

   ```bash
    cd MinionAH
   ```

3. Install the dependencies

   ```bash
    pnpm install
   ```

4. Add an `.env` file with the same contents as `.env.example` and fill in the values.

5. Run the database initialization script

   ```bash
    npx prisma db push
   ```

   and

   ```bash
    npx prisma generate
   ```

6. Start the development server

   ```bash
    pnpm dev
   ```

7. Open `src/routes/api/resetminions/+server.ts`, remove

   ```js
   return new Response(null, {
     status: 302,
     headers: {
       location: "/"
     }
   });
   ```

   and open [localhost:5127/api/loadMinions](http://localhost:5127/api/loadMinions) with your browser to fill the database with minions.

## 📝 License

[GNU AGPLv3](https://github.com/DarthGigi/MinionAH/blob/main/LICENSE)
