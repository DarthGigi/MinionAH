<script lang="ts">
  import { page } from "$app/stores";
  import { MinionCard } from "$lib/components/card";
  import CopyButton from "$lib/components/CopyButton.svelte";
  import * as Avatar from "$lib/components/ui/avatar";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<svelte:head>
  <title>{data.userMinion.user.username}'s {data.userMinion.minion.name.replace(/ [IVX]+$/, "")}{data.userMinion.amount && data.userMinion.amount > 1 ? "s" : ""} — MinionAH</title>
  <meta name="title" content="{data.userMinion.user.username}'s {data.userMinion.minion.name.replace(/ [IVX]+$/, '')}{data.userMinion.amount && data.userMinion.amount > 1 ? 's' : ''} — MinionAH" />
  <meta name="description" content={`${data.userMinion.user.username} is selling ${data.userMinion.amount ? data.userMinion.amount : 0} ${data.userMinion.minion.name.replace(/ [IVX]+$/, "")}${data.userMinion.amount && data.userMinion.amount > 1 ? "s" : ""}. Check out their listing on MinionAH!`} />
  <meta name="theme-color" content={data.color.toString()} />
  <link rel="canonical" href="https://minionah.com/{$page.params.user}/{$page.params.minionID}" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://minionah.com/{$page.params.user}/{$page.params.minionID}" />
  <meta property="og:title" content="{data.userMinion.user.username}'s {data.userMinion.minion.name.replace(/ [IVX]+$/, '')}{data.userMinion.amount && data.userMinion.amount > 1 ? 's' : ''} — MinionAH" />
  <meta property="og:description" content={`${data.userMinion.user.username} is selling ${data.userMinion.amount ? data.userMinion.amount : 0} ${data.userMinion.minion.name.replace(/ [IVX]+$/, "")}${data.userMinion.amount && data.userMinion.amount > 1 ? "s" : ""}. Check out their auction on MinionAH!`} />
  <meta property="og:image" content="https://minionah.com/{$page.params.user}/{$page.params.minionID}/og" />
  <meta property="og:image:secure_url" content="https://minionah.com/{$page.params.user}/{$page.params.minionID}/og" />
  <meta property="og:image:alt" content="{data.userMinion.user.username}'s {data.userMinion.minion.name.replace(/ [IVX]+$/, '')}{data.userMinion.amount && data.userMinion.amount > 1 ? 's' : ''} — MinionAH" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:site_name" content="MinionAH" />
  <meta property="og:locale" content="en_US" />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="https://minionah.com/{$page.params.user}/{$page.params.minionID}" />
  <meta property="twitter:title" content="{data.userMinion.user.username}'s {data.userMinion.minion.name.replace(/ [IVX]+$/, '')}{data.userMinion.amount && data.userMinion.amount > 1 ? 's' : ''} — MinionAH" />
  <meta property="twitter:description" content={`${data.userMinion.user.username} is selling ${data.userMinion.amount ? data.userMinion.amount : 0} ${data.userMinion.minion.name.replace(/ [IVX]+$/, "")}${data.userMinion.amount && data.userMinion.amount > 1 ? "s" : ""}. Check out their auction on MinionAH!`} />
  <meta property="twitter:image" content="https://minionah.com/{$page.params.user}/{$page.params.minionID}/og" />
</svelte:head>

<div class="flex h-[calc(100vh-64px)] w-screen items-center justify-center">
  <div class="relative w-full max-w-sm rounded-lg border border-neutral-700 bg-neutral-800 shadow">
    <a href={`/${data.userMinion.user.username}`} class="absolute left-2 top-2 rounded-lg bg-neutral-700 bg-opacity-0 p-1.5 text-sm text-neutral-400 opacity-30 transition-all duration-300 hover:bg-opacity-100 hover:opacity-100">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </a>
    <CopyButton
      class="absolute right-2 top-2"
      on:click={() => {
        // copy url to clipboard
        navigator.clipboard.writeText(`${window.location.href}/`);
      }}
    />

    <a href={`/${data.userMinion.user.username}/chat`} class="relative z-10 mx-20 mt-5 flex flex-col items-center rounded py-5 transition-all duration-300 hover:scale-110 hover:bg-neutral-600">
      <Avatar.Root class="mb-3 h-24 w-24 rounded-full bg-neutral-700 shadow-lg">
        <Avatar.Image class="pointer-events-none h-full w-full p-2" src={`data:image/png;base64,${data.userMinion.user.avatar}`} alt={data.userMinion.user.username} />
        <Avatar.Fallback class="border-2 border-neutral-600 bg-neutral-800">{data.userMinion.user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
      </Avatar.Root>
      <h5 class="mb-1 text-xl font-medium text-white">{data.userMinion.user.username}</h5>
    </a>

    <ul class="mt-2">
      <MinionCard minion={data.userMinion} />
    </ul>
  </div>
</div>
