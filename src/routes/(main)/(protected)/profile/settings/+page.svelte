<script lang="ts">
  import type { PageData } from "./$types";
  import ProfileForm from "./profile-form.svelte";
  export let data: PageData;
</script>

<ProfileForm data={data.form} />
