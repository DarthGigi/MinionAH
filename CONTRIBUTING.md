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
- [Node.js](https://nodejs.org/en/)
  - Version 20 or higher
- [pnpm](https://pnpm.js.org/en/installation)
- [Supabase](https://supabase.io/)
  - This project uses Supabase for the database, so you will need to create an account and get your URL and API key or have a local Supabase instance running

### Optional

These are optional, they're not required for development if you don't plan on changing the features that use them.

- [Vercel](https://vercel.com/)
  - This project uses Vercel for hosting and deployment, so your fork should be Vercel compatible
- [Cloudinary](https://cloudinary.com/)
  - Cloudinary is used for image hosting, if you plan on changing the upload mechanism, you will need to create an account
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
  - Firebase Cloud Messaging is used for sending device notifications, if you plan on changing the notification mechanism, you will need to create an account
- [Resend](https://resend.com/)
  - Resend is used for sending emails, if you plan on changing the email mechanism, you will need to create an account. To change the email templates check the [MinionAH Next](https://github.com/DarthGigi/MinionAH-Next) project.

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
    pnpm prisma:db:push:dev && pnpm prisma:generate:dev
   ```

6. Start the development server

   ```bash
    pnpm dev
   ```

   This will get rid of TypeScript errors and warnings.

7. Open [localhost:5173/signup](http://localhost:5173/login) to make an account.

8. After making an account, add your ID to the `ADMIN_ID` field in the `.env` file.

9. Open [localhost:5173/dashboard/minions](http://localhost:5173/dashboard/minions), click the "Actions" button, and then click "Update every minion". This will add all the Hypixel SkyBlock minions to the database.

10. Done! You can now start making changes to the code and see them reflected in the browser.

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
