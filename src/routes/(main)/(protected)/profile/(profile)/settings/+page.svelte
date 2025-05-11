<script lang="ts">
  import type { PageData } from "./$types";
  import DeleteAccountForm from "./delete-account-form.svelte";
  import ProfileForm from "./profile-form.svelte";
  export let data: PageData;
</script>

<ProfileForm data={data.updateForm} />
<DeleteAccountForm data={data.deleteForm} />
