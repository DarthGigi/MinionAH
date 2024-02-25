<script lang="ts">
  import * as Avatar from "$lib/components/ui/avatar";
  export let image: string;
  export let text: string;
  export let username: string;
</script>

<div class="flex items-center space-x-2">
  <Avatar.Root class="h-12 w-12 flex-shrink-0 rounded-full ">
    <Avatar.Image class="pointer-events-none h-full w-full bg-accent p-1" src={image} alt={`${username}'s avatar`} />
    <Avatar.Fallback class="border-2 border-accent bg-accent">{username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
  </Avatar.Root>
  <p class="whitespace-wrap line-clamp-2 min-w-0 max-w-52 text-ellipsis">{text}</p>
</div>
