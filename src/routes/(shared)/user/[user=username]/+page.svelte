<script lang="ts">
  import { page } from "$app/stores";
  import CardLoading from "$lib/components/CardLoading.svelte";
  import CopyButton from "$lib/components/CopyButton.svelte";
  import { MinionCard } from "$lib/components/card";
  import * as Avatar from "$lib/components/ui/avatar";
  import MessagesSquare from "lucide-svelte/icons/messages-square";
  import type { PageData } from "./$types";
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import Earth from "lucide-svelte/icons/earth";
  import {} from "$lib/utilities";
  import { formatDistanceToNow } from "date-fns";
  import BarChart2 from "lucide-svelte/icons/bar-chart-2";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { writable } from "svelte/store";
  import { Progress } from "$lib/components/ui/progress";

  export let data: PageData;

  const warningOpen = writable(false);
  const urlToOpen = writable<string>();

  const value = writable(0);

  const startTimer = () => {
    const timer = setInterval(() => {
      value.update((v) => v + 1);
      if ($value >= 100) {
        clearInterval(timer);
      }
    }, 30);
    return () => clearInterval(timer);
  };
</script>

<svelte:head>
  <title>{data.minionuser.username}'s MinionAH</title>
  <meta name="title" content="{data.minionuser.username}'s MinionAH" />
  <meta name="description" content={`Check out ${data.minionuser.username}'s profile on MinionAH!`} />
  <link rel="canonical" href="https://minionah.com/user/{$page.params.user}" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://minionah.com/user/{$page.params.user}" />
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
  <meta property="twitter:url" content="https://minionah.com/user/{$page.params.user}" />
  <meta property="twitter:title" content="{data.minionuser.username}'s MinionAH" />
  <meta property="twitter:description" content={`Check out ${data.minionuser.username}'s profile on MinionAH!`} />
  <meta property="twitter:image" content="https://og.minionah.com/user/{$page.params.user}" />
</svelte:head>

<div class="flex w-full flex-col justify-center pt-6">
  <Card.Root class="relative mx-auto w-full max-w-sm rounded-lg border border-accent bg-secondary shadow">
    <CopyButton
      class="absolute right-3 top-3"
      on:click={() => {
        // copy url to clipboard
        navigator.clipboard.writeText(`${window.location.href}`);
      }} />
    <Card.Header>
      <Avatar.Root class="mx-auto my-5 h-24 w-24 select-none rounded-full bg-accent">
        <Avatar.Image class="pointer-events-none h-full w-full p-2" src={`https://res.cloudinary.com/minionah/image/upload/v1/users/avatars/${data.minionuser.id}`} alt={data.minionuser.username} />
        <Avatar.Fallback class="border-2 border-accent bg-accent">{data.minionuser.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
      </Avatar.Root>
      <Card.Title class="text-center text-xl font-medium">{data.minionuser.username}</Card.Title>
      {#if data.minionuser.settings?.profileSettings?.bio}
        <Card.Description class="text-center">{data.minionuser.settings?.profileSettings?.bio}</Card.Description>
      {/if}
    </Card.Header>
    {#if data.minionuser.settings?.profileSettings?.urls && data.minionuser.settings?.profileSettings?.urls.length !== 0}
      <Card.Content class="flex flex-wrap items-center justify-center gap-4">
        {#each data.minionuser.settings?.profileSettings?.urls as url}
          <Tooltip.Root group="links" openDelay={0} closeDelay={0} closeOnPointerDown={true} closeOnEscape={true}>
            <Tooltip.Trigger
              on:pointerdown={() => {
                urlToOpen.set(url);
                warningOpen.set(true);
                value.set(0);
                startTimer();
              }}
              class="group">
              <Avatar.Root class="size-10 select-none">
                <Avatar.Image class="pointer-events-none h-full w-full rounded-full bg-accent p-0.5 transition-all duration-300 group-hover:p-0" src={`/api/internal/favicon/${encodeURIComponent(url.toString())}`} alt="Favicon" />
                <Avatar.Fallback class="pointer-events-none h-full w-full rounded-full bg-accent p-0.5 transition-all duration-300 group-hover:p-0">
                  <Earth />
                </Avatar.Fallback>
              </Avatar.Root>
            </Tooltip.Trigger>
            <Tooltip.Content class="border-border bg-popover">
              <p>{url}</p>
            </Tooltip.Content>
          </Tooltip.Root>
        {/each}
      </Card.Content>
    {/if}
    <Card.Footer class="flex-col gap-6">
      <div class="flex w-full items-center justify-center gap-4">
        <Button href={`/user/${data.minionuser.username}/chat`} data-sveltekit-preload-data="off" variant="outline" class="w-full">
          <MessagesSquare class="mr-2 h-5 w-5" /> Chat
        </Button>
        <Button href={`https://sky.shiiyu.moe/stats/${data.minionuser.username}`} data-sveltekit-preload-data="off" target="_blank" rel="noopener" variant="outline" class="w-full">
          <BarChart2 class="mr-2 h-5 w-5" /> SkyCrypt
        </Button>
      </div>
      <p class="text-center text-xs text-muted-foreground">
        Last seen {formatDistanceToNow(data.minionuser.loggedInAt, {
          addSuffix: true,
          includeSeconds: true
        })}
      </p>
    </Card.Footer>
  </Card.Root>
  <div class="py-8 max-md:pb-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <ul role="list" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {#if data.minionuser.auctions.length !== 0}
          {#each data.minionuser.auctions as minion (minion.id)}
            <MinionCard {minion} />
          {/each}
        {:else}
          <div class="col-span-3 flex w-full items-center justify-center">
            <h3 class="font-semibold text-primary/40">{data.minionuser.username} has no minions</h3>
          </div>
        {/if}
      </ul>
    </div>
  </div>
</div>

<AlertDialog.Root
  closeOnEscape={true}
  closeOnOutsideClick={true}
  bind:open={$warningOpen}
  onOpenChange={(open) => {
    if (!open) {
      value.set(0);
    }
  }}>
  <AlertDialog.Content class="border-border bg-popover">
    <AlertDialog.Header>
      <AlertDialog.Title>Be safe!</AlertDialog.Title>
      <AlertDialog.Description>
        You are about to leave MinionAH and visit an external website that this user has linked.
        <br /><br />
        We can't check if the link is safe and we can't guarantee your safety.
        <br /><br />
        <span class="text-foreground">Please make sure that you trust the following link: <br /> <span class="font-semibold">{$urlToOpen}</span></span>
        <br /><br />
        Are you sure you want to continue?
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <div>
        <AlertDialog.Action on:click={() => window.open($urlToOpen, "_blank", "noopener")} disabled={$value < 100} class="group relative overflow-hidden">
          <span class="relative z-10 group-disabled:mix-blend-difference group-disabled:invert">Visit</span>
          <Progress value={$value} max={100} class="absolute h-full w-full rounded-none" />
        </AlertDialog.Action>
      </div>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
