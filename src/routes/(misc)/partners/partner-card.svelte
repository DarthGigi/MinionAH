<script lang="ts">
  import * as Avatar from "$lib/components/ui/avatar";
  import * as Card from "$lib/components/ui/card";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import Earth from "lucide-svelte/icons/earth";
  import type { CardData } from "./partners";

  export let cardData: CardData;
</script>

<Card.Root class="max-w-[32rem] border-border bg-background">
  <Card.Header class="flex flex-col items-center justify-center space-y-0 max-md:gap-6 md:flex-row md:justify-between">
    <a href={cardData.links[0].url} target="_blank" rel="noopener noreferrer" class="group flex flex-row items-center justify-start gap-2">
      <Avatar.Root class="pointer-events-none select-none">
        <Avatar.Image src={cardData.image} alt={cardData.title} class="transition-all duration-300 group-hover:brightness-150" />
        <Avatar.Fallback class="transition-all duration-300 group-hover:brightness-150">{cardData.title.slice(0, 2).toUpperCase()}</Avatar.Fallback>
      </Avatar.Root>
      <div class="flex flex-col">
        <Card.Title>{cardData.title}</Card.Title>
        {#if cardData.subTitle}
          <Card.Description>{cardData.subTitle}</Card.Description>
        {/if}
      </div>
    </a>
    <div class="flex flex-row-reverse flex-wrap items-center justify-center gap-2">
      {#each cardData.links as link}
        <Tooltip.Root openDelay={100} closeDelay={0} group="links" closeOnPointerDown={true} closeOnEscape={true}>
          <Tooltip.Trigger asChild let:builder class="group">
            <a href={link.url} target="_blank" rel="noopener noreferrer" class="group" use:builder.action {...builder} title={link.url}>
              <Avatar.Root class="size-7 select-none">
                <Avatar.Image class="pointer-events-none h-full w-full rounded-full bg-accent p-0.5 transition-all duration-300 group-hover:p-0" src={`/api/internal/favicon/${encodeURIComponent(link.url.toString())}`} alt="Favicon" />
                <Avatar.Fallback class="pointer-events-none h-full w-full rounded-full bg-accent p-0.5 transition-all duration-300 group-hover:p-0">
                  <Earth />
                </Avatar.Fallback>
              </Avatar.Root>
            </a>
          </Tooltip.Trigger>
          <Tooltip.Content class="border-border bg-popover">
            <p>{link.name}</p>
          </Tooltip.Content>
        </Tooltip.Root>
      {/each}
    </div>
  </Card.Header>
  <Card.Content class="text-sm">
    <p>{cardData.description}</p>
  </Card.Content>
  <Card.Footer class="flex flex-1 items-center justify-center">
    <Avatar.Root asChild>
      <a href={cardData.links[0].url} target="_blank" rel="noopener noreferrer" class="group relative flex aspect-video h-auto w-full shrink-0 overflow-hidden rounded-xl border border-border shadow-sm">
        <Avatar.Image src={cardData.banner} alt={cardData.title} class="pointer-events-none select-none transition-all duration-300 group-hover:brightness-150" />
        <Avatar.Fallback class="pointer-events-none select-none rounded-xl transition-all duration-300 group-hover:brightness-150">{cardData.title.slice(0, 2).toUpperCase()}</Avatar.Fallback>
      </a>
    </Avatar.Root>
  </Card.Footer>
</Card.Root>
