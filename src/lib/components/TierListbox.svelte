<script lang="ts">
  import { page } from "$app/stores";
  import { Label } from "$lib/components/ui/label";
  import * as Select from "$lib/components/ui/select";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let tiers: number[] = Array(12)
    .fill(0)
    .map((_, i) => i + 1);
  let selectedTier: { disabled: boolean; label: string; value: number } = { disabled: false, label: "", value: 0 };
  $: selectedTier &&
    dispatch("filterTier", {
      tier: selectedTier.value
    });
</script>

<Select.Root bind:selected={selectedTier}>
  <Label for="tier" class="block text-base font-normal">Tier</Label>
  <Select.Trigger id="tier" class="w-44 border-none bg-neutral-700 focus:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-0">
    <Select.Value placeholder={selectedTier.value == 0 ? "Select tier" : `${["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][selectedTier.value - 1]} (${selectedTier.label})`} />
  </Select.Trigger>
  <Select.Content class="max-h-56 overflow-scroll border-2 border-neutral-600 bg-neutral-700 text-neutral-200">
    {#if selectedTier.value !== 0 && $page.url.pathname !== "/profile"}
      <Select.Item value={0} class="data-[highlighted]:bg-neutral-800 data-[highlighted]:text-neutral-300">Any</Select.Item>
    {/if}

    {#each tiers as tier}
      <Select.Item value={tier} class="data-[highlighted]:bg-neutral-800 data-[highlighted]:text-neutral-300">{`${["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][tier - 1]} (${tier})`}</Select.Item>
    {/each}
  </Select.Content>
  <input type="hidden" name="tier" bind:value={selectedTier.value} />
</Select.Root>
