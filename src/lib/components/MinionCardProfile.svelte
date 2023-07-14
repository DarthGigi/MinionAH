<script lang="ts">
  import type { Seller } from "$lib/types";
  import { createEventDispatcher } from "svelte";
  export let seller: Seller;

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
  <div class="relative col-span-1 list-item divide-y divide-neutral-700 rounded-lg bg-neutral-800">
    <div class="flex h-full w-full items-center justify-center space-x-6 px-4">
      <button type="button" class="absolute right-0 top-0 mr-2 mt-2 h-6 w-6 rounded bg-neutral-700 transition-all duration-300 hover:scale-110 hover:bg-neutral-600" on:click={() => openModal(seller.id)}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6 p-1">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </button>
      <div class="z-20 my-2 flex flex-col items-center truncate rounded p-1">
        <div class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-neutral-700 p-1">
          <img class="pointer-events-none h-full w-full" src={`https://mc-heads.net/head/${seller.minion.texture}`} alt={`${seller.minion.name} head image`} />
        </div>
        <h3 class="truncate text-sm font-medium text-white">{seller.minion.name.replace(/ [IVX]+$/, "")}</h3>
      </div>
    </div>

    <div class="-mt-px flex divide-x divide-neutral-700">
      <div class="relative inline-flex w-0 flex-1 items-center justify-center overflow-hidden rounded-bl-lg text-sm font-medium text-neutral-200">
        <span class="z-10 inline-block flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-neutral-800 transition-transform duration-300">{`Tier ${["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][seller.minion.generator_tier - 1]} (${seller.minion.generator_tier})`}</span>
        <div class="absolute z-0 h-5 w-20 flex-shrink-0 rounded-[50px] bg-neutral-400 transition-all duration-500" />
      </div>
      <div class="relative -ml-px inline-flex w-0 flex-1 overflow-hidden">
        <span class="relative z-10 inline-flex w-0 flex-1 items-center justify-center overflow-hidden py-4 text-sm font-medium text-neutral-200 transition-all duration-300">
          <img class="pointer-events-none mr-1 h-6 w-6" src="/assets/images/coin.png" alt="Coin icon" />
          {(() => {
            let num = seller.price;
            return formatNumber(num);
          })()}
        </span>
        <div class="absolute z-0 h-0 w-full flex-shrink-0 bg-neutral-400 transition-all duration-500" />
      </div>
      <div class="relative inline-flex w-0 flex-1 items-center justify-center overflow-hidden rounded-br-lg text-sm font-medium text-neutral-200">
        <span class="z-10 inline-block flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-neutral-800 transition-transform duration-300">{` Amount: ${seller.amount}`}</span>
        <div class="absolute z-0 h-5 w-20 flex-shrink-0 rounded-[50px] bg-neutral-400 transition-all duration-500" />
      </div>
    </div>
  </div>
</li>
