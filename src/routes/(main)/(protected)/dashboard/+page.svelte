<script lang="ts">
  import * as Avatar from "$lib/components/ui/avatar";
  import * as Card from "$lib/components/ui/card";
  import { formatNumber } from "$lib/utilities";
  import ContactRound from "lucide-svelte/icons/contact-round";
  import MessagesSquare from "lucide-svelte/icons/messages-square";
  import ShoppingCart from "lucide-svelte/icons/shopping-cart";
  import Users from "lucide-svelte/icons/users";
  import type { PageData } from "./$types";
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
      count: data.auctioncount
    },
    {
      title: "Minions",
      icon: ContactRound,
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
      <Card.Root class="border-border bg-transparent">
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
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
    <Card.Root class="col-span-1 border-border  bg-transparent md:col-span-4">
      <Card.Header>
        <Card.Title>Recent Auctions</Card.Title>
        <Card.Description>Auctions that have been created recently</Card.Description>
      </Card.Header>
      <Card.Content>
        <div class="space-y-8">
          {#each data.auctions as auction}
            <div class="flex flex-col items-center space-y-2 md:flex-row">
              <a href={`/user/${auction.user.username}/${auction.id}`} class="flex w-full items-center rounded-lg px-4 py-2 hover:bg-accent/50">
                <div class="flex w-full flex-col gap-2 md:flex-row md:items-center md:gap-0">
                  <div class="flex flex-shrink-0 flex-col items-start justify-start md:basis-64 md:flex-row md:items-center">
                    <Avatar.Root class="h-9 w-9 flex-shrink-0 rounded-full ">
                      <Avatar.Image class="pointer-events-none h-full w-full bg-accent p-1" src={`https://res.cloudinary.com/minionah/image/upload/v1/minions/head/${auction.minion.id}`} alt={`${auction.minion.name}'s avatar`} />
                      <Avatar.Fallback class="border-2 border-accent bg-accent">{auction.minion.name.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                    </Avatar.Root>
                    <div class="mt-2 flex w-full flex-col justify-between md:ml-4 md:flex-row md:items-center">
                      <div class="space-y-1 [overflow-wrap:anywhere]">
                        <p class="text-sm font-medium leading-none">{auction.minion.name}</p>
                        <p class="text-sm text-muted-foreground">Price: {formatNumber(auction.price)}</p>
                      </div>
                    </div>
                  </div>
                  <div class="hidden flex-shrink-0 flex-col md:flex">
                    <Avatar.Root class="h-9 w-9 flex-shrink-0 rounded-full ">
                      <Avatar.Image class="pointer-events-none h-full w-full bg-accent p-1" src={`https://res.cloudinary.com/minionah/image/upload/v1/users/avatars/${auction.user.id}`} alt={`${auction.user.username}'s avatar`} />
                      <Avatar.Fallback class="border-2 border-accent bg-accent">{auction.user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
                    </Avatar.Root>
                    <p class="mt-2 text-sm font-medium leading-none">{auction.user.username}</p>
                  </div>
                </div>
                <div class="ml-6 font-medium md:ml-auto md:flex-shrink-0">
                  {#if typeof window !== "undefined"}
                    {new Date(auction.timeCreated).toLocaleString(window.navigator.language, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric"
                    })}
                  {/if}
                </div>
              </a>
            </div>
          {/each}
        </div></Card.Content>
    </Card.Root>
    <Card.Root class="col-span-1 border-border bg-transparent md:col-span-3">
      <Card.Header>
        <Card.Title>Recent Users</Card.Title>
        <Card.Description>Users who have recently logged in</Card.Description>
      </Card.Header>
      <Card.Content class="space-y-8">
        {#each data.users as user}
          <div class="flex flex-col items-center space-y-2 md:flex-row">
            <a href={`/user/${user.username}`} class="flex w-full items-center rounded-lg px-4 py-2 hover:bg-accent/50">
              <Avatar.Root class="h-9 w-9 flex-shrink-0 rounded-full ">
                <Avatar.Image class="pointer-events-none h-full w-full bg-accent p-1" src={`https://res.cloudinary.com/minionah/image/upload/v1/users/avatars/${user.id}`} alt={`${user.username}'s avatar`} />
                <Avatar.Fallback class="border-2 border-accent bg-accent">{user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
              </Avatar.Root>
              <div class="ml-4 flex w-full flex-col items-center justify-between md:flex-row">
                <div class="space-y-1 [overflow-wrap:anywhere]">
                  <p class="text-sm font-medium leading-none">{user.username}</p>
                  <p class="max-w-36 text-sm text-muted-foreground">{user.id}</p>
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
      </Card.Content>
    </Card.Root>
  </div>
</div>
