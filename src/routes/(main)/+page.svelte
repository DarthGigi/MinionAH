<script lang="ts">
  import CardLoading from "$lib/components/CardLoading.svelte";
  import HtmlToast from "$lib/components/HtmlToast.svelte";
  import TierListbox from "$lib/components/TierListbox.svelte";
  import { MinionCard } from "$lib/components/card";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { internalPreferences } from "$lib/stores/preferences";
  import { searchSignal } from "$lib/stores/signals";
  import type { Seller } from "$lib/types";
  import { onDestroy, onMount } from "svelte";
  import { createPress } from "svelte-interactions";
  import { toast } from "svelte-sonner";
  import { draw } from "svelte/transition";
  import type { PageData } from "./$types";
  import { writable } from "svelte/store";

  export let data: PageData;

  const { pressAction } = createPress();

  const minions = writable<Promise<Seller[]> | Seller[]>(data.minions);
  const loadingMore = writable(false);
  const currentTier = writable<number | undefined>(undefined);
  const newMinionAmount = writable<number>();
  const lastSearch = writable("");
  const search = writable<string | undefined>(undefined);
  const searchValue = writable("");

  searchSignal.subscribe((search) => {
    if (search === $searchValue || $search === $lastSearch || search === "") return;
    searchValue.set(search);
    searchMinions($currentTier, search);
    searchSignal.set("");
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
    // if (!$internalPreferences.hasSeenDeviceNotificationsToast) {
    //   /**
    //    * TODO: Re-enable this when we have a proper notification system
    //    */
    //   return;
    //   if (!data.user) return;
    //   setTimeout(() => {
    //     toast("Notifications", {
    //       description: "Would you like to receive notifications when someone sends you a message?",
    //       action: {
    //         label: "Enable",
    //         onClick: () => {
    //           internalPreferences.update((state) => ({ ...state, hasSeenDeviceNotificationsToast: true }));
    //           window.open("/profile/settings/notifications", "_self");
    //         }
    //       },
    //       onDismiss: () => {
    //         internalPreferences.update((state) => ({ ...state, hasSeenDeviceNotificationsToast: true }));
    //         toast(HtmlToast, {
    //           duration: 5000,
    //           classes: {
    //             closeButton: "!hidden"
    //           },
    //           componentProps: {
    //             htmlMessage: "You can always enable notifications by visiting <a href='/profile/settings/notifications' target='_self' class='underline'>your settings</a>"
    //           }
    //         });
    //       },
    //       duration: Number.POSITIVE_INFINITY
    //     });
    //   });
    // }

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

  const searchMinions = async (filterTier?: number | undefined, search?: string, isMore: boolean = false, skip?: number) => {
    loadingMore.set(isMore);
    if (filterTier === 0) filterTier = undefined;

    let where = {};

    if (filterTier || search) {
      where = {
        OR: [
          {
            minion: {
              ...(filterTier && { generator_tier: filterTier }),
              ...(search && {
                AND: [{ name: { contains: search, mode: "insensitive" } }, { generator_tier: filterTier }]
              })
            }
          },
          {
            user: {
              ...(search && { username: { contains: search, mode: "insensitive" } })
            }
          }
        ]
      };
    }

    const res = await fetch(
      "/api/internal/search/minions?" +
        new URLSearchParams({
          where: JSON.stringify(where),
          skip: skip?.toString() ?? "0"
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

<h2 class="sr-only">MinionAH - The Auction House for SkyBlock Minions</h2>

<div class="mx-auto flex flex-row items-center justify-center gap-4 px-4 py-20 sm:px-6 lg:px-8">
  <div class="flex flex-col justify-center space-y-2">
    <Label>Search</Label>
    <Input
      type="text"
      class="w-44 border border-input bg-background text-white placeholder-white placeholder-opacity-30 focus-visible:border-input focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
      placeholder="Minion or user"
      maxlength={32}
      value={$searchValue}
      on:input={({ currentTarget }) => {
        if (!(currentTarget instanceof HTMLInputElement)) return;
        if (currentTarget.value === $lastSearch) return;
        // every third character
        if (currentTarget.value.length % 4 !== 0 && currentTarget.value.length !== 0) return;
        lastSearch.set(currentTarget.value);
        search.set(currentTarget.value);
        searchMinions($currentTier, $search);
      }}
      on:keypress={({ key, currentTarget }) => {
        if (key !== "Enter") return;
        if (!(currentTarget instanceof HTMLInputElement)) return;
        if (currentTarget.value === $lastSearch) return;
        lastSearch.set(currentTarget.value);
        search.set(currentTarget.value);
        searchMinions($currentTier, $search);
      }} />
  </div>

  <div class="flex flex-col justify-center space-y-2">
    <Label>Tier</Label>
    <TierListbox
      maxtier={12}
      disabled={false}
      on:onSelectedTierChange={({ detail }) => {
        if (detail.tier === null) {
          currentTier.set(undefined);
          searchMinions($currentTier);
          return;
        }
        currentTier.set(Number(detail.tier));
        searchMinions($currentTier);
      }} />
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
          <button type="button" use:pressAction on:press={() => searchMinions($currentTier, $search, true, minions.length)} class="rounded p-1 text-sm text-accent transition-all duration-300 hover:bg-accent hover:text-white" aria-label="Load more minions">
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
          </button>
        {/if}
      </div>
    {/await}
  </div>
</div>
