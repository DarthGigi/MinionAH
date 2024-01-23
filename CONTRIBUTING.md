# 🤝 Contributing to MinionAH

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. See the [Table of Contents](#-table-of-contents) for different ways to help and details about how this project handles them. Please make sure to read the relevant section before making your contribution. It will make it a lot easier for us maintainers and smooth out the experience for all involved. The community looks forward to your contributions. 🎉

> And if you like the project, but just don't have time to contribute, that's fine. There are other easy ways to support the project and show your appreciation, which we would also be very happy about:
>
> - Star the project
> - Tweet about it
> - Refer this project in your project's readme
> - Share the project with others and tell your friends about it

# 📑 Table of Contents

- [📑 Table of Contents](#-table-of-contents)
- [🧰 Setup for Development](#-setup-for-development)
  - [📦 Prerequisites](#-prerequisites)
  - [🚀 Getting Started](#-getting-started)
- [🔀 Pull Requests](#-pull-requests)
- [🐛 Issues](#-issues)

# 🧰 Setup for Development

This section will guide you through the process of setting up the project for development.

## 📦 Prerequisites

- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/en/) (v20 or higher)
- [pnpm](https://pnpm.js.org/en/installation) (recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (v7.0 or higher) (this project uses MongoDB Atlas, but you can use a local instance if you want)
- [Vercel](https://vercel.com/) (this project uses Vercel for hosting and deployment, so your fork should be Vercel compatible)

## 🚀 Getting Started

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
    pnpx prisma db push && pnpx prisma generate
   ```

6. Start the development server

   ```bash
    pnpm dev
   ```

   This will get rid of TypeScript errors and warnings.

7. Open `src/routes/api/resetminions/+server.ts`, remove

   ```js
   return new Response(null, {
     status: 302,
     headers: {
       location: "/"
     }
   });
   ```

   at the top of the file, and open [localhost:5173/api/resetminions](http://localhost:5173/api/resetminions) with your browser to fill the database with all the Hypixel SkyBlock minions and their data.

8. Done! You can now start making changes to the code and see them reflected in the browser.

9. (Optional) You should probably make an account so you can work on stuff where you need to be logged in. You can do this by going to [localhost:5173/login](http://localhost:5173/login) and clicking the "Sign up" button.

# 🔀 Pull Requests

Before making a pull request, please make sure that:

1. Your code is formatted with [Prettier](https://prettier.io/).
2. Your code does not have any TypeScript errors or warnings.
3. Your changes do not break any existing functionality (unless that's the point of the PR).
4. Your code builds successfully locally.
5. Your code builds and deploys successfully on Vercel.

# 🐛 Issues

If you find a bug or have a feature request, please open an issue with the relevant template.
Make sure to check if there is already an issue for it before opening a new one. If there is, you can comment on the existing issue to show your support for it.
