<script lang="ts">
  import type { PageData } from "./$types";
  import Card from "$lib/components/Card.svelte";
  import type { Seller } from "$lib/types";
  import CardLoading from "$lib/components/CardLoading.svelte";
  import TierListbox from "$lib/components/TierListbox.svelte";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { draw } from "svelte/transition";

  export let data: PageData;
  let minions: Seller[] = [];
  let loadingMore = true;
  let currentTier: number | undefined = undefined;
  let newMinionAmount: number;
  let initialDispatch = true;
  let initialLoad = true;

  let search: string | undefined = undefined;

  (async function () {
    minions = await data.props.minions;
    loadingMore = false;
    initialLoad = false;
  })();

  async function loadData(filterTier?: number | undefined, skip?: number, search?: string, isMore: boolean = false) {
    loadingMore = isMore;

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

    const res = await fetch("/api/loadMinions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        skip: skip,
        where: where
      })
    })
      .then((res) => res.json())
      .finally(() => {
        loadingMore = false;
      });

    newMinionAmount = res.length;
    minions = isMore ? [...minions, ...res] : res;
  }
</script>

<div class="mx-auto flex flex-row items-center justify-center gap-4 px-4 py-20 sm:px-6 lg:px-8">
  <div>
    <Label for="search" class="text-base font-normal">Search</Label>
    <Input
      type="text"
      class="w-44 border-2 border-none bg-neutral-700 text-white placeholder-white placeholder-opacity-30 focus-visible:border-neutral-600 focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-0"
      placeholder="Search..."
      maxlength={32}
      on:input={({ currentTarget }) => {
        if (!(currentTarget instanceof HTMLInputElement)) return;
        search = currentTarget.value;
        loadData(currentTier, undefined, search);
      }}
    />
  </div>
  <div>
    <TierListbox
      on:filterTier={({ detail }) => {
        if (initialDispatch) {
          initialDispatch = false;
          return;
        }
        if (detail.tier === null) {
          console.log("null");
          currentTier = undefined;
          loadData(currentTier);
          return;
        }
        currentTier = detail.tier;
        loadData(currentTier);
      }}
    />
  </div>
</div>

<div class="py-8">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <ul role="list" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#await minions}
        {#each Array(9) as _}
          <CardLoading />
        {/each}
      {:then minions}
        {#each minions as seller}
          <Card minion={seller} />
        {/each}

        {#if loadingMore && initialLoad}
          {#each Array(9) as _}
            <CardLoading />
          {/each}
        {/if}
      {/await}
    </ul>
    <div class="flex w-full justify-center py-4">
      <!-- check if there are no longer any items in the database -->
      {#if newMinionAmount === 0 || newMinionAmount < 9 || (minions.length === 0 && !loadingMore)}
        <p class="px-4 py-1 text-center text-sm text-neutral-200 text-opacity-40">No more minions to load.</p>
      {:else}
        <button type="button" on:click={() => loadData(currentTier, minions.length, search, true)} class="rounded p-1 text-sm text-white text-opacity-30 transition-all duration-300 hover:bg-neutral-700 hover:text-opacity-100">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6" class:animate-spin={loadingMore}>
            {#if loadingMore}
              <path in:draw={{ duration: 500, delay: 500 }} out:draw={{ duration: 500 }} stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            {:else}
              <path in:draw={{ duration: 500, delay: 500 }} out:draw={{ duration: 500 }} stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            {/if}
          </svg>
        </button>
      {/if}
    </div>
  </div>
</div>
