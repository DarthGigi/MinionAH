<script lang="ts">
  import { page } from "$app/stores";
  import * as Select from "$lib/components/ui/select";
  import { preferences } from "$lib/stores/preferences";
  import { createEventDispatcher } from "svelte";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { cn } from "$lib/utils";

  const dispatch = createEventDispatcher<{ onSelectedTierChange: { tier: number | undefined | unknown } }>();

  export let maxtier: number = 12;
  export let disabled: boolean = false;
  export let tiggerClasses = "";

  let selected = false;

  let tiers: number[];

  $: maxtier,
    (tiers = Array(maxtier)
      .fill(0)
      .map((_, i) => i + 1));

  let showAny = false;
</script>

<Select.Root
  {disabled}
  onSelectedChange={(v) => {
    selected = true;
    dispatch("onSelectedTierChange", { tier: v ? v.value : undefined });
    if ($page.url.pathname !== "/profile" && v?.value !== 0) showAny = true;
  }}>
  <Select.Trigger class={cn("w-40 border border-input bg-background font-medium focus:border-input focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 md:w-44", !selected && "text-muted-foreground", tiggerClasses)} aria-label="Select a tier">
    <Select.Value placeholder="Select a tier" />
  </Select.Trigger>
  <Select.Content class="border-border bg-popover text-popover-foreground">
    <ScrollArea class="h-56 rounded-md">
      {#if showAny}
        <Select.Item label="Any" value={0} class="px-2 data-[highlighted]:bg-background">Any</Select.Item>
      {/if}

      {#each tiers as tier}
        <Select.Item label={`${$preferences.romanNumerals ? ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][tier - 1] : tier} `} value={tier} class="px-2 data-[highlighted]:bg-background">
          {`${$preferences.romanNumerals ? ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][tier - 1] : tier}`}
        </Select.Item>
      {/each}
    </ScrollArea>
  </Select.Content>
</Select.Root>
