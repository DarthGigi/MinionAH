<script lang="ts">
  import CardLoading from "$lib/components/CardLoading.svelte";
  import HtmlToast from "$lib/components/HtmlToast.svelte";
  import MinionsListBox from "$lib/components/MinionsListBox.svelte";
  import SearchSelect, { SearchType } from "$lib/components/SearchSelect.svelte";
  import TierListbox from "$lib/components/TierListbox.svelte";
  import UsersListBox from "$lib/components/UsersListBox.svelte";
  import { MinionCard } from "$lib/components/card";
  import AnimatedShinyText from "$lib/components/magicui/animated-shiny-text.svelte";
  import NumberTicker from "$lib/components/magicui/number-ticker.svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Label } from "$lib/components/ui/label";
  import { internalPreferences, preferences } from "$lib/stores/preferences";
  import { searchSignal } from "$lib/stores/signals";
  import type { Seller } from "$lib/types";
  import { cn } from "$lib/utils";
  import ArrowRight from "lucide-svelte/icons/arrow-right";
  import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
  import LayoutGrid from "lucide-svelte/icons/layout-grid";
  import MessagesSquare from "lucide-svelte/icons/messages-square";
  import Users from "lucide-svelte/icons/users";
  import { onMount } from "svelte";
  import { infiniteScrollAction } from "svelte-legos";
  import SvelteSeo from "svelte-seo";
  import { toast } from "svelte-sonner";
  import { writable } from "svelte/store";
  import { draw } from "svelte/transition";
  import type { PageData } from "./$types";

  export let data: PageData;

  const minions = writable<Promise<Seller[]> | Seller[]>(data.minions);
  const loadingMore = writable(false);
  const currentTier = writable<number | undefined>(undefined);
  const newMinionAmount = writable<number>();
  const searchValue = writable<string>("");
  const maxTier = writable<number | undefined>();
  const searchType = writable<SearchType>(SearchType.Minion);

  searchSignal.subscribe((query) => {
    searchType.set(SearchType.Minion);
    if (query === $searchValue || query === "") return;
    searchValue.set("");
    searchValue.set(query);
    setTimeout(() => {
      search($currentTier);
      searchSignal.update(() => "");
    });
  });

  onMount(() => {
    if (!$internalPreferences.hasSeenDiscordToast) {
      setTimeout(() => {
        toast("Community", {
          description: "Would you like to join our Discord server?",
          action: {
            label: "Join",
            onClick: () => {
              window.open("https://discord.minionah.com/", "_blank");
            }
          },
          duration: Number.POSITIVE_INFINITY,
          onDismiss: () => {
            internalPreferences.update((state) => ({ ...state, hasSeenDiscordToast: true }));

            toast(HtmlToast, {
              duration: 5000,
              classes: {
                closeButton: "!hidden"
              },
              componentProps: {
                htmlMessage: "You can always join our Discord server by visiting <a href='https://discord.minionah.com/' target='_blank' class='underline'>discord.minionah.com</a>"
              }
            });
          }
        });
      });
    }
    if (!$internalPreferences.hasSeenWelcomeGuideToast) {
      setTimeout(() => {
        toast("Welcome to MinionAH!", {
          description: "It seems like you're new here. Would you like to read our guide on how to use MinionAH?",
          action: {
            label: "Read guide",
            onClick: () => {
              internalPreferences.update((state) => ({ ...state, hasSeenWelcomeGuideToast: true }));
              window.open("https://newsroom.minionah.com/minionah-guide", "_blank");
            }
          },
          onDismiss: () => {
            internalPreferences.update((state) => ({ ...state, hasSeenWelcomeGuideToast: true }));

            toast(HtmlToast, {
              duration: 5000,
              classes: {
                closeButton: "!hidden"
              },
              componentProps: {
                htmlMessage: "You can always read the guide by visiting <a href='https://newsroom.minionah.com/minionah-guide' target='_blank' class='underline'>newsroom.minionah.com/minionah-guide</a>"
              }
            });
          },
          duration: Number.POSITIVE_INFINITY
        });
      });
    }
    if (!$internalPreferences.hasSeenDeviceNotificationsToast) {
      if (!data.user) return;
      setTimeout(() => {
        toast("Device Notifications", {
          description: "Would you like to receive notifications when someone sends you a message?",
          action: {
            label: "Enable",
            onClick: () => {
              internalPreferences.update((state) => ({ ...state, hasSeenDeviceNotificationsToast: true }));
              window.open("/profile/settings/notifications", "_self");
            }
          },
          onDismiss: () => {
            internalPreferences.update((state) => ({ ...state, hasSeenDeviceNotificationsToast: true }));
            toast(HtmlToast, {
              duration: 5000,
              classes: {
                closeButton: "!hidden"
              },
              componentProps: {
                htmlMessage: "You can always enable notifications by visiting <a href='/profile/settings/notifications' target='_self' class='underline'>your settings</a>"
              }
            });
          },
          duration: Number.POSITIVE_INFINITY
        });
      });
    }

    if (!$internalPreferences.hasSeenEmailNotificationsToast) {
      if (!data.user) return;
      setTimeout(() => {
        toast("Email Notifications", {
          description: "Email notifications are here! Would you like to receive emails when someone sends you a message?",
          action: {
            label: "Enable",
            onClick: () => {
              internalPreferences.update((state) => ({ ...state, hasSeenEmailNotificationsToast: true }));
              window.open("/profile/settings/notifications", "_self");
            }
          },
          onDismiss: () => {
            internalPreferences.update((state) => ({ ...state, hasSeenEmailNotificationsToast: true }));
            toast(HtmlToast, {
              duration: 5000,
              classes: {
                closeButton: "!hidden"
              },
              componentProps: {
                htmlMessage: "You can always enable notifications by visiting <a href='/profile/settings/notifications' target='_self' class='underline'>your settings</a>"
              }
            });
          },
          duration: Number.POSITIVE_INFINITY
        });
      });
    }
  });

  const search = async (filterTier?: number | undefined, isMore: boolean = false, skip?: number) => {
    loadingMore.set(isMore);
    if (filterTier === 0) filterTier = undefined;

    let where;

    if (filterTier || $searchValue) {
      if ($searchType === SearchType.Minion) {
        where = {
          minion: {
            ...(filterTier && { generator_tier: filterTier }),
            ...($searchValue && {
              AND: [{ generator: $searchValue }, { generator_tier: filterTier }]
            })
          }
        };
      } else {
        where = {
          user: {
            ...($searchValue && { id: { contains: $searchValue, mode: "insensitive" } })
          }
        };
      }
    }

    const res = await fetch(
      "/api/internal/search/minions?" +
        new URLSearchParams({
          ...(where && { where: JSON.stringify(where) }),
          ...(skip && { skip: skip.toString() })
        }),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      }
    )
      .then((res) => {
        // reset the minions
        if (!isMore) minions.set([]);
        return res.json();
      })
      .finally(() => {
        loadingMore.set(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error(HtmlToast, {
          classes: {
            closeButton: "!hidden"
          },
          componentProps: {
            htmlMessage: "Something went wrong while trying to load minions. <br/> Please try again later."
          }
        });
      });

    newMinionAmount.set(res.length);

    minions.set([...Array.from(await $minions), ...res]);
  };
</script>

<SvelteSeo
  jsonLd={{
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MinionAH",
    alternateName: "Minion Auction House",
    description: "The best place to buy and sell Hypixel SkyBlock minions",
    url: "https://minionah.com",
    logo: "https://minionah.com/favicon.png",
    email: "contact@minionah.com",
    contactPoint: {
      "@type": "ContactPoint",
      email: "contact@minionah.com"
    }
  }} />

<h2 class="sr-only">MinionAH - The Auction House for SkyBlock Minions</h2>

<div class="mt-8 h-10 md:mt-20 md:h-20">
  <!-- <GradualSpacing class="text-center text-4xl font-bold tracking-[-0.1em] text-white md:text-7xl md:leading-[5rem]" text="MinionAH" /> -->
  <div class="flex justify-center space-x-1">
    <span class="text-center text-4xl font-bold tracking-[-0.045em] text-white md:text-7xl md:leading-[5rem]">MinionAH</span>
  </div>
</div>

<Button href="/pricecheck" class="group z-10 mx-auto mt-2 flex w-fit items-center justify-center rounded-full border border-white/5 bg-neutral-900 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-800" variant="ghost">
  <AnimatedShinyText class="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-400 hover:duration-300">
    <span>💰 <span class="max-sm:hidden">Introducing </span>Price Checker</span>
    <ArrowRight class="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
  </AnimatedShinyText>
</Button>

<div class="mx-auto mt-[1.375rem] flex gap-1 px-1 md:max-w-2xl md:gap-2 md:px-2">
  <Card.Root class="w-full border-border bg-transparent">
    <Card.Header class="flex flex-row items-center justify-center gap-2 space-y-0 pb-2">
      <Users class="h-4 w-4 text-muted-foreground" />
      <Card.Title class="text-sm font-medium">Users</Card.Title>
    </Card.Header>
    <Card.Content>
      {#await data.stats.users}
        <div class="mx-auto h-12 w-20 animate-pulse rounded-lg bg-background"></div>
      {:then users}
        <NumberTicker class="w-full text-center text-3xl font-bold md:text-5xl" value={users} />
      {/await}
    </Card.Content>
  </Card.Root>
  <Card.Root class="w-full border-border bg-transparent">
    <Card.Header class="flex flex-row items-center justify-center gap-2 space-y-0 pb-2">
      <LayoutGrid class="h-4 w-4 text-muted-foreground" />
      <Card.Title class="text-sm font-medium">Auctions</Card.Title>
    </Card.Header>
    <Card.Content>
      {#await data.stats.auctions}
        <div class="mx-auto h-12 w-20 animate-pulse rounded-lg bg-background"></div>
      {:then auctions}
        <NumberTicker class="w-full text-center text-3xl font-bold md:text-5xl" value={auctions} />
      {/await}
    </Card.Content>
  </Card.Root>
  <Card.Root class="w-full border-border bg-transparent">
    <Card.Header class="flex flex-row items-center justify-center gap-2 space-y-0 pb-2">
      <MessagesSquare class="h-4 w-4 text-muted-foreground" />
      <Card.Title class="text-sm font-medium">Chats</Card.Title>
    </Card.Header>
    <Card.Content>
      {#await data.stats.chats}
        <div class="mx-auto h-12 w-20 animate-pulse rounded-lg bg-background"></div>
      {:then chats}
        <NumberTicker class="w-full text-center text-3xl font-bold md:text-5xl" value={chats} />
      {/await}
    </Card.Content>
  </Card.Root>
</div>

<div class="mx-auto w-fit">
  <div class="flex flex-col items-start justify-center gap-4 px-4 pt-8 sm:flex-row sm:items-end sm:px-6 sm:pt-20 lg:px-8">
    <div class="flex flex-col justify-center space-y-2">
      <Label>Search</Label>

      <div class="flex items-center">
        {#if $searchType === SearchType.Minion}
          {#await data.minionTypes}
            <div class="flex items-center">
              <Button variant="outline" type="button" class={cn("relative w-40 cursor-default justify-between rounded-md rounded-r-none border border-r-0 border-input bg-background py-1.5 pl-3 text-left text-muted-foreground shadow-sm focus:z-10 focus:outline-none focus:ring-2 focus:ring-ring sm:text-sm sm:leading-6 md:w-44")}>
                <div class="flex">
                  <span>Select a minion</span>
                </div>
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </div>
          {:then minionTypes}
            {#key $searchValue}
              <MinionsListBox
                showReset={true}
                bind:search={$searchValue}
                variant="half-rounded"
                {minionTypes}
                on:onSelect={({ detail }) => {
                  maxTier.set(detail.maxTier);
                  searchValue.set(detail.generator);
                  search($currentTier);
                }}
                on:onReset={() => {
                  searchValue.set("");
                  maxTier.set(12);
                  search($currentTier);
                }} />
            {/key}
          {/await}
        {:else if $searchType === SearchType.User}
          {#await data.users}
            <div class="flex items-center">
              <Button variant="outline" type="button" class={cn("relative w-40 cursor-default justify-between rounded-md rounded-r-none border border-r-0 border-input bg-background py-1.5 pl-3 text-left text-muted-foreground shadow-sm focus:z-10 focus:outline-none focus:ring-2 focus:ring-ring sm:text-sm sm:leading-6 md:w-44")}>
                <div class="flex">
                  <span>Select a user</span>
                </div>
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </div>
          {:then users}
            {#key $searchValue}
              <UsersListBox
                variant="half-rounded"
                showReset={true}
                bind:search={$searchValue}
                {users}
                on:onSelect={({ detail }) => {
                  searchValue.set(detail.id);
                  search($currentTier);
                }} />
            {/key}
          {/await}
        {/if}

        {#if $searchValue === ""}
          <SearchSelect
            bind:searchType={$searchType}
            on:onSelect={({ detail }) => {
              searchValue.set("");
              searchType.set(detail);
              if (detail === SearchType.User) {
                maxTier.set(12);
              }
            }} />
        {/if}
      </div>
    </div>

    <div class="flex flex-col justify-center space-y-2">
      <Label class="sr-only">Tier</Label>
      <TierListbox
        tiggerClasses="w-52"
        maxtier={$maxTier}
        disabled={false}
        on:onSelectedTierChange={({ detail }) => {
          if (detail.tier === null) {
            currentTier.set(undefined);
            search($currentTier);
            return;
          }
          currentTier.set(Number(detail.tier));
          search($currentTier);
        }} />
    </div>
  </div>
</div>

<div class="py-8 max-md:pb-20">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <ul role="list" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#await $minions}
        {#each Array(18) as _}
          <CardLoading />
        {/each}
      {:then minions}
        {#each minions as seller}
          <MinionCard minion={seller} />
        {/each}
        {#if $loadingMore}
          {#each Array(18) as _}
            <CardLoading />
          {/each}
        {/if}
      {/await}
    </ul>
    {#await $minions then minions}
      <div class="flex w-full justify-center py-4">
        {#if $newMinionAmount === 0 || $newMinionAmount < 18 || (minions.length === 0 && !$loadingMore)}
          <p class="px-4 py-1 text-center text-sm text-primary text-opacity-40">No more minions to load.</p>
        {:else}
          <div
            use:infiniteScrollAction={{
              delay: 500, // number, default 200
              distance: 500, // number, default 0
              immediate: true, // boolean, default: true
              disabled: !$preferences.infiniteScroll, // boolean, default: false
              cb: async () => {
                await search($currentTier, true, minions.length);
              }
            }}>
            <Button type="button" variant="ghost" on:click={async () => await search($currentTier, true, minions.length)} class="text-sm text-accent transition-all duration-300 hover:text-white focus-visible:border-0 focus-visible:outline-none focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-offset-0" aria-label="Load more minions">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down h-6 w-6" class:animate-spin={$loadingMore}>
                {#if $loadingMore}
                  <path in:draw={{ duration: 500, delay: 500 }} out:draw={{ duration: 500 }} d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path in:draw={{ duration: 500, delay: 500 }} out:draw={{ duration: 500 }} d="M21 3v5h-5" />
                  <path in:draw={{ duration: 500, delay: 500 }} out:draw={{ duration: 500 }} d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path in:draw={{ duration: 500, delay: 500 }} out:draw={{ duration: 500 }} d="M8 16H3v5" />
                {:else}
                  <path in:draw={{ duration: 500, delay: 500 }} out:draw={{ duration: 500 }} d="m6 9 6 6 6-6" />
                {/if}
              </svg>
            </Button>
          </div>
        {/if}
      </div>
    {/await}
  </div>
</div>
