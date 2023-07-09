<script lang="ts">
  import type { Minion } from "$lib/types";
  export let minion: Minion;
</script>

<li class="col-span-1 divide-y divide-neutral-700 rounded-lg bg-neutral-800 shadow">
  <div class="flex w-full items-center justify-between space-x-6 p-6">
    <div class="flex-1 truncate">
      <div class="flex items-center justify-start space-x-3">
        <h3 class="truncate text-sm font-medium text-white">{minion.name.replace(/ [IVX]+$/, "")}</h3>
        <span class="inline-block flex-shrink-0 rounded-full bg-neutral-400 px-2 py-0.5 text-xs font-medium text-neutral-800">{` Tier ${["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][minion.generator_tier - 1]} (${minion.generator_tier})`}</span>
      </div>
    </div>
    <div class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-neutral-700 p-1">
      <img class="h-full w-full" src={`https://mc-heads.net/head/${minion.texture}`} alt={`${minion.name} head image`} />
    </div>
  </div>
  <div>
    <div class="-mt-px flex divide-x divide-neutral-700">
      <div class="flex w-0 flex-1">
        <a href="mailto:janecooper@example.com" class="relative -mr-px inline-flex w-0 flex-1 items-center justify-center rounded-bl-lg border border-transparent py-4 text-sm font-medium text-neutral-200 hover:text-neutral-300">
          <!-- Heroicon name: mini/envelope -->
          <svg class="h-5 w-5 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
            <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
          </svg>
          <span class="ml-3">Discord</span>
        </a>
      </div>
      <div class="-ml-px flex w-0 flex-1">
        <a href="tel:+1-202-555-0170" class="relative inline-flex w-0 flex-1 items-center justify-center rounded-br-lg border border-transparent py-4 text-sm font-medium text-neutral-200 hover:text-neutral-300">
          <!-- Heroicon name: mini/phone -->
          <svg class="h-5 w-5 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clip-rule="evenodd" />
          </svg>
          <span class="ml-3">Profile</span>
        </a>
      </div>
    </div>
  </div>
</li>
