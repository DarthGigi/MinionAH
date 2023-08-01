<script lang="ts">
  import type { PageData } from "./$types";
  import type { MinionSeller, User } from "@prisma/client";
  import Card from "$lib/components/Card.svelte";
  import { page } from "$app/stores";
  import CardLoading from "$lib/components/CardLoading.svelte";

  export let data: PageData;
  $: userprofile = data.userprofile as User & { minions: MinionSeller[] };
  $: minions = data.streamed.minions;

  let copied = false;
</script>

<svelte:head>
  <title>{userprofile.username}'s MinionAH</title>
  <meta name="title" content="{userprofile.username}'s MinionAH" />
  <meta name="description" content={`Check out ${userprofile.username}'s profile on MinionAH!`} />
  <meta name="theme-color" content={data.color} />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://minions.mrgigi.me/{$page.params.user}" />
  <meta property="og:title" content="{userprofile.username}'s MinionAH" />
  <meta property="og:description" content={`Check out ${userprofile.username}'s profile on MinionAH!`} />
  <meta property="og:image" content="https://minions.mrgigi.me/{$page.params.user}/og" />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="https://minions.mrgigi.me/{$page.params.user}" />
  <meta property="twitter:title" content="{userprofile.username}'s MinionAH" />
  <meta property="twitter:description" content={`Check out ${userprofile.username}'s profile on MinionAH!`} />
  <meta property="twitter:image" content="https://minions.mrgigi.me/{$page.params.user}/og" />
</svelte:head>

<div id="container" class="w-full flex flex-col justify-center md:h-[calc(100vh_-_64px)] pt-6">
  <div class="w-full relative mx-auto max-w-sm border rounded-lg shadow bg-neutral-800 border-neutral-700">
    <button
      id="minionButton"
      data-dropdown-toggle="dropdown"
      class="absolute right-3 top-3 text-neutral-400 group bg-neutral-700 focus:ring-4 focus:outline-none focus:ring-transparent rounded-lg text-sm p-1.5"
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
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="group-hover:text-white transition-colors duration-300 w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 text-green-400 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      {/if}
    </button>
    <div class="scale-0 opacity-0 transition-all duration-300 right-12 flex justify-center items-center h-8 top-3 overflow-hidden rounded-md border border-neutral-700 bg-popover px-2 py-1 text-xs shadow-md absolute" class:!scale-100={copied} class:!opacity-100={copied}>Copied Link</div>
    <a href="https://discord.com/users/{userprofile.id}" class="relative hover:scale-110 flex flex-col items-center mx-20 py-5 my-5 rounded hover:bg-neutral-600 transition-all duration-300">
      <img class="w-24 h-24 mb-3 rounded-full shadow-lg" src="https://cdn.discordapp.com/avatars/{userprofile.id}/{userprofile.avatar}?size=1024" alt="Bonnie" />
      <h5 class="mb-1 text-xl font-medium text-white">{userprofile.username}</h5>
      <span class="text-sm text-neutral-400">{userprofile.id}</span>
    </a>
  </div>
  <div class="py-8">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <ul role="list" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {#await minions}
          {#each Array(9) as _}
            <CardLoading />
          {/each}
        {:then minions}
          {#if minions.length !== 0}
            {#each minions as minion}
              <Card seller={minion} />
            {/each}
          {:else}
            {void document.getElementById("container").classList.add("h-[calc(100vh_-_64px)]") ?? ""}
            <div class="w-full flex col-span-3 justify-center items-center">
              <h3 class="font-semibold text-neutral-200/40">{userprofile.username} has no minions</h3>
            </div>
          {/if}
        {/await}
      </ul>
    </div>
  </div>
</div>
