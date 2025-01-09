<script lang="ts">
  import type { Auction } from "$lib/types";
  import NumberFlow from "@number-flow/svelte";
  import { getContext } from "svelte";

  export let hovering: boolean;

  const minion = getContext<Auction>("minion");
  const enableHoverEffects = getContext<boolean>("enableHoverEffects");
</script>

<div class="relative -ml-px inline-flex w-0 flex-1 overflow-hidden">
  <span class="relative z-10 inline-flex w-0 flex-1 items-center justify-center overflow-hidden py-4 text-sm font-medium transition-all duration-300 group-hover:translate-y-0 group-hover:scale-125" class:group-hover:translate-y-0={minion.amount ? minion.amount > 1 : false}>
    <img class="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 transition-opacity duration-500 group-hover:opacity-0" src="/assets/images/coin.png" alt="Hypixel SkyBlock Coin" />
    <div class="mx-auto transition-all duration-300 group-hover:translate-y-0" class:-translate-y-2.5={minion.amount ? minion.amount > 1 : false}>
      <NumberFlow class="text-center text-primary transition-colors duration-500 group-hover:text-muted" format={{ notation: "compact" }} value={hovering && enableHoverEffects ? minion.price * (minion.amount ?? 1) : minion.price} />
    </div>
    {#if minion.amount ? minion.amount > 1 : false}
      <span class="absolute -bottom-1 pt-1 text-sm text-primary/50 transition-all duration-300" class:group-hover:opacity-0={enableHoverEffects} class:-translate-y-2.5={minion.amount ? minion.amount > 1 : false}>/each</span>
    {/if}
  </span>
  <div class="absolute z-0 h-0 w-full flex-shrink-0 bg-muted-foreground transition-all duration-500 group-hover:h-full"></div>
</div>
