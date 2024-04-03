<script lang="ts">
  import { Separator } from "$lib/components/ui/separator";
  import type { PageData } from "./$types";
  import NotificationsForm from "./notifications-form.svelte";

  export let data: PageData;
</script>

<div class="space-y-6">
  <div>
    <h3 class="text-lg font-medium">Notifications</h3>
    <p class="text-sm text-muted-foreground">Customize your notification settings</p>
  </div>
  <Separator />
  <NotificationsForm data={data.form} />
</div>
