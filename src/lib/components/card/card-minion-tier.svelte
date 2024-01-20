<script lang="ts">
  import type { Seller } from "$lib/types";
  import { getContext } from "svelte";
  const minion = getContext<Seller>("minion");
  import { preferences } from "$lib/stores/preferences";
</script>

<div class="relative inline-flex w-0 flex-1 items-center justify-center overflow-hidden rounded-bl-lg text-sm font-medium text-primary">
  <span class="z-10 inline-block flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-secondary transition-transform duration-300 group-hover:scale-125 group-hover:text-muted">
    {#if $preferences.romanNumerals}
      {` Tier ${["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][minion.minion.generator_tier - 1]}`}
    {:else}
      {` Tier ${minion.minion.generator_tier}`}
    {/if}
  </span>
  <div class="absolute z-0 h-5 w-20 flex-shrink-0 rounded-[50px] bg-muted-foreground transition-all duration-500 group-hover:h-full group-hover:w-full group-hover:rounded-none" />
</div>
