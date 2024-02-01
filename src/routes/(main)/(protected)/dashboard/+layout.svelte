<script lang="ts">
  import { page } from "$app/stores";
  $: path = $page.url.pathname;

  const links = [
    { href: "/dashboard", text: "Overview" },
    { href: "/dashboard/users", text: "Users" },
    { href: "/dashboard/auctions", text: "Auctions" },
    { href: "/dashboard/minions", text: "Minions" },
    { href: "/dashboard/chats", text: "Chats" },
    { href: "/dashboard/banned", text: "Banned Users (coming soon)" }
  ];
</script>

<div class="flex-col md:flex">
  <div class="border-b border-border">
    <div class="flex h-16 items-center px-4">
      <nav class="mx-6 flex items-center space-x-4 lg:space-x-6">
        {#each links as link (link.href)}
          {#if link.text !== "Banned Users (coming soon)"}
            <a href={link.href} class="text-sm font-medium transition-colors hover:text-primary" class:text-muted-foreground={path !== link.href}> {link.text} </a>
          {:else}
            <span class="pointer-events-none select-none text-sm font-medium text-muted-foreground/30"> {link.text} </span>
          {/if}
        {/each}
      </nav>
    </div>
  </div>
  <slot />
</div>
