<script lang="ts">
  import { fly } from "svelte/transition";

  let chats: { number: number; show: boolean }[] = Array.from({ length: 5 }, (_, i) => ({ number: i, show: false }));

  for (let i = 0; i < chats.length; i++) {
    setTimeout(() => {
      chats[i].show = true;
    }, i * 1000);
  }
</script>

{#each chats.slice().reverse() as chat}
  {#if chat.show}
    <div in:fly|global={{ y: 24 }} out:fly={{ duration: 0 }} class="pulse rounded-full {chat.number % 2 === 0 ? 'self-end rounded-br-none bg-[#3C83F7]' : 'self-start rounded-bl-none bg-[#3B3B3D]'} px-4 py-2">
      <div class="h-4 w-16" />
    </div>
  {/if}
{/each}

{#each chats as chat}
  <div class="pulse rounded-full {chat.number % 2 !== 0 ? 'self-end rounded-br-none bg-[#3C83F7]' : 'self-start rounded-bl-none bg-[#3B3B3D]'} px-4 py-2">
    <div class="h-4 w-16" />
  </div>
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
