<script lang="ts">
  import type { User } from "$generated/prisma";
  import * as Avatar from "$lib/components/ui/avatar";

  export let user: User;
</script>

<div class="flex items-center gap-4">
  <Avatar.Root class="h-9 w-9 flex-shrink-0 rounded-full ">
    <Avatar.Image class="pointer-events-none h-full w-full bg-accent p-1" src={`https://res.cloudinary.com/minionah/image/upload/v1/users/avatars/${user.id}`} alt={`${user.username}'s avatar`} />
    <Avatar.Fallback class="border-2 border-accent bg-accent">{user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
  </Avatar.Root>
  {user.username}
</div>
