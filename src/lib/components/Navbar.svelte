<script lang="ts">
  import { page } from "$app/stores";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import * as Avatar from "$lib/components/ui/avatar";
  import type { User } from "@prisma/client";
  import { fade } from "svelte/transition";

  let user: User;
  $: user = $page.data.user;

  let profileDropdownOpen = false;
  let menuDropdownOpen = false;
</script>

<nav class="bg-neutral-800 max-md:fixed max-md:bottom-0 max-md:z-50 max-md:w-full">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 flex-row-reverse justify-between md:flex-row">
      <div class="flex flex-shrink-0 items-center">
        <DropdownMenu.Root bind:open={menuDropdownOpen}>
          <DropdownMenu.Trigger class="flex items-center gap-2 rounded-md px-4 py-2 hover:bg-neutral-900">
            <img class="pointer-events-none block h-8 w-auto transition-transform duration-300 ease-in-out" src="/assets/images/favicons/favicon.png" alt="Minion AH" class:rotate-45={menuDropdownOpen} />
            <h1>MinionAH</h1>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content class="w-44 border-neutral-700 bg-neutral-800" transitionConfig={{ duration: 300 }}>
            <DropdownMenu.Group>
              <DropdownMenu.Item class="hover:cursor-pointer data-[highlighted]:bg-neutral-900" href="/">Home</DropdownMenu.Item>
              <DropdownMenu.Separator class="bg-neutral-700" />
              <DropdownMenu.Item target="_blank" class="hover:cursor-pointer data-[highlighted]:bg-neutral-900" href="https://newsroom.minionah.com">Newsroom</DropdownMenu.Item>
              <DropdownMenu.Item target="_blank" class="hover:cursor-pointer data-[highlighted]:bg-neutral-900" href="https://discord.minionah.com">Community</DropdownMenu.Item>
              <DropdownMenu.Separator class="bg-neutral-700" />
              <DropdownMenu.Item target="_blank" class="hover:cursor-pointer data-[highlighted]:bg-neutral-900" href="https://newsroom.minionah.com/minionah/">About</DropdownMenu.Item>
              <DropdownMenu.Item target="_blank" class="ml-2 hover:cursor-pointer data-[highlighted]:bg-neutral-900" href="https://github.com/DarthGigi/MinionAH">GitHub</DropdownMenu.Item>
              <DropdownMenu.Item target="_blank" class="ml-2 hover:cursor-pointer data-[highlighted]:bg-neutral-900" href="https://newsroom.minionah.com/privacy-policy">Privacy Policy</DropdownMenu.Item>
              <DropdownMenu.Item target="_blank" class="ml-2 hover:cursor-pointer data-[highlighted]:bg-neutral-900" href="https://newsroom.minionah.com/terms-of-service">Terms of Service</DropdownMenu.Item>
            </DropdownMenu.Group>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>

      <div class="flex flex-shrink-0 flex-row-reverse items-center justify-between gap-2 md:flex-row md:gap-4">
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
          <div class="flex flex-shrink-0 items-center">
            <DropdownMenu.Root bind:open={profileDropdownOpen}>
              <DropdownMenu.Trigger class="relative">
                <Avatar.Root class="items-center justify-center bg-neutral-700">
                  <Avatar.Image class="pointer-events-none h-full w-full p-1" src={`data:image/png;base64,${user.avatar}`} alt={user.username} />
                  <Avatar.Fallback class="border-2 border-neutral-600 bg-neutral-800">{user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                </Avatar.Root>
                {#if $page.url.pathname === "/"}
                  {#await $page.data.props.user then user}
                    {#await $page.data.props.unreadChats then unreadChats}
                      {#if unreadChats}
                        {@const read = unreadChats.user1_id === user.id ? unreadChats.user1Read : unreadChats.user2Read}
                        {#if !read}
                          <span class="absolute right-0.5 top-0.5 flex h-3 w-3 transition-all duration-300" class:opacity-0={profileDropdownOpen} class:scale-0={profileDropdownOpen}>
                            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-neutral-400 opacity-75" />
                            <span class="relative inline-flex h-3 w-3 rounded-full bg-neutral-500" />
                          </span>
                        {/if}
                      {/if}
                    {/await}
                  {/await}
                {/if}
              </DropdownMenu.Trigger>
              <DropdownMenu.Content class="border-0 bg-neutral-700">
                <DropdownMenu.Group>
                  <DropdownMenu.Label>My Account</DropdownMenu.Label>
                  <DropdownMenu.Separator class="bg-neutral-800" />
                  <DropdownMenu.Item href="/profile" class="cursor-pointer">Profile</DropdownMenu.Item>
                  <DropdownMenu.Item href="/profile/chats" class="relative cursor-pointer"
                    >Messages
                    {#if $page.url.pathname === "/"}
                      {#await $page.data.props.user then user}
                        {#await $page.data.props.unreadChats then unreadChats}
                          {#if unreadChats}
                            {@const read = unreadChats.user1_id === user.id ? unreadChats.user1Read : unreadChats.user2Read}
                            {#if !read && profileDropdownOpen}
                              <span transition:fade={{ delay: 5000 }} class="absolute right-2 top-1/2 flex h-3 w-3 -translate-y-1/2 transition-all delay-1000 duration-300">
                                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-neutral-400 opacity-75" />
                                <span class="relative inline-flex h-3 w-3 rounded-full bg-neutral-500" />
                              </span>
                            {/if}
                          {/if}
                        {/await}
                      {/await}
                    {/if}
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator class="bg-neutral-600" />
                  <DropdownMenu.Item href="/logout" class="cursor-pointer" data-sveltekit-preload-data="off">Sign out</DropdownMenu.Item>
                </DropdownMenu.Group>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        {:else if $page.url.pathname !== "/login"}
          <div class="flex flex-shrink-0 items-center">
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
