<script lang="ts">
  import type { PageData } from "./$types";
  import DataTable from "./data-table.svelte";
  export let data: PageData;
</script>

<DataTable data={data.minions} />
