<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { Contact2, MessagesSquare, ShoppingCart, Users } from "lucide-svelte";
  import type { PageData } from "./$types";
  import * as Avatar from "$lib/components/ui/avatar";
  export let data: PageData;

  const cards = [
    {
      title: "Users",
      icon: Users,
      count: data.usercount
    },
    {
      title: "Auctions",
      icon: ShoppingCart,
      count: data.auctions
    },
    {
      title: "Minions",
      icon: Contact2,
      count: data.minions
    },
    {
      title: "Chats",
      icon: MessagesSquare,
      count: data.chats
    }
  ];
</script>

<div class="flex-1 space-y-4 p-8 pt-6">
  <div class="flex items-center justify-between space-y-2">
    <h2 class="text-3xl font-bold tracking-tight">Dashboard</h2>
  </div>
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {#each cards as card}
      <Card.Root class="border-none bg-background">
        <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
          <Card.Title class="text-sm font-medium">{card.title}</Card.Title>
          <svelte:component this={card.icon} class="h-4 w-4 text-muted-foreground" />
        </Card.Header>
        <Card.Content>
          <div class="text-2xl font-bold">{card.count}</div>
        </Card.Content>
      </Card.Root>
    {/each}
  </div>
  <div class="grid gap-4">
    <Card.Root class="col-span-3 border-none bg-background">
      <Card.Header>
        <Card.Title>Recent Users</Card.Title>
        <Card.Description>Users who have recently logged in</Card.Description>
      </Card.Header>
      <Card.Content>
        <div class="space-y-8">
          {#each data.users as user}
            <div class="flex flex-col items-center space-y-2 md:flex-row">
              <a href={`/${user.username}`} class="flex w-full items-center rounded-lg px-4 py-2 hover:bg-muted">
                <Avatar.Root class="h-9 w-9 flex-shrink-0 rounded-full ">
                  <Avatar.Image class="pointer-events-none h-full w-full bg-accent p-1" src={`data:image/png;base64,${user.avatar}`} alt={`${user.username}'s avatar`} />
                  <Avatar.Fallback class="border-2 border-accent bg-accent">{user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                </Avatar.Root>
                <div class="ml-4 flex w-full flex-col items-center justify-between md:flex-row">
                  <div class="space-y-1 [overflow-wrap:anywhere]">
                    <p class="text-sm font-medium leading-none">{user.username}</p>
                    <p class="text-sm text-muted-foreground">{user.id}</p>
                  </div>
                  <div class="font-medium md:ml-auto">
                    {#if typeof window !== "undefined"}
                      {new Date(user.loggedInAt).toLocaleString(window.navigator.language, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric"
                      })}
                    {/if}
                  </div>
                </div>
              </a>
            </div>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>
  </div>
</div>
