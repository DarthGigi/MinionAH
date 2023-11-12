<script lang="ts">
  import { page } from "$app/stores";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import * as Avatar from "$lib/components/ui/avatar";
  import type { User } from "@prisma/client";

  let user: User;
  $: user = $page.data.user;
</script>

{#if $page.url.pathname !== "/login"}
  <nav class="bg-neutral-800">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 justify-between">
        <div class="flex items-center justify-center md:hidden">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Avatar.Root class="items-center justify-center">
                <Avatar.Image class="pointer-events-none h-8 w-8 rounded-full" src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}?size=64`} alt={user.username} />
                <Avatar.Fallback class="border-2 border-neutral-600 bg-neutral-700">{user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
              </Avatar.Root>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content class="translate-x-2  scale-110 border-0 bg-neutral-700">
              <DropdownMenu.Group>
                <DropdownMenu.Label>My Account</DropdownMenu.Label>
                <DropdownMenu.Separator class="bg-neutral-800" />
                <DropdownMenu.Item asChild>
                  <a href="/profile" class="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground">Profile</a>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <a data-sveltekit-preload-data="off" href="/logout" class="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground">Sign out</a>
                </DropdownMenu.Item>
              </DropdownMenu.Group>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>

        <div class="flex flex-shrink-0 items-center">
          <a href="/" class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-neutral-300 transition-colors duration-300 hover:bg-neutral-700 hover:text-white">
            <img class="pointer-events-none block h-8 w-auto" src="/assets/images/favicons/favicon.png" alt="Minion AH" />
            <h1>Minion AH</h1>
          </a>
        </div>

        <div class="flex items-center gap-4">
          <div class="hidden flex-shrink-0 md:block">
            <a href="https://minions.mrgigi.me/discord" class="relative inline-flex flex-row items-center justify-center rounded-md border border-transparent bg-neutral-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-300 hover:bg-[#5865F2] focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-neutral-800">
              <!-- Heroicon name: mini/plus -->
              <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.3034 5.33716C17.9344 4.71103 16.4805 4.2547 14.9629 4C14.7719 4.32899 14.5596 4.77471 14.411 5.12492C12.7969 4.89144 11.1944 4.89144 9.60255 5.12492C9.45397 4.77471 9.2311 4.32899 9.05068 4C7.52251 4.2547 6.06861 4.71103 4.70915 5.33716C1.96053 9.39111 1.21766 13.3495 1.5891 17.2549C3.41443 18.5815 5.17612 19.388 6.90701 19.9187C7.33151 19.3456 7.71356 18.73 8.04255 18.0827C7.41641 17.8492 6.82211 17.5627 6.24904 17.2231C6.39762 17.117 6.5462 17.0003 6.68416 16.8835C10.1438 18.4648 13.8911 18.4648 17.3082 16.8835C17.4568 17.0003 17.5948 17.117 17.7434 17.2231C17.1703 17.5627 16.576 17.8492 15.9499 18.0827C16.2789 18.73 16.6609 19.3456 17.0854 19.9187C18.8152 19.388 20.5875 18.5815 22.4033 17.2549C22.8596 12.7341 21.6806 8.80747 19.3034 5.33716ZM8.5201 14.8459C7.48007 14.8459 6.63107 13.9014 6.63107 12.7447C6.63107 11.5879 7.45884 10.6434 8.5201 10.6434C9.57071 10.6434 10.4303 11.5879 10.4091 12.7447C10.4091 13.9014 9.57071 14.8459 8.5201 14.8459ZM15.4936 14.8459C14.4535 14.8459 13.6034 13.9014 13.6034 12.7447C13.6034 11.5879 14.4323 10.6434 15.4936 10.6434C16.5442 10.6434 17.4038 11.5879 17.3825 12.7447C17.3825 13.9014 16.5548 14.8459 15.4936 14.8459Z" /></svg>
              <span>Community</span>
            </a>
          </div>
          {#if $page.url.pathname !== "/profile" && user}
            <div class="flex-shrink-0">
              <a href="/profile" class="relative inline-flex items-center rounded-md border border-transparent bg-neutral-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-300 hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-neutral-800">
                <!-- Heroicon name: mini/plus -->
                <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                <span>New Minion</span>
              </a>
            </div>
          {/if}
          {#if user}
            <div class="hidden md:flex md:flex-shrink-0 md:items-center">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <Avatar.Root class="items-center justify-center">
                    <Avatar.Image class="pointer-events-none h-8 w-8 rounded-full" src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}?size=64`} alt={user.username} />
                    <Avatar.Fallback class="border-2 border-neutral-600 bg-neutral-700">{user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                  </Avatar.Root>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content class="border-0 bg-neutral-700">
                  <DropdownMenu.Group>
                    <DropdownMenu.Label>My Account</DropdownMenu.Label>
                    <DropdownMenu.Separator class="bg-neutral-800" />
                    <DropdownMenu.Item asChild>
                      <a href="/profile" class="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground">Profile</a>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <a data-sveltekit-preload-data="off" href="/logout" class="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground">Sign out</a>
                    </DropdownMenu.Item>
                  </DropdownMenu.Group>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
          {:else}
            <div class="hidden md:flex md:flex-shrink-0 md:items-center">
              <div class="relative ml-3">
                <div>
                  <a href="/login" class="relative inline-flex items-center rounded-md border border-transparent bg-neutral-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-300 hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-neutral-800"> Login </a>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </nav>
{/if}
