<script lang="ts">
  import { page } from "$app/stores";
  import CopyButton from "$lib/components/CopyButton.svelte";
  import { MinionCard } from "$lib/components/card";
  import * as Avatar from "$lib/components/ui/avatar";
  import CircleArrowLeft from "lucide-svelte/icons/circle-arrow-left";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<svelte:head>
  <title>{data.userMinion.user.username}'s {data.userMinion.minion.name.replace(/ [IVX]+$/, "")}{data.userMinion.amount && data.userMinion.amount > 1 ? "s" : ""} — MinionAH</title>
  <meta name="title" content="{data.userMinion.user.username}'s {data.userMinion.minion.name.replace(/ [IVX]+$/, '')}{data.userMinion.amount && data.userMinion.amount > 1 ? 's' : ''} — MinionAH" />
  <meta name="description" content={`${data.userMinion.user.username} is selling ${data.userMinion.amount ? data.userMinion.amount : 0} ${data.userMinion.minion.name.replace(/ [IVX]+$/, "")}${data.userMinion.amount && data.userMinion.amount > 1 ? "s" : ""}. Check out their listing on MinionAH!`} />
  <meta name="theme-color" content={data.color.toString()} />
  <link rel="canonical" href="https://minionah.com/user/{$page.params.user}/{$page.params.minionID}" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://minionah.com/user/{$page.params.user}/{$page.params.minionID}" />
  <meta property="og:title" content="{data.userMinion.user.username}'s {data.userMinion.minion.name.replace(/ [IVX]+$/, '')}{data.userMinion.amount && data.userMinion.amount > 1 ? 's' : ''} — MinionAH" />
  <meta property="og:description" content={`${data.userMinion.user.username} is selling ${data.userMinion.amount ? data.userMinion.amount : 0} ${data.userMinion.minion.name.replace(/ [IVX]+$/, "")}${data.userMinion.amount && data.userMinion.amount > 1 ? "s" : ""}. Check out their auction on MinionAH!`} />
  <meta property="og:image" content="https://og.minionah.com/minion/user/{$page.params.minionID}" />
  <meta property="og:image:secure_url" content="https://og.minionah.com/minion/{$page.params.minionID}" />
  <meta property="og:image:alt" content="{data.userMinion.user.username}'s {data.userMinion.minion.name.replace(/ [IVX]+$/, '')}{data.userMinion.amount && data.userMinion.amount > 1 ? 's' : ''} — MinionAH" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:site_name" content="MinionAH" />
  <meta property="og:locale" content="en_US" />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="https://minionah.com/user/{$page.params.user}/{$page.params.minionID}" />
  <meta property="twitter:title" content="{data.userMinion.user.username}'s {data.userMinion.minion.name.replace(/ [IVX]+$/, '')}{data.userMinion.amount && data.userMinion.amount > 1 ? 's' : ''} — MinionAH" />
  <meta property="twitter:description" content={`${data.userMinion.user.username} is selling ${data.userMinion.amount ? data.userMinion.amount : 0} ${data.userMinion.minion.name.replace(/ [IVX]+$/, "")}${data.userMinion.amount && data.userMinion.amount > 1 ? "s" : ""}. Check out their auction on MinionAH!`} />
  <meta property="twitter:image" content="https://og.minionah.com/minion/{$page.params.minionID}" />
</svelte:head>

<div class="flex h-[calc(100vh-64px)] w-screen items-center justify-center">
  <div class="relative w-full max-w-sm rounded-lg border border-accent bg-secondary shadow">
    <a href={`/user/${data.userMinion.user.username}`} class="absolute left-2 top-2 rounded-lg bg-accent bg-opacity-0 p-1.5 text-sm text-muted-foreground opacity-30 transition-all duration-300 hover:bg-opacity-100 hover:opacity-100">
      <CircleArrowLeft class="h-6 w-6" />
    </a>
    <CopyButton
      class="absolute right-2 top-2"
      on:click={() => {
        // copy url to clipboard
        navigator.clipboard.writeText(`${window.location.href}`);
      }} />

    <a href={`/${data.userMinion.user.username}/chat`} data-sveltekit-preload-data="off" class="relative z-10 mx-20 mt-5 flex flex-col items-center rounded py-5 transition-all duration-300 hover:scale-110 hover:bg-accent">
      <Avatar.Root class="mb-3 h-24 w-24 rounded-full bg-accent shadow-lg">
        <Avatar.Image class="pointer-events-none h-full w-full p-2" src={`https://res.cloudinary.com/minionah/image/upload/v1/users/avatars/${data.userMinion.user.id}`} alt={data.userMinion.user.username} />
        <Avatar.Fallback class="border-2 border-accent bg-secondary">{data.userMinion.user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
      </Avatar.Root>
      <h5 class="mb-1 text-xl font-medium text-white">{data.userMinion.user.username}</h5>
    </a>

    <ul class="mt-2">
      <MinionCard minion={data.userMinion} />
    </ul>
  </div>
</div>
