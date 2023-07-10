<script>
  import { page } from "$app/stores";
</script>

<div class="flex h-screen w-screen flex-col items-center justify-center">
  <h1>{$page.status} {$page.error.message}</h1>
  <span style="font-size: 10em">
    {$page.status}
  </span>
</div>
