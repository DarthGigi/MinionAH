<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Transition, Listbox, ListboxButton, ListboxOptions, ListboxOption, ListboxLabel } from "@rgossiaux/svelte-headlessui";
  import { page } from "$app/stores";

  const dispatch = createEventDispatcher();

  let tiers: number[] = Array(12)
    .fill(0)
    .map((_, i) => i + 1);

  console.log($page);

  let selectedTier: number;

  function selectedChoice(tier: number) {
    selectedTier = tier;
    dispatch("filterTier", {
      tier: selectedTier
    });
  }
</script>

<input type="hidden" name="tier" bind:value={selectedTier} />

<Listbox bind:value={selectedTier} class="z-50">
  <ListboxLabel>Tier</ListboxLabel>
  <ListboxButton class="relative w-full cursor-default rounded-md bg-neutral-700 py-1.5 pl-3 pr-10 text-left text-neutral-200 shadow-sm ring-1 ring-inset focus:outline-none focus:ring-2 focus:ring-neutral-500 sm:text-sm sm:leading-6">{isNaN(selectedTier) || selectedTier == null ? "Select tier" : `${["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][selectedTier - 1]} (${selectedTier})`}</ListboxButton>
  <div class="relative mt-2">
    <Transition enter="transition ease-in duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="transition ease-in duration-300" leaveFrom="opacity-100" leaveTo="opacity-0">
      <ListboxOptions class="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-neutral-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
        {#if selectedTier != null && $page.route.id !== "/profile"}
          <ListboxOption on:click={() => selectedChoice(null)} class="relative cursor-default select-none py-2 pl-3 pr-9 text-neutral-200" value={null}>Any</ListboxOption>
        {/if}

        {#each tiers as tier}
          <ListboxOption on:click={() => selectedChoice(tier)} class="relative cursor-default select-none py-2 pl-3 pr-9 text-neutral-200" value={tier} let:selected>
            {`${["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][tier - 1]} (${tier})`}
            {#if selected}
              <span class="absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-200">
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                </svg>
              </span>
            {/if}
          </ListboxOption>
        {/each}
      </ListboxOptions>
    </Transition>
  </div>
</Listbox>
