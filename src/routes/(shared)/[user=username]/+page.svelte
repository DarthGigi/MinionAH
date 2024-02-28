<script lang="ts">
  import { page } from "$app/stores";
  import CardLoading from "$lib/components/CardLoading.svelte";
  import CopyButton from "$lib/components/CopyButton.svelte";
  import { MinionCard } from "$lib/components/card";
  import * as Avatar from "$lib/components/ui/avatar";
  import MessagesSquare from "lucide-svelte/icons/messages-square";
  import type { PageData } from "./$types";

  export let data: PageData;

  let copied = false;
</script>

<svelte:head>
  <title>{data.minionuser.username}'s MinionAH</title>
  <meta name="title" content="{data.minionuser.username}'s MinionAH" />
  <meta name="description" content={`Check out ${data.minionuser.username}'s profile on MinionAH!`} />
  <meta name="theme-color" content={data.color.toString()} />
  <link rel="canonical" href="https://minionah.com/{$page.params.user}" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://minionah.com/{$page.params.user}" />
  <meta property="og:title" content="{data.minionuser.username}'s MinionAH" />
  <meta property="og:description" content={`Check out ${data.minionuser.username}'s profile on MinionAH!`} />
  <meta property="og:image" content="https://og.minionah.com/user/{$page.params.user}" />
  <meta property="og:image:secure_url" content="https://og.minionah.com/user/{$page.params.user}" />
  <meta property="og:image:alt" content="{data.minionuser.username}'s Profile — MinionAH" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:site_name" content="MinionAH" />
  <meta property="og:locale" content="en_US" />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="https://minionah.com/{$page.params.user}" />
  <meta property="twitter:title" content="{data.minionuser.username}'s MinionAH" />
  <meta property="twitter:description" content={`Check out ${data.minionuser.username}'s profile on MinionAH!`} />
  <meta property="twitter:image" content="https://og.minionah.com/user/{$page.params.user}" />
</svelte:head>

<div id="container" class="flex w-full flex-col justify-center pt-6 md:h-[calc(100vh_-_64px)]">
  <div class="relative mx-auto w-full max-w-sm rounded-lg border border-accent bg-secondary shadow">
    <a href={`/${data.minionuser.username}/chat`} data-sveltekit-preload-data="off" class="group absolute left-3 top-3 rounded-lg bg-accent p-1.5 text-sm text-muted-foreground focus:outline-none focus:ring-4 focus:ring-transparent">
      <MessagesSquare class="h-5 w-5 transition-colors duration-300 group-hover:text-white" />
    </a>
    <CopyButton
      class="absolute right-3 top-3"
      on:click={() => {
        // copy url to clipboard
        navigator.clipboard.writeText(`${window.location.href}`);
      }} />
    <div class="absolute right-12 top-3 flex h-8 scale-0 items-center justify-center overflow-hidden rounded-md border border-accent bg-popover px-2 py-1 text-xs opacity-0 shadow-md transition-all duration-300" class:!scale-100={copied} class:!opacity-100={copied}>Copied Link</div>
    <a href={`/${data.minionuser.username}/chat`} data-sveltekit-preload-data="off" class="relative mx-20 my-5 flex flex-col items-center rounded py-5 transition-all duration-300 hover:scale-110 hover:bg-accent">
      <Avatar.Root class="mb-3 h-24 w-24 rounded-full bg-accent shadow-lg">
        <Avatar.Image class="pointer-events-none h-full w-full p-2" src={`https://res.cloudinary.com/minionah/image/upload/v1/users/avatars/${data.minionuser.id}`} alt={data.minionuser.username} />
        <Avatar.Fallback class="border-2 border-accent bg-accent">{data.minionuser.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
      </Avatar.Root>
      <h5 class="mb-1 text-xl font-medium text-white">{data.minionuser.username}</h5>
    </a>
  </div>
  <div class="py-8 max-md:pb-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <ul role="list" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {#await data.streamed.minions}
          {#each Array(9) as _}
            <CardLoading />
          {/each}
        {:then minions}
          {#if minions.length !== 0}
            {#each minions as minion (minion.id)}
              <MinionCard {minion} />
            {/each}
          {:else}
            {void (
              // @ts-expect-error
              document.getElementById("container").classList.add("h-[calc(100vh_-_64px)]")
            ) ?? ""}
            <div class="col-span-3 flex w-full items-center justify-center">
              <h3 class="font-semibold text-primary/40">{data.minionuser.username} has no minions</h3>
            </div>
          {/if}
        {/await}
      </ul>
    </div>
  </div>
</div>
