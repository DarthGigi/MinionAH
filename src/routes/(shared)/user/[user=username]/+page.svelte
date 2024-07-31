<script lang="ts">
  import { page } from "$app/stores";
  import CopyButton from "$lib/components/CopyButton.svelte";
  import { MinionCard } from "$lib/components/card";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import * as Avatar from "$lib/components/ui/avatar";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Progress } from "$lib/components/ui/progress";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import {} from "$lib/utilities";
  import { formatDistanceToNow } from "date-fns";
  import ChartNoAxesColumn from "lucide-svelte/icons/chart-no-axes-column";
  import Earth from "lucide-svelte/icons/earth";
  import MessagesSquare from "lucide-svelte/icons/messages-square";
  import SvelteSeo from "svelte-seo";
  import { writable } from "svelte/store";
  import type { PageData } from "./$types";

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

<SvelteSeo
  title="{data.minionuser.username}'s MinionAH"
  description={`Check out ${data.minionuser.username}'s profile on MinionAH!`}
  themeColor={data.color.toString()}
  canonical={`https://minionah.com/user/${$page.params.user}`}
  openGraph={{
    type: "website",
    url: `https://minionah.com/user/${$page.params.user}`,
    title: `${data.minionuser.username}'s MinionAH`,
    description: `Check out ${data.minionuser.username}'s profile on MinionAH!`,
    images: [
      {
        url: `https://next.minionah.com/user/${$page.params.user}`,
        secure_url: `https://next.minionah.com/user/${$page.params.user}`,
        alt: `${data.minionuser.username}'s Profile — MinionAH`,
        width: 1200,
        height: 630,
        type: "image/png"
      }
    ],
    site_name: "MinionAH",
    locale: "en_US"
  }}
  twitter={{
    card: "summary_large_image",
    title: `${data.minionuser.username}'s MinionAH`,
    description: `Check out ${data.minionuser.username}'s profile on MinionAH!`,
    image: `https://next.minionah.com/user/${$page.params.user}`,
    imageAlt: `${data.minionuser.username}'s Profile — MinionAH`
  }}
  jsonLd={{
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: data.minionuser.username,
      // @ts-expect-error - This is a valid type
      agentInteractionStatistic: {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/WriteAction",
        userInteractionCount: data.minionuser.auctions.length
      },
      description: data.minionuser.settings?.profileSettings?.bio ?? undefined,
      identifier: data.minionuser.username,
      image: `https://res.cloudinary.com/minionah/image/upload/v1/users/avatars/${data.minionuser.id}`,
      sameAs: data.minionuser.settings?.profileSettings?.urls ?? undefined,
      url: `https://minionah.com/user/${$page.params.user}`
    }
  }} />

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
          <Tooltip.Root openDelay={100} closeDelay={0} group="links" closeOnPointerDown={true} closeOnEscape={true}>
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
          <ChartNoAxesColumn class="mr-2 h-5 w-5" /> SkyCrypt
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
