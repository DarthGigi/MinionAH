<script lang="ts">
  import type { PageData } from "./$types";
  import NotificationsForm from "./notifications-form.svelte";

  export let data: PageData;
</script>

<NotificationsForm data={data.form} />
