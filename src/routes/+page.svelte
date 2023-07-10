<script lang="ts">
  import type { PageData } from "./$types";
  import Card from "$lib/components/Card.svelte";
  import type { Minion } from "$lib/types";
  import CardLoading from "$lib/components/CardLoading.svelte";
  import Listbox from "$lib/components/Listbox.svelte";
  import { onMount } from "svelte";

  export let data: PageData;
  let minions: Minion[] = [];
  let loadingMore = false;
  let currentTier: string | undefined = undefined;
  let isFirstFilter = true;

  async function initializeMinions() {
    minions = await data.props.minions;
  }

  onMount(initializeMinions);

  async function loadData(filterTier?: string, skip?: number, search?: string) {
    loadingMore = true;

    let apiURL = "/api/loadMinions";

    if (skip) {
      apiURL += `?skip=${skip}`;
    }

    if (filterTier) {
      apiURL += `${skip || search ? "&" : "?"}where={"generator_tier":${filterTier}}`;
    }

    if (search) {
      console.log("search: ", search);
      console.log("empty? ", search === "");
      console.log("typeof: ", typeof search);

      apiURL += `${skip || filterTier ? "&" : "?"}where={"name":{"contains":"${search}","mode":"insensitive"}}`;
    }

    const res = await fetch(apiURL, {
      method: "GET"
    }).then((res) => res.json());

    if (filterTier) {
      if (isFirstFilter) {
        minions = res;
        isFirstFilter = false;
      } else {
        minions = minions.concat(res);
      }
    } else {
      if (search !== "") {
        minions = res;
      } else if (search === "") {
        minions = data.props.minions;
      } else {
        if (minions.length === 0) {
          minions = [...minions, ...res];
        } else {
          minions = minions.concat(res);
        }
      }
    }

    loadingMore = false;
  }
</script>

<div class="mx-auto flex flex-row items-center justify-center gap-4 px-4 py-20 sm:px-6 lg:px-8">
  <div class="h-[4.25rem] w-48">
    <span class="text-white">Search</span>
    <input type="text" on:input={(e) => loadData(currentTier, undefined, e.target.value)} class="h-9 w-full rounded border-2 border-neutral-700 bg-black px-4 text-sm text-white placeholder-white placeholder-opacity-30" placeholder="Search..." maxlength="32" />
  </div>
  <Listbox
    on:filterTier={({ detail }) => {
      currentTier = detail.tier;
      loadData(currentTier);
    }}
  />
</div>

<div class="py-8">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <ul role="list" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#await minions}
        {#each Array(9) as _}
          <CardLoading />
        {/each}
      {:then minions}
        {#each minions as minion}
          <Card {minion} />
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
      {#if minions.length === 0}
        <p class="text-center text-neutral-200">No more minions to load.</p>
      {:else}
        <button type="button" on:click={() => loadData(currentTier, minions.length)} class="rounded px-4 py-1 text-sm text-white transition-colors duration-300 hover:bg-white hover:text-black">Load more...</button>
      {/if}
    </div>
  </div>
</div>
