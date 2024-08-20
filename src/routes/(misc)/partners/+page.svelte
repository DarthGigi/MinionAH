<script lang="ts">
  import PartnerCard from "./partner-card.svelte";
  import { partners } from "./partners";
</script>

<div class="relative mx-auto flex w-full max-w-sm flex-col items-center justify-center gap-3">
  <h2 class="text-center text-6xl font-semibold leading-none text-foreground">Partnerships</h2>
  <p class="text-center text-xs text-accent">We are proud to be partnered with the following communities. <br /> If you are interested in partnering with us, please reach out to us.</p>
</div>

<div class="py-8 max-md:pb-20">
  <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 px-4 sm:px-6 lg:px-8">
    {#each partners as partner}
      <PartnerCard cardData={partner} />
    {/each}
  </div>
</div>
