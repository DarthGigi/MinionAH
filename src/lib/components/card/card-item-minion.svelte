<script lang="ts">
  import * as Avatar from "$lib/components/ui/avatar";
  import * as HoverCard from "$lib/components/ui/hover-card";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { searchSignal } from "$lib/stores/signals";
  import type { Seller } from "$lib/types";
  import { formatNumber } from "$lib/utilities";
  import * as headview3d from "headview3d";
  import { Info, Search } from "lucide-svelte";
  import { getContext } from "svelte";

  const minion = getContext<Seller>("minion");
  const isHome = getContext<boolean>("isHome");

  let minionCanvas: HTMLCanvasElement;

  let minionViewer: headview3d.SkinViewer;

  function handleSearchSignal(search: string) {
    searchSignal.update(() => search);
  }

  $: minionCanvas, createMinionViewer();
  function createMinionViewer() {
    if (minionCanvas) {
      if (!minion.minion.id) return;
      const skinUrl = `https://res.cloudinary.com/minionah/image/upload/v1/minions/skin/${minion.minion.id}`;
      const minionCanvasContainerDimensions = (document.getElementById(`minionCanvasContainer_${minion.id}`) as HTMLDivElement).getBoundingClientRect();
      minionViewer = new headview3d.SkinViewer({
        canvas: minionCanvas,
        width: minionCanvasContainerDimensions.width,
        height: minionCanvasContainerDimensions.height,
        skin: skinUrl,
        zoom: 2.5,
        background: "#404040"
      });
      minionViewer.resetSkin();
      minionViewer.animations.add(headview3d.RotatingAnimation).speed = 0.5;
      let control = headview3d.createOrbitControls(minionViewer);
      control.enableRotate = true;
      control.enableZoom = false;
      control.enablePan = false;
    } else {
      return;
    }
  }

  function destroyViewer(viewer: headview3d.SkinViewer) {
    if (!viewer) return;
    setTimeout(() => {
      viewer.dispose();
      viewer.renderer.forceContextLoss();
    }, 300);
  }

  let minionisOpen = false;

  $: if (!minionisOpen && minionViewer) {
    destroyViewer(minionViewer);
  }
</script>

<HoverCard.Root openDelay={150} closeDelay={150} bind:open={minionisOpen}>
  <HoverCard.Trigger href={`https://hypixel-skyblock.fandom.com/wiki/${minion.minion.name.replace(/ [IVX]+$/, "").replace(/ /g, "_")}`} target="_blank" rel="noopener" class="my-2 flex flex-col items-center truncate rounded p-1 transition-all duration-500">
    <Avatar.Root class="h-12 w-12 flex-shrink-0 rounded-full ">
      <Avatar.Image class="pointer-events-none h-full w-full bg-accent p-1" src={`https://res.cloudinary.com/minionah/image/upload/f_auto,q_auto/v1/minions/head/${minion.minion.id}`} alt={minion.minion.name} />
      <Avatar.Fallback class="border-2 border-accent bg-accent">{minion.user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
    </Avatar.Root>
    <h3 class="truncate text-sm font-medium text-white">{minion.minion.name.replace(/ [IVX]+$/, "")}</h3>
  </HoverCard.Trigger>
  <HoverCard.Content class="mt-0 w-80 -translate-y-44 gap-x-2 border-accent bg-muted">
    <div class="flex items-center justify-center gap-x-2">
      <Avatar.Root id={`minionCanvasContainer_${minion.id}`} class="h-12 w-12  rounded-full bg-accent">
        <canvas bind:this={minionCanvas} class="!h-full !w-full cursor-move rounded-full" />
        <Avatar.Fallback class="border-2 border-accent bg-accent">{minion.user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
      </Avatar.Root>
      <div>
        <h4 class="text-sm font-semibold">
          {minion.minion.name}
        </h4>
        <p class="text-xs text-muted-foreground">
          Created on {new Date(minion.timeCreated).toLocaleString(window.navigator.language, {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric"
          })}
          <br />
          <Tooltip.Root openDelay={150}>
            <Tooltip.Trigger class="cursor-help text-[#FEFF55]">
              <p class="text-wrap text-left">Raw Craft Cost: <span class="text-[#FEAB00]">{formatNumber(minion.minion.craftCost)} coins</span></p>
            </Tooltip.Trigger>
            <Tooltip.Content class="border-accent bg-muted text-primary">
              <p>Raw Craft Cost is <span class="font-semibold underline">not</span> 100% accurate.</p>
            </Tooltip.Content>
          </Tooltip.Root>
        </p>
      </div>
      <div class="flex flex-col gap-2">
        <a href={`https://hypixel-skyblock.fandom.com/wiki/${minion.minion.name.replace(/ [IVX]+$/, "").replace(/ /g, "_")}`} target="_blank" rel="noopener" class="group rounded bg-accent p-1 text-sm text-muted-foreground focus:outline-none focus:ring-4 focus:ring-transparent">
          <Info class="h-5 w-5 transition-colors duration-300 group-hover:text-white" />
        </a>
        {#if isHome}
          <button
            class="group rounded bg-accent p-1 text-sm text-muted-foreground focus:outline-none focus:ring-4 focus:ring-transparent"
            on:click={() => {
              handleSearchSignal(minion.minion.generator.replace(/_/g, " ").toLowerCase().charAt(0).toUpperCase() + minion.minion.generator.slice(1).toLowerCase().replace(/_/g, " "));
            }}>
            <Search class="h-5 w-5 transition-colors duration-300 group-hover:text-white" />
          </button>
        {/if}
      </div>
    </div>
  </HoverCard.Content>
</HoverCard.Root>
