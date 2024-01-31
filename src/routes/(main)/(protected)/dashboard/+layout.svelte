<script lang="ts">
  import { page } from "$app/stores";
  $: path = $page.url.pathname;

  const links = [
    { href: "/dashboard", text: "Overview" },
    { href: "/dashboard/users", text: "Users" },
    { href: "/dashboard/auctions", text: "Auctions" },
    { href: "/dashboard/minions", text: "Minions" }
  ];
</script>

<div class="flex-col md:flex">
  <div class="border-b border-border">
    <div class="flex h-16 items-center px-4">
      <nav class="mx-6 flex items-center space-x-4 lg:space-x-6">
        {#each links as link (link.href)}
          <a href={link.href} class="text-sm font-medium transition-colors hover:text-primary" class:text-muted-foreground={path !== link.href}> {link.text} </a>
        {/each}
      </nav>
    </div>
  </div>
  <slot />
</div>
