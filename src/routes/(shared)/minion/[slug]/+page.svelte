<script lang="ts">
  import type { PageData } from "./$types";
  import Card from "$lib/components/Card.svelte";
  import { page } from "$app/stores";

  export let data: PageData;

  $: minion = data.minion;

  let copied = false;
</script>

<svelte:head>
  <title>{minion.user.username}'s MinionAH</title>
  <meta name="title" content="{minion.user.username}'s {minion.minion.name.replace(/ [IVX]+$/, '')}{minion.amount && minion.amount > 1 ? 's' : ''} — MinionAH" />
  <meta name="description" content={`${minion.user.username} is selling ${minion.amount ? minion.amount : 0} ${minion.minion.name.replace(/ [IVX]+$/, "")}${minion.amount && minion.amount > 1 ? "s" : ""}. Check out their listing on MinionAH!`} />
  <meta name="theme-color" content={data.color} />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://minions.mrgigi.me/minion/{$page.params.slug}" />
  <meta property="og:title" content="{minion.user.username}'s {minion.minion.name.replace(/ [IVX]+$/, '')}{minion.amount && minion.amount > 1 ? 's' : ''} — MinionAH" />
  <meta property="og:description" content={`${minion.user.username} is selling ${minion.amount ? minion.amount : 0} ${minion.minion.name.replace(/ [IVX]+$/, "")}${minion.amount && minion.amount > 1 ? "s" : ""}. Check out their listing on MinionAH!`} />
  <meta property="og:image" content="https://minions.mrgigi.me/minion/{$page.params.slug}/og" />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="https://minions.mrgigi.me/minion/{$page.params.slug}" />
  <meta property="twitter:title" content="{minion.user.username}'s {minion.minion.name.replace(/ [IVX]+$/, '')}{minion.amount && minion.amount > 1 ? 's' : ''} — MinionAH" />
  <meta property="twitter:description" content={`${minion.user.username} is selling ${minion.amount ? minion.amount : 0} ${minion.minion.name.replace(/ [IVX]+$/, "")}${minion.amount && minion.amount > 1 ? "s" : ""}. Check out their listing on MinionAH!`} />
  <meta property="twitter:image" content="https://minions.mrgigi.me/minion/{$page.params.slug}/og" />
</svelte:head>

<div class="w-screen h-[calc(100vh-64px)] flex justify-center items-center">
  <div class="w-full relative max-w-sm border rounded-lg shadow bg-neutral-800 border-neutral-700">
    <button
      id="minionButton"
      data-dropdown-toggle="dropdown"
      class="absolute right-3 top-3 text-neutral-400 group bg-neutral-700 focus:ring-4 focus:outline-none focus:ring-transparent rounded-lg text-sm p-1.5"
      type="button"
      on:click={() => {
        // copy url to clipboard
        navigator.clipboard.writeText(window.location.href);
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
    <div class="z-50 scale-0 opacity-0 transition-all duration-300 right-12 flex justify-center items-center h-8 top-3 overflow-hidden rounded-md border border-neutral-700 bg-popover px-2 py-1 text-xs shadow-md absolute" class:!scale-100={copied} class:!opacity-100={copied}>Copied Link</div>
    <a href="https://discord.com/users/{minion.user.id}" class="z-10 relative hover:scale-110 flex flex-col items-center mx-20 py-5 mt-5 rounded hover:bg-neutral-600 transition-all duration-300">
      <img class="w-24 h-24 mb-3 rounded-full shadow-lg" src="https://cdn.discordapp.com/avatars/{minion.user.id}/{minion.user.avatar}?size=1024" alt="Bonnie" />
      <h5 class="mb-1 text-xl font-medium text-white">{minion.user.username}</h5>
      <span class="text-sm text-neutral-400">{minion.user.id}</span>
    </a>

    <ul>
      <Card seller={minion} />
    </ul>
  </div>
</div>
