<script lang="ts">
  import type { PageData } from "./$types";
  import DataTable from "./data-table.svelte";
  export let data: PageData;

  const minions = [...data.minionsBatch1, ...data.minionsBatch2];
</script>

<DataTable data={minions} />
