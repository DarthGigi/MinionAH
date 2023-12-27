<script lang="ts">
  import { page } from "$app/stores";
  import { MinionCard } from "$lib/components/card";
  import CardLoading from "$lib/components/CardLoading.svelte";
  import * as Avatar from "$lib/components/ui/avatar";
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
  <meta property="og:image" content="https://minionah.com/{$page.params.user}/og" />
  <meta property="og:image:secure_url" content="https://minionah.com/{$page.params.user}/og" />
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
  <meta property="twitter:image" content="https://minionah.com/{$page.params.user}/og" />
</svelte:head>

<div id="container" class="flex w-full flex-col justify-center pt-6 md:h-[calc(100vh_-_64px)]">
  <div class="relative mx-auto w-full max-w-sm rounded-lg border border-neutral-700 bg-neutral-800 shadow">
    <a href={`/${data.minionuser.username}/chat`} class="group absolute left-3 top-3 rounded-lg bg-neutral-700 p-1.5 text-sm text-neutral-400 focus:outline-none focus:ring-4 focus:ring-transparent">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5 transition-colors duration-300 group-hover:text-white">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    </a>
    <button
      id="minionButton"
      data-dropdown-toggle="dropdown"
      class="group absolute right-3 top-3 rounded-lg bg-neutral-700 p-1.5 text-sm text-neutral-400 focus:outline-none focus:ring-4 focus:ring-transparent"
      type="button"
      on:click={() => {
        // copy url to clipboard
        navigator.clipboard.writeText(`${window.location.href}/`);
        // change the icon to a checkmark
        copied = true;
        // change the icon back to a minion icon after 2 seconds
        setTimeout(() => {
          copied = false;
        }, 2000);
      }}
    >
      {#if !copied}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5 transition-colors duration-300 group-hover:text-white">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5 text-green-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      {/if}
    </button>
    <div class="absolute right-12 top-3 flex h-8 scale-0 items-center justify-center overflow-hidden rounded-md border border-neutral-700 bg-popover px-2 py-1 text-xs opacity-0 shadow-md transition-all duration-300" class:!scale-100={copied} class:!opacity-100={copied}>Copied Link</div>
    <a href={`/${data.minionuser.username}/chat`} class="relative mx-20 my-5 flex flex-col items-center rounded py-5 transition-all duration-300 hover:scale-110 hover:bg-neutral-600">
      <Avatar.Root class="mb-3 h-24 w-24 rounded-full bg-neutral-700 shadow-lg">
        <Avatar.Image class="pointer-events-none h-full w-full p-2" src={`data:image/png;base64,${data.minionuser.avatar}`} alt={data.minionuser.username} />
        <Avatar.Fallback class="border-2 border-neutral-600 bg-neutral-700">{data.minionuser.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
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
              <h3 class="font-semibold text-neutral-200/40">{data.minionuser.username} has no minions</h3>
            </div>
          {/if}
        {/await}
      </ul>
    </div>
  </div>
</div>
