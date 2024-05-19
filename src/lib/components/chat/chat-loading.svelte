<script lang="ts">
  import { fly } from "svelte/transition";

  const initialChats: { number: number; animate: boolean }[] = Array.from({ length: 6 }, (_, i) => ({ number: i, animate: false }));
  let chats: { number: number; animate: boolean }[] = [];

  setInterval(() => {
    chats = [...chats, { number: chats.length + 1, animate: true }];
  }, 1000);
</script>

{#each initialChats as chat}
  <div class="pulse rounded-full {chat.number % 2 !== 0 ? 'self-end rounded-br-none bg-[#3C83F7]' : 'self-start rounded-bl-none bg-[#3B3B3D]'} px-4 py-2">
    <div class="h-4 w-16"></div>
  </div>
{/each}

{#each chats as chat}
  {#if chat.animate}
    <div in:fly|global={{ y: 24 }} out:fly={{ duration: 0 }} class="pulse rounded-full {chat.number % 2 === 0 ? 'self-end rounded-br-none bg-[#3C83F7]' : 'self-start rounded-bl-none bg-[#3B3B3D]'} px-4 py-2">
      <div class="h-4 w-16"></div>
    </div>
  {/if}
{/each}

<style>
  .pulse {
    animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
  }
</style>
