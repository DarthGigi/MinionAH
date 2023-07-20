<script lang="ts">
  import { Transition, Listbox, ListboxButton, ListboxOptions, ListboxOption, ListboxLabel } from "@rgossiaux/svelte-headlessui";
  import type { Minion } from "@prisma/client";

  function classNames(...classes: (false | null | undefined | string)[]): string {
    return classes.filter(Boolean).join(" ");
  }

  $: selectedType = { generator: "Select a minion", texture: "none" };

  export let minionType: Minion[];
</script>

<input type="hidden" name="minionType" bind:value={selectedType.generator} />
<Listbox bind:value={selectedType} class="w-40">
  <ListboxLabel>Minion</ListboxLabel>
  <ListboxButton class="relative w-full ring-transparent cursor-default rounded-md bg-neutral-700 py-1.5 pl-3 text-left text-neutral-200 shadow-sm ring-1 ring-inset focus:outline-none focus:ring-2 focus:ring-neutral-500 sm:text-sm sm:leading-6">
    <div class="flex">
      {#if selectedType.texture !== "none"}
        <img loading="lazy" src={`https://mc-heads.net/head/${selectedType.texture}`} class="mr-2 h-6 w-6 pointer-events-none" alt={selectedType.generator} />
      {/if}

      {selectedType ? selectedType.generator.replace(/_/g, " ").toLowerCase().charAt(0).toUpperCase() + selectedType.generator.slice(1).toLowerCase().replace(/_/g, " ") : "Select type"}
    </div>
  </ListboxButton>
  <div class="relative mt-2">
    <Transition enter="transition ease-in duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="transition ease-in duration-300" leaveFrom="opacity-100" leaveTo="opacity-0">
      <ListboxOptions class="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-neutral-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
        {#each minionType as type}
          <ListboxOption
            class={({ active }) => {
              return classNames("relative mx-1 my-2 cursor-default select-none rounded py-2 pl-3 pr-9 text-neutral-200", active ? "bg-neutral-800 text-neutral-100" : "");
            }}
            value={type}
            let:selected
          >
            <div class="flex items-center">
              <img src={`https://mc-heads.net/head/${type.texture}`} class="mr-2 h-6 w-6" alt={type.generator} />
              {type.generator.replace(/_/g, " ").toLowerCase().charAt(0).toUpperCase() + type.generator.slice(1).toLowerCase().replace(/_/g, " ")}
            </div>
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
