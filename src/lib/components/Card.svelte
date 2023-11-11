<script lang="ts">
  import { page } from "$app/stores";
  import type { Seller } from "$lib/types";
  import { createEventDispatcher } from "svelte";
  import MinionCopyButton from "./MinionCopyButton.svelte";
  import { fade } from "svelte/transition";

  export let minion: Seller;

  const isHome = $page.url.pathname === "/";
  const isMinionPage = $page.url.pathname === `/` || $page.url.pathname === `/profile` || $page.url.pathname === `/${minion.user.username}`;

  function formatNumber(num: number) {
    if (num != null) {
      let suffix = "";
      if (num >= 1000000) {
        num = num / 1000000;
        suffix = "m";
      } else if (num >= 1000) {
        num = num / 1000;
        suffix = "k";
      }
      if (suffix) {
        if (num % 1 === 0) {
          return num.toFixed(0) + suffix;
        } else {
          return num.toFixed(num < 10 ? 1 : 2) + suffix;
        }
      } else {
        return num.toString();
      }
    } else {
      return "N/A";
    }
  }

  const dispatch = createEventDispatcher();

  function openModal(minionID: string) {
    dispatch("openDeleteModal", {
      minion: minionID
    });
  }
</script>

<li transition:fade|global>
  <div class="relative list-item divide-y divide-neutral-700 rounded-lg bg-neutral-800 transition-all duration-300" class:group={isHome} class:hover:scale-[1.02]={isHome} class:hover:bg-neutral-900={isHome}>
    <div class="flex h-full w-full items-center justify-center space-x-6 px-4">
      <a href={`https://hypixel-skyblock.fandom.com/wiki/${minion.minion.name.replace(/ [IVX]+$/, "").replace(/ /g, "_")}`} target="_blank" class="z-20 my-2 flex flex-col items-center truncate rounded p-1 transition-all duration-500" class:hover:scale-150={isHome} class:hover:bg-neutral-800={isHome}>
        <div class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-neutral-700 p-1">
          <img class="pointer-events-none h-full w-full" src={`https://mc-heads.net/head/${minion.minion.texture}`} alt={`${minion.minion.name} head image`} />
        </div>
        <h3 class="truncate text-sm font-medium text-white">{minion.minion.name.replace(/ [IVX]+$/, "")}</h3>
      </a>
      {#if isHome}
        <a href={`/${minion.user.username}`} class="z-20 my-2 flex flex-col items-center truncate rounded p-1 transition-all duration-500 hover:scale-150 hover:bg-neutral-800">
          <img
            class="pointer-events-none h-12 w-12 flex-shrink-0 rounded-full bg-neutral-700 object-cover"
            src={`https://cdn.discordapp.com/avatars/${minion.user.id}/${minion.user.avatar}.png?size=64`}
            alt={`${minion.user.username}'s discord avatar`}
            on:error={({ currentTarget }) => {
              if (!(currentTarget instanceof HTMLImageElement)) return;
              currentTarget.src = `https://cdn.discordapp.com/embed/avatars/${Number(minion.user.id) % 6}.png?size=64`;
            }}
          />
          <h3 class="text-sm font-medium text-white">{minion.user.username}</h3>
        </a>
      {/if}
    </div>

    <div class="-mt-px flex divide-x divide-neutral-700">
      <div class="relative inline-flex w-0 flex-1 items-center justify-center overflow-hidden rounded-bl-lg text-sm font-medium text-neutral-200">
        <span class="z-10 inline-block flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-neutral-800 transition-transform duration-300 group-hover:scale-125 group-hover:text-neutral-900">{` Tier ${["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][minion.minion.generator_tier - 1]} (${minion.minion.generator_tier})`}</span>
        <div class="absolute z-0 h-5 w-20 flex-shrink-0 rounded-[50px] bg-neutral-400 transition-all duration-500 group-hover:h-full group-hover:w-full group-hover:rounded-none" />
      </div>
      <div class="relative -ml-px inline-flex w-0 flex-1 overflow-hidden">
        <span class="relative z-10 inline-flex w-0 flex-1 items-center justify-center overflow-hidden py-4 text-sm font-medium text-neutral-200 transition-all duration-300 group-hover:scale-125 group-hover:text-neutral-900">
          <img class="pointer-events-none mr-1 h-6 w-6" src="/assets/images/coin.png" alt="Coin icon" />
          {formatNumber(minion.price)}
          <span class="ml-1 text-sm text-neutral-200/50 transition-all duration-300 group-hover:ml-0 group-hover:text-neutral-900/0">/</span>
          <span class="text-sm text-neutral-200/50 transition-all duration-300 group-hover:-ml-0.5 group-hover:text-neutral-900">each</span>
        </span>
        <div class="absolute z-0 h-0 w-full flex-shrink-0 bg-neutral-400 transition-all duration-500 group-hover:h-full" />
      </div>
      <div class="relative inline-flex w-0 flex-1 items-center justify-center overflow-hidden rounded-br-lg text-sm font-medium text-neutral-200">
        <span class="z-10 inline-block flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-neutral-800 transition-transform duration-300 group-hover:scale-125 group-hover:text-neutral-900">{` Amount: ${minion.amount}`}</span>
        <div class="absolute z-0 h-5 w-20 flex-shrink-0 rounded-[50px] bg-neutral-400 transition-all duration-500 group-hover:h-full group-hover:w-full group-hover:rounded-none" />
      </div>
    </div>
    {#if minion.hasInfusion}
      <div class="absolute right-2 top-2 m-0 flex h-10 w-10 items-center justify-center rounded-lg !border-2 !border-black/30 bg-neutral-700 p-2 transition-all duration-300 group-hover:!border-black/0 group-hover:bg-neutral-900">
        <img class="h-[20px] w-[18.85px]" src="https://mc-heads.net/head/7e051df4dd2151481f5145b93fb7a9aa62888fbcb90add9890ad07caf1faca73" alt="Mithril Infusion" />
      </div>
    {/if}
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
          navigator.clipboard.writeText(`${window.location.protocol}//${window.location.host}/${minion.user.username}/${minion.id}/`);
        }}
      />

      <a href={`${minion.user.username}/${minion.id}`} class="group absolute right-2 top-2 rounded-lg !border-0 bg-neutral-700 bg-opacity-0 p-1.5 text-sm text-neutral-400 transition-all duration-300 hover:bg-opacity-100 focus:outline-none focus:ring-4 focus:ring-transparent group-hover:opacity-100" class:opacity-0={isHome} class:!bg-opacity-100={!isHome}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5 transition-colors duration-300 group-hover:text-white">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </a>
    {/if}
  </div>
</li>
