<script lang="ts">
  import type { PageData } from "../(shared)/$types";
  import Card from "$lib/components/Card.svelte";
  import type { Seller } from "$lib/types";
  import CardLoading from "$lib/components/CardLoading.svelte";
  import TierListbox from "$lib/components/TierListbox.svelte";

  export let data: PageData;
  let minions: Seller[] = [];
  let loadingMore = true;
  let currentTier: number | undefined = undefined;
  let newMinionAmount: number;

  let search: string | undefined = undefined;

  (async function () {
    minions = await data.props.minions;
    loadingMore = false;
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
  <div class="h-[4.25rem] w-48">
    <span class="text-white">Search</span>
    <input
      type="text"
      on:input={(e) => {
        if (e.target instanceof HTMLInputElement) {
          search = e.target.value;
          loadData(currentTier, undefined, search);
        }
      }}
      class="h-9 w-full rounded border-2 border-neutral-700 bg-black px-4 text-sm text-white placeholder-white placeholder-opacity-30"
      placeholder="Search..."
      maxlength="32"
    />
  </div>
  <TierListbox
    on:filterTier={({ detail }) => {
      if (detail.tier === null) {
        currentTier = undefined;
        loadData(currentTier);
        return;
      }
      currentTier = detail.tier;
      loadData(currentTier);
    }}
  />
</div>

<div class="py-8">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <ul role="list" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#await minions then minions}
        {#each minions as seller}
          <Card minion={seller} />
        {/each}

        {#if loadingMore}
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
      {:else if loadingMore}
        <p class="px-4 py-1 text-center text-sm text-neutral-200 text-opacity-60">Loading...</p>
      {:else}
        <button type="button" on:click={() => loadData(currentTier, minions.length, search, true)} class="rounded px-4 py-1 text-sm text-white transition-colors duration-300 hover:bg-white hover:text-black">Load more...</button>
      {/if}
    </div>
  </div>
</div>
