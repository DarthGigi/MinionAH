<script lang="ts">
  import { page } from "$app/stores";
  import Card from "$lib/components/Card.svelte";
  import type { Seller } from "$lib/types";
  import type { PageData } from "./$types";
  import MinionCopyButton from "$lib/components/MinionCopyButton.svelte";
  import * as Avatar from "$lib/components/ui/avatar";

  export let data: PageData;

  $: minion = data.minion as Seller;
</script>

<svelte:head>
  <title>{minion.user.username}'s MinionAH</title>
  <meta name="title" content="{minion.user.username}'s {minion.minion.name.replace(/ [IVX]+$/, '')}{minion.amount && minion.amount > 1 ? 's' : ''} — MinionAH" />
  <meta name="description" content={`${minion.user.username} is selling ${minion.amount ? minion.amount : 0} ${minion.minion.name.replace(/ [IVX]+$/, "")}${minion.amount && minion.amount > 1 ? "s" : ""}. Check out their listing on MinionAH!`} />
  <meta name="theme-color" content={data.color.toString()} />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://minions.mrgigi.me/{$page.params.user}/{$page.params.minionID}" />
  <meta property="og:title" content="{minion.user.username}'s {minion.minion.name.replace(/ [IVX]+$/, '')}{minion.amount && minion.amount > 1 ? 's' : ''} — MinionAH" />
  <meta property="og:description" content={`${minion.user.username} is selling ${minion.amount ? minion.amount : 0} ${minion.minion.name.replace(/ [IVX]+$/, "")}${minion.amount && minion.amount > 1 ? "s" : ""}. Check out their listing on MinionAH!`} />
  <meta property="og:image" content="https://minions.mrgigi.me/{$page.params.user}/{$page.params.minionID}/og" />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="https://minions.mrgigi.me/{$page.params.user}/{$page.params.minionID}" />
  <meta property="twitter:title" content="{minion.user.username}'s {minion.minion.name.replace(/ [IVX]+$/, '')}{minion.amount && minion.amount > 1 ? 's' : ''} — MinionAH" />
  <meta property="twitter:description" content={`${minion.user.username} is selling ${minion.amount ? minion.amount : 0} ${minion.minion.name.replace(/ [IVX]+$/, "")}${minion.amount && minion.amount > 1 ? "s" : ""}. Check out their listing on MinionAH!`} />
  <meta property="twitter:image" content="https://minions.mrgigi.me/{$page.params.user}/{$page.params.minionID}/og" />
</svelte:head>

<div class="flex h-[calc(100vh-64px)] w-screen items-center justify-center">
  <div class="relative w-full max-w-sm rounded-lg border border-neutral-700 bg-neutral-800 shadow">
    <a href={`/${minion.user.username}`} class="absolute left-2 top-2 rounded-lg bg-neutral-700 bg-opacity-0 p-1.5 text-sm text-neutral-400 opacity-30 transition-all duration-300 hover:bg-opacity-100 hover:opacity-100">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </a>
    <MinionCopyButton
      class="absolute right-2 top-2"
      on:click={() => {
        // copy url to clipboard
        navigator.clipboard.writeText(`${window.location.href}/`);
      }}
    />

    <a href="https://discord.com/users/{minion.user.id}" target="_blank" rel="noopener" class="relative z-10 mx-20 mt-5 flex flex-col items-center rounded py-5 transition-all duration-300 hover:scale-110 hover:bg-neutral-600">
      <Avatar.Root class="mb-3 h-24 w-24 rounded-full shadow-lg">
        <Avatar.Image class="pointer-events-none" src="https://cdn.discordapp.com/avatars/{minion.user.id}/{minion.user.avatar}?size=1024" alt={minion.user.username} />
        <Avatar.Fallback class="border-2 border-neutral-600 bg-neutral-800">{minion.user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
      </Avatar.Root>
      <h5 class="mb-1 text-xl font-medium text-white">{minion.user.username}</h5>
      <span class="text-sm text-neutral-400">{minion.user.id}</span>
    </a>

    <ul>
      <Card {minion} />
    </ul>
  </div>
</div>
