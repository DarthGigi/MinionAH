<script lang="ts">
  import { page } from "$app/stores";
  import type { Seller } from "$lib/types";
  import { createEventDispatcher } from "svelte";

  export let seller: Seller;

  const isHome = $page.url.pathname === "/";
  const isMinionPage = $page.url.pathname === `/` || $page.url.pathname === `/profile` || $page.url.pathname === `/${seller.user.username}`;

  let copied = false;

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

<li>
  <div class="relative list-item divide-y divide-neutral-700 rounded-lg bg-neutral-800 transition-all duration-300" class:group={isHome} class:hover:scale-[1.02]={isHome} class:hover:bg-neutral-900={isHome}>
    <div class="flex h-full w-full items-center justify-center space-x-6 px-4">
      <a href={`https://hypixel-skyblock.fandom.com/wiki/${seller.minion.name.replace(/ [IVX]+$/, "").replace(/ /g, "_")}`} target="_blank" class="z-20 my-2 flex flex-col items-center truncate rounded p-1 transition-all duration-500" class:hover:scale-150={isHome} class:hover:bg-neutral-800={isHome}>
        <div class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-neutral-700 p-1">
          <img class="pointer-events-none h-full w-full" src={`https://mc-heads.net/head/${seller.minion.texture}`} alt={`${seller.minion.name} head image`} />
        </div>
        <h3 class="truncate text-sm font-medium text-white">{seller.minion.name.replace(/ [IVX]+$/, "")}</h3>
      </a>
      {#if isHome}
        <a href={`https://discord.com/users/${seller.user.id}`} target="_blank" class="z-20 my-2 flex flex-col items-center truncate rounded p-1 transition-all duration-500 hover:scale-150 hover:bg-neutral-800">
          <img class="pointer-events-none h-12 w-12 flex-shrink-0 rounded-full bg-neutral-700 object-cover" src={`https://cdn.discordapp.com/avatars/${seller.user.id}/${seller.user.avatar}.png?size=64`} alt={`${seller.user.username}'s discord avatar`} />
          <h3 class="text-sm font-medium text-white">{seller.user.username}</h3>
        </a>
      {/if}
    </div>

    <div class="-mt-px flex divide-x divide-neutral-700">
      <div class="relative inline-flex w-0 flex-1 items-center justify-center overflow-hidden rounded-bl-lg text-sm font-medium text-neutral-200">
        <span class="z-10 inline-block flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-neutral-800 transition-transform duration-300 group-hover:scale-125 group-hover:text-neutral-900">{` Tier ${["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][seller.minion.generator_tier - 1]} (${seller.minion.generator_tier})`}</span>
        <div class="absolute z-0 h-5 w-20 flex-shrink-0 rounded-[50px] bg-neutral-400 transition-all duration-500 group-hover:h-full group-hover:w-full group-hover:rounded-none" />
      </div>
      <div class="relative -ml-px inline-flex w-0 flex-1 overflow-hidden">
        <span class="relative z-10 inline-flex w-0 flex-1 items-center justify-center overflow-hidden py-4 text-sm font-medium text-neutral-200 transition-all duration-300 group-hover:scale-125 group-hover:text-neutral-900">
          <img class="mr-1 h-6 w-6 pointer-events-none" src="/assets/images/coin.png" alt="Coin icon" />
          {(() => {
            let num = seller.price;
            return formatNumber(num);
          })()}
          <span class="text-sm transition-all duration-300 group-hover:text-neutral-900/0 text-neutral-200/50 ml-1 group-hover:ml-0">/</span>
          <span class="text-sm transition-all duration-300 group-hover:text-neutral-900 text-neutral-200/50 group-hover:-ml-0.5">each</span>
        </span>
        <div class="absolute z-0 h-0 w-full flex-shrink-0 bg-neutral-400 transition-all duration-500 group-hover:h-full" />
      </div>
      <div class="relative inline-flex w-0 flex-1 items-center justify-center overflow-hidden rounded-br-lg text-sm font-medium text-neutral-200">
        <span class="z-10 inline-block flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-neutral-800 transition-transform duration-300 group-hover:scale-125 group-hover:text-neutral-900">{` Amount: ${seller.amount}`}</span>
        <div class="absolute z-0 h-5 w-20 flex-shrink-0 rounded-[50px] bg-neutral-400 transition-all duration-500 group-hover:h-full group-hover:w-full group-hover:rounded-none" />
      </div>
    </div>
    {#if seller.hasInfusion}
      <div class="absolute right-2 m-0 p-2 top-2 w-10 h-10 flex !border-2 !border-black/30 justify-center items-center rounded-lg bg-neutral-700 transition-all duration-300 group-hover:bg-neutral-900 group-hover:!border-black/0">
        <img class="w-[18.85px] h-[20px]" src="https://mc-heads.net/head/7e051df4dd2151481f5145b93fb7a9aa62888fbcb90add9890ad07caf1faca73" alt="Mithril Infusion" />
      </div>
    {/if}
    {#if $page.url.pathname === "/profile"}
      <button class="absolute left-12 top-2 text-neutral-400 group bg-neutral-700 focus:ring-4 focus:outline-none focus:ring-transparent rounded-lg text-sm p-1.5 hover:text-white/70 hover:bg-red-600 group-hover:opacity-100 !border-0 transition-all duration-300" type="button" on:click={() => openModal(seller.id)}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </button>
    {/if}

    {#if isMinionPage}
      <button
        id="minionButton"
        data-dropdown-toggle="dropdown"
        class="absolute left-2 top-2 text-neutral-400 group bg-neutral-700 focus:ring-4 focus:outline-none focus:ring-transparent rounded-lg text-sm p-1.5 group-hover:opacity-100 !border-0 transition-all duration-300 bg-opacity-0 hover:bg-opacity-100"
        class:opacity-0={isHome}
        class:!bg-opacity-100={!isHome}
        type="button"
        on:click={() => {
          // copy url to clipboard
          navigator.clipboard.writeText(`${window.location.host}/${seller.user.username}/${seller.id}/`);
          // change the icon to a checkmark
          copied = true;
          // change the icon back to a minion icon after 2 seconds
          setTimeout(() => {
            copied = false;
          }, 2000);
        }}
      >
        {#if !copied}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="group-hover:text-white transition-colors duration-300 w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 text-green-400 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        {/if}
      </button>
    {/if}
  </div>
</li>
