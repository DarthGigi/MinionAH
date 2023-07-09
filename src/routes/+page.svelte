<script lang="ts">
  import type { PageData, ActionData } from "./$types";
  import { enhance } from "$app/forms";
  import Card from "$lib/components/Card.svelte";
  import type { Minion } from "$lib/types";
  import CardLoading from "$lib/components/CardLoading.svelte";
  import Listbox from "$lib/components/Listbox.svelte";

  export let data: PageData;
  let minions: Minion[] = [];
  let loadingMore = false;

  async function loadMore() {
    loadingMore = true;
    const res = await fetch("/api/loadMinions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        skip: (await data.props.minions).length + minions.length
      })
    }).then((res) => res.json());

    minions = minions.concat(res);
    loadingMore = false;
  }
</script>

<div class="py-8">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <!-- <Listbox /> -->

    <ul role="list" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#await data.props.minions}
        {#each Array(9) as _}
          <CardLoading />
        {/each}
      {:then minions}
        {#each minions as minion}
          <Card {minion} />
        {/each}
      {/await}

      {#each minions as minion}
        <Card {minion} />
      {/each}

      {#if loadingMore}
        {#each Array(9) as _}
          <CardLoading />
        {/each}
      {/if}
    </ul>
    <div class="flex w-full justify-center py-4">
      <button type="button" on:click={loadMore} class="rounded px-4 py-1 text-sm text-white transition-colors duration-300 hover:bg-white hover:text-black">Load more...</button>
    </div>
  </div>
</div>
