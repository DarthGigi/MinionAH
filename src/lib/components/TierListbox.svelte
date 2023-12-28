<script lang="ts">
  import { page } from "$app/stores";
  import * as Form from "$lib/components/ui/form";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let maxtier: number = 12;
  export let config: any;
  export let disabled: boolean = false;
  export let showValidation: boolean = true;

  let tiers: number[];

  $: maxtier,
    (tiers = Array(maxtier)
      .fill(0)
      .map((_, i) => i + 1));

  let showAny = false;
</script>

<Form.Field {config} name="tier">
  <Form.Item class="flex flex-col">
    <Form.Label>Tier</Form.Label>
    <Form.Select
      {disabled}
      onSelectedChange={(v) => {
        dispatch("filterTier", { tier: v ? v.value : undefined });
        if ($page.url.pathname !== "/profile" && v?.value !== 0) showAny = true;
      }}>
      <Form.SelectTrigger placeholder="Select tier" class="w-40 border-none bg-neutral-700 focus:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-0 md:w-44"></Form.SelectTrigger>
      <Form.SelectContent class="max-h-56 overflow-scroll border-2 border-neutral-600 bg-neutral-700 text-neutral-200">
        {#if showAny}
          <Form.SelectItem label="Any" value={0} class="data-[highlighted]:bg-neutral-800 data-[highlighted]:text-neutral-300">Any</Form.SelectItem>
        {/if}

        {#each tiers as tier}
          <Form.SelectItem label={`${["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][tier - 1]} (${tier})`} value={tier} class="data-[highlighted]:bg-neutral-800 data-[highlighted]:text-neutral-300">{`${["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][tier - 1]} (${tier})`}</Form.SelectItem>
        {/each}
      </Form.SelectContent>
    </Form.Select>
    {#if showValidation}
      <Form.Validation class="w-40 md:w-44" />
    {/if}
  </Form.Item>
</Form.Field>
