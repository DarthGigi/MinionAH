<script lang="ts">
  import { preferences } from "$lib/stores/preferences";
  export let tier: number;
</script>

{#if $preferences.romanNumerals}
  {["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][tier - 1]}
{:else}
  {tier}
{/if}
