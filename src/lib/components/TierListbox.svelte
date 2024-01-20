<script lang="ts">
  import { page } from "$app/stores";
  import * as Form from "$lib/components/ui/form";
  import { createEventDispatcher } from "svelte";
  import { preferences } from "$lib/stores/preferences";

  const dispatch = createEventDispatcher();

  export let maxtier: number = 12;
  export let config: any;
  export let disabled: boolean = false;
  export let showValidation: boolean = true;

  let selected = false;

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
        selected = true;
        dispatch("filterTier", { tier: v ? v.value : undefined });
        if ($page.url.pathname !== "/profile" && v?.value !== 0) showAny = true;
      }}>
      <Form.SelectTrigger placeholder="Select tier" class={`w-40 border-none bg-accent font-medium focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 md:w-44 ${!selected ? "text-muted-foreground" : ""}`} aria-label="Select tier"></Form.SelectTrigger>
      <Form.SelectContent class="scrollbar max-h-56 overflow-y-auto overflow-x-clip border border-border bg-popover text-popover-foreground">
        {#if showAny}
          <Form.SelectItem label="Any" value={0} class="px-2 data-[highlighted]:bg-background">Any</Form.SelectItem>
        {/if}

        {#each tiers as tier}
          <Form.SelectItem label={`${$preferences.romanNumerals ? ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][tier - 1] : tier} `} value={tier} class="px-2 data-[highlighted]:bg-background">
            {`${$preferences.romanNumerals ? ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][tier - 1] : tier}`}
          </Form.SelectItem>
        {/each}
      </Form.SelectContent>
    </Form.Select>
    {#if showValidation}
      <Form.Validation class="w-40 md:w-44" />
    {/if}
  </Form.Item>
</Form.Field>
