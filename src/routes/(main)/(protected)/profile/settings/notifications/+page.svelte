<script lang="ts">
  import { Separator } from "$lib/components/ui/separator";
  import NotificationsForm from "./notifications-form.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<div class="space-y-6">
  <div>
    <h3 class="text-lg font-medium">Notifications</h3>
    <p class="text-sm text-muted-foreground">Configure your notification preferences.</p>
  </div>
  <Separator />
  <NotificationsForm data={data.form} />
</div>
