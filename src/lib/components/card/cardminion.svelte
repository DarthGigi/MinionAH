<script lang="ts">
  import { page } from "$app/stores";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import type { Seller } from "$lib/types";
  import { createEventDispatcher, setContext } from "svelte";
  import { fade } from "svelte/transition";
  import MinionCopyButton from "../CopyButton.svelte";
  import CardItemMinion from "./card-item-minion.svelte";
  import CardItemUser from "./card-item-user.svelte";
  import CardMinionAmount from "./card-minion-amount.svelte";
  import CardMinionPrice from "./card-minion-price.svelte";
  import CardMinionTier from "./card-minion-tier.svelte";

  export let minion: Seller;
  setContext("minion", minion);

  const isHome = $page.url.pathname === "/";
  setContext("isHome", isHome);
  const isMinionPage = $page.url.pathname === `/` || $page.url.pathname === `/profile` || $page.url.pathname === `/${minion.user.username}`;
  setContext("isMinionPage", isMinionPage);
  let hovering = false;
  export let showButtons = true;

  const dispatch = createEventDispatcher();

  function openModal(minionID: string) {
    dispatch("openDeleteModal", {
      minion: minionID
    });
  }
</script>

<li in:fade|global={{ delay: 0 }} {...$$restProps}>
  <div class="user-select-none relative list-item divide-y divide-neutral-700 rounded-lg bg-neutral-800 transition-all duration-300" class:group={isHome} class:hover:bg-neutral-900={isHome} on:mouseover={() => (hovering = true)} on:mouseout={() => (hovering = false)} on:blur={() => (hovering = false)} on:focus={() => (hovering = true)} role="listitem">
    <div class="flex h-full w-full items-center justify-center gap-x-6 px-4">
      <CardItemMinion />
      {#if isHome}
        <CardItemUser />
      {/if}
    </div>

    <div class="-mt-px flex divide-x divide-neutral-700">
      <CardMinionTier />
      <CardMinionPrice bind:hovering />
      <CardMinionAmount />
    </div>
    {#if minion.hasInfusion}
      <Tooltip.Root>
        <Tooltip.Trigger class="absolute right-2 top-2 m-0 flex h-10 w-10 items-center justify-center rounded-lg !border-2 !border-black/30 bg-neutral-700 p-2 transition-all duration-300 group-hover:!border-black/0 group-hover:bg-neutral-900">
          <img class="pointer-events-none h-auto w-full" src="https://mc-heads.net/head/7e051df4dd2151481f5145b93fb7a9aa62888fbcb90add9890ad07caf1faca73" alt="Mithril Infusion" />
        </Tooltip.Trigger>
        <Tooltip.Content class="border-neutral-700 bg-neutral-900 text-neutral-200">
          <p>Mithril Infused</p>
        </Tooltip.Content>
      </Tooltip.Root>
    {/if}
    {#if showButtons}
      {#if $page.url.pathname === "/profile"}
        <button class="group absolute left-12 top-2 rounded-lg !border-0 bg-neutral-700 p-1.5 text-sm text-neutral-400 transition-all duration-300 hover:bg-red-600 hover:text-white/70 focus:outline-none focus:ring-4 focus:ring-transparent group-hover:opacity-100" type="button" on:click={() => openModal(minion.id)}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      {/if}

      {#if isMinionPage}
        <MinionCopyButton
          class="absolute left-2 top-2"
          {isHome}
          on:click={() => {
            // copy url to clipboard
            navigator.clipboard.writeText(`${window.location.protocol}/${window.location.host}/${minion.user.username}/${minion.id}/`);
          }} />

        <a href={`${minion.user.username}/${minion.id}`} class="group absolute left-2 top-12 rounded-lg !border-0 bg-neutral-700 bg-opacity-0 p-1.5 text-sm text-neutral-400 transition-all duration-300 hover:bg-opacity-100 focus:outline-none focus:ring-4 focus:ring-transparent group-hover:opacity-100" class:opacity-0={isHome} class:!bg-opacity-100={!isHome}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5 transition-colors duration-300 group-hover:text-white">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </a>
      {/if}
    {/if}
  </div>
</li>
