<script lang="ts">
  import type { PageData } from "./$types";
  import Card from "$lib/components/Card.svelte";
  import type { Seller } from "$lib/types";
  import CardLoading from "$lib/components/CardLoading.svelte";
  import TierListbox from "$lib/components/TierListbox.svelte";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Select from "$lib/components/ui/select";
  import { draw } from "svelte/transition";
  import * as Alert from "$lib/components/ui/alert";
  import { slide } from "svelte/transition";
  import * as Form from "$lib/components/ui/form";
  import { formSchema, type FormSchema } from "./schema";

  export let data: PageData;

  let minions: Seller[] = [];
  let loadingMore = true;
  let currentTier: number | undefined = undefined;
  let newMinionAmount: number;
  let initialDispatch = true;
  let initialLoad = true;
  let alert = {
    title: "",
    description: "",
    open: false
  };

  let search: string | undefined = undefined;

  (async function () {
    minions = await data.streamed.minions;
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

    const res = await fetch(
      "/api/loadMinions?" +
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
      .then((res) => res.json())
      .finally(() => {
        loadingMore = false;
      })
      .catch((err) => {
        console.error(err);
        alert.open = true;
        alert.title = "Error";
        alert.description = "An error occurred while loading minions.";
        setTimeout(() => {
          alert.open = false;
        }, 5000);
      });

    newMinionAmount = res.length;
    minions = isMore ? [...minions, ...res] : res;
  }
</script>

{#if alert.open}
  <div transition:slide={{ axis: "x" }} class="fixed right-4 top-4 w-80">
    <Alert.Root class="border-neutral-700 bg-neutral-800">
      <Alert.Title class="min-w-full truncate">{alert.title}</Alert.Title>
      <Alert.Description class="min-w-full truncate">{alert.description}</Alert.Description>
    </Alert.Root>
  </div>
{/if}

{#await data.streamed.form}
  <div class="mx-auto flex flex-row items-center justify-center gap-4 px-4 py-20 sm:px-6 lg:px-8">
    <div class="flex flex-col justify-center space-y-2">
      <span class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Search</span>
      <Input type="text" placeholder="Minion or user" disabled class="w-44 animate-pulse border-2 border-none bg-neutral-700 text-white placeholder-white placeholder-opacity-30 focus-visible:border-neutral-600 focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-0 disabled:opacity-100" />
    </div>
    <div class="flex flex-col justify-center space-y-2">
      <span class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Tier</span>
      <Select.Root disabled>
        <Select.Trigger class="w-40 animate-pulse border-none bg-neutral-700 focus:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-0 disabled:opacity-100 md:w-44">
          <Select.Value placeholder="Select tier" />
        </Select.Trigger>
      </Select.Root>
    </div>
  </div>
{:then form}
  <Form.Root method="POST" {form} schema={formSchema} let:config class="mx-auto flex flex-row items-center justify-center gap-4 px-4 py-20 sm:px-6 lg:px-8">
    <Form.Field {config} name="search">
      <Form.Item class="flex flex-col justify-center">
        <Form.Label>Search</Form.Label>
        <Form.Input
          type="text"
          class="w-44 border-2 border-none bg-neutral-700 text-white placeholder-white placeholder-opacity-30 focus-visible:border-neutral-600 focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-0"
          placeholder="Minion or user"
          maxlength={32}
          on:input={({ currentTarget }) => {
            if (!(currentTarget instanceof HTMLInputElement)) return;
            if (currentTarget.value.length <= 3 && currentTarget.value.length !== 0) return;
            search = currentTarget.value;
            loadData(currentTier, undefined, search);
          }}
        />
      </Form.Item>
    </Form.Field>
    <TierListbox
      {config}
      showValidation={false}
      on:filterTier={({ detail }) => {
        if (initialDispatch) {
          initialDispatch = false;
          return;
        }
        if (detail.tier === null) {
          currentTier = undefined;
          loadData(currentTier);
          return;
        }
        currentTier = detail.tier;
        loadData(currentTier);
      }}
    />
  </Form.Root>
{/await}

<div class="py-8 max-md:pb-20">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <ul role="list" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#await minions}
        {#each Array(18) as _}
          <CardLoading />
        {/each}
      {:then minions}
        {#each minions as seller}
          <Card minion={seller} />
        {/each}

        {#if loadingMore && initialLoad}
          {#each Array(18) as _}
            <CardLoading />
          {/each}
        {/if}
      {/await}
    </ul>
    <div class="flex w-full justify-center py-4">
      <!-- check if there are no longer any items in the database -->
      {#if newMinionAmount === 0 || newMinionAmount < 18 || (minions.length === 0 && !loadingMore)}
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
