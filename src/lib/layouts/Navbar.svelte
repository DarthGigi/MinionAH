<script lang="ts">
  import { page } from "$app/stores";
  import * as Avatar from "$lib/components/ui/avatar";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Label } from "$lib/components/ui/label";
  import * as Popover from "$lib/components/ui/popover";
  import { Switch } from "$lib/components/ui/switch";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { preferences } from "$lib/stores/preferences";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import Info from "lucide-svelte/icons/info";
  import Plus from "lucide-svelte/icons/plus";
  import Settings from "lucide-svelte/icons/settings";

  let profileDropdownOpen = false;
  let menuDropdownOpen = false;
  let settingsOpen = false;
</script>

<nav class="select-none bg-secondary max-md:fixed max-md:bottom-0 max-md:z-50 max-md:w-full">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 flex-row-reverse justify-between md:flex-row">
      <div class="flex flex-shrink-0 items-center">
        <DropdownMenu.Root bind:open={menuDropdownOpen}>
          <DropdownMenu.Trigger class="flex items-center gap-2 rounded-md px-4 py-2 hover:bg-popover">
            <img class="pointer-events-none block h-8 w-auto transition-transform duration-300 ease-in-out" src="/assets/images/favicons/favicon.png" alt="Minion AH" class:rotate-45={menuDropdownOpen} class:max-md:-rotate-45={menuDropdownOpen} />
            <h1>MinionAH</h1>
            <ChevronDown class="h-4 w-4" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Content class="w-44 border-border bg-popover" transitionConfig={{ duration: 300 }}>
            <DropdownMenu.Group>
              <DropdownMenu.Item class="hover:cursor-pointer data-[highlighted]:bg-background" href="/">Home</DropdownMenu.Item>
              <DropdownMenu.Separator class="bg-border" />
              <DropdownMenu.Item target="_blank" class="hover:cursor-pointer data-[highlighted]:bg-background" href="https://newsroom.minionah.com">Newsroom</DropdownMenu.Item>
              <DropdownMenu.Item target="_blank" class="hover:cursor-pointer data-[highlighted]:bg-background" href="https://discord.minionah.com">Community</DropdownMenu.Item>
              <DropdownMenu.Separator class="bg-border" />
              <DropdownMenu.Item target="_blank" class="hover:cursor-pointer data-[highlighted]:bg-background" href="https://newsroom.minionah.com/minionah/">About</DropdownMenu.Item>
              <DropdownMenu.Item target="_blank" class="ml-2 hover:cursor-pointer data-[highlighted]:bg-background" href="https://github.com/DarthGigi/MinionAH">GitHub</DropdownMenu.Item>
              <DropdownMenu.Item target="_blank" class="ml-2 hover:cursor-pointer data-[highlighted]:bg-background" href="https://newsroom.minionah.com/privacy-policy">Privacy Policy</DropdownMenu.Item>
              <DropdownMenu.Item target="_blank" class="ml-2 hover:cursor-pointer data-[highlighted]:bg-background" href="https://newsroom.minionah.com/terms-of-service">Terms of Service</DropdownMenu.Item>
            </DropdownMenu.Group>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>

      <div class="flex flex-shrink-0 flex-row-reverse items-center justify-between gap-2 md:flex-row md:gap-4">
        {#await $page.data.user then user}
          {#if user}
            {#if $page.url.pathname !== "/profile"}
              <div class="flex-shrink-0 max-md:hidden">
                <a href="/profile" class="relative inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors duration-300 hover:bg-primary/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-secondary">
                  <Plus class="-ml-1 mr-2 h-5 w-5" />
                  <span>New Minion</span>
                </a>
              </div>
            {/if}
            <div class="flex flex-shrink-0 items-center">
              <DropdownMenu.Root bind:open={profileDropdownOpen}>
                <DropdownMenu.Trigger class="relative">
                  <Avatar.Root class="items-center justify-center bg-accent">
                    <Avatar.Image class="pointer-events-none h-full w-full p-1" src={`https://res.cloudinary.com/minionah/image/upload/v1/users/avatars/${user.id}`} alt={user.username} />
                    <Avatar.Fallback class="border-2 border-border bg-accent">{user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                  </Avatar.Root>
                  {#if !$page.url.pathname.includes("chat")}
                    {#if $page.data.unreadChats}
                      {#if !profileDropdownOpen}
                        <span class="absolute -right-0.5 top-0.5 flex h-3 w-3 transition-all duration-300" class:opacity-0={profileDropdownOpen} class:scale-0={profileDropdownOpen}>
                          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-muted-foreground opacity-75" />
                          <span class="relative inline-flex h-3 w-3 rounded-full bg-ring" />
                        </span>
                      {/if}
                    {/if}
                  {/if}
                </DropdownMenu.Trigger>
                <DropdownMenu.Content class="border-border bg-popover">
                  <DropdownMenu.Group>
                    <DropdownMenu.Item href="/profile" class="cursor-pointer data-[highlighted]:bg-background">Profile</DropdownMenu.Item>
                    <DropdownMenu.Item href="/profile/settings" class="ml-2 cursor-pointer data-[highlighted]:bg-background">Settings</DropdownMenu.Item>
                  </DropdownMenu.Group>
                  <DropdownMenu.Separator class="bg-border" />
                  <DropdownMenu.Group>
                    {#if $page.data.isAdmin}
                      <DropdownMenu.Item href="/dashboard" class="cursor-pointer data-[highlighted]:bg-background">Dashboard</DropdownMenu.Item>
                    {/if}
                    <DropdownMenu.Item href="/profile/chats" class="relative cursor-pointer data-[highlighted]:bg-background"
                      >Chats
                      {#if !$page.url.pathname.includes("chat")}
                        {#if $page.data.unreadChats}
                          {#if profileDropdownOpen}
                            <span class="absolute right-2 top-1/2 flex h-3 w-3 -translate-y-1/2 transition-all delay-1000 duration-300">
                              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-muted-foreground opacity-75" />
                              <span class="relative inline-flex h-3 w-3 rounded-full bg-ring" />
                            </span>
                          {/if}
                        {/if}
                      {/if}
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator class="bg-border" />
                    <DropdownMenu.Item href="/logout" class="cursor-pointer data-[highlighted]:bg-background" data-sveltekit-preload-data="off">Sign out</DropdownMenu.Item>
                  </DropdownMenu.Group>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
          {:else if $page.url.pathname !== "/login"}
            <div class="flex flex-shrink-0 items-center">
              <div class="relative ml-3">
                <div>
                  <a href="/login" class="relative inline-flex items-center rounded-md border border-transparent bg-ring px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-300 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-secondary"> Login </a>
                </div>
              </div>
            </div>
          {/if}
        {/await}
        <Popover.Root bind:open={settingsOpen}>
          <Popover.Trigger aria-label="Settings">
            <Settings class={`text-accent transition-all duration-300 hover:text-accent-foreground/50 ${settingsOpen ? "rotate-45 !text-white" : ""}`} />
          </Popover.Trigger>
          <Popover.Content sideOffset={8} class="border-border bg-popover">
            <div class="flex flex-col gap-4">
              <div class="space-y-2">
                <h4 class="font-medium leading-none">Preferences</h4>
                <p class="text-xs text-muted-foreground">Set your preferences for MinionAH.</p>
              </div>
              <div class="grid gap-2">
                <div class="grid w-full grid-cols-2 items-center justify-between gap-4">
                  <Label>Roman Numerals</Label>
                  <Switch
                    checked={$preferences.romanNumerals}
                    onCheckedChange={(checked) => {
                      preferences.update((state) => ({ ...state, romanNumerals: checked }));
                    }} />
                </div>
                <div class="grid w-full grid-cols-2 items-center justify-between gap-4">
                  <Label>Minecraft Font</Label>
                  <Switch
                    checked={$preferences.minecraftFont}
                    onCheckedChange={(checked) => {
                      preferences.update((state) => ({ ...state, minecraftFont: checked }));
                    }} />
                </div>
              </div>
            </div>
            <Tooltip.Root closeDelay={0} openDelay={0} closeOnPointerDown={false}>
              <Tooltip.Trigger class="absolute right-1 top-2 text-accent hover:text-accent-foreground">
                <Info class="h-4" />
              </Tooltip.Trigger>
              <Tooltip.Content class="border-border bg-popover">
                <p>These preferences are saved in your browser</p>
              </Tooltip.Content>
            </Tooltip.Root>
          </Popover.Content>
        </Popover.Root>
      </div>
    </div>
  </div>
</nav>
