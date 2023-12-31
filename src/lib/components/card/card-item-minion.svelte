<script lang="ts">
  import * as Avatar from "$lib/components/ui/avatar";
  import * as HoverCard from "$lib/components/ui/hover-card";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import type { Seller } from "$lib/types";
  import { formatNumber } from "$lib/utilities";
  import * as headview3d from "headview3d";
  import { getContext } from "svelte";
  const minion = getContext<Seller>("minion");

  let minionCanvas: HTMLCanvasElement;

  let minionViewer: headview3d.SkinViewer;

  $: minionCanvas, createMinionViewer();
  function createMinionViewer() {
    if (minionCanvas) {
      if (!minion.minion.skin) return;
      const minionCanvasContainerDimensions = (document.getElementById(`minionCanvasContainer_${minion.id}`) as HTMLDivElement).getBoundingClientRect();
      minionViewer = new headview3d.SkinViewer({
        canvas: minionCanvas,
        width: minionCanvasContainerDimensions.width,
        height: minionCanvasContainerDimensions.height,
        skin: `data:image/png;base64,${minion.minion.skin}`,
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
      <Avatar.Image class="pointer-events-none h-full w-full bg-neutral-700 p-1" src={`data:image/png;base64,${minion.minion.texture}`} alt={minion.minion.name} />
      <Avatar.Fallback class="border-2 border-neutral-600 bg-neutral-700">{minion.user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
    </Avatar.Root>
    <h3 class="truncate text-sm font-medium text-white">{minion.minion.name.replace(/ [IVX]+$/, "")}</h3>
  </HoverCard.Trigger>
  <HoverCard.Content class="mt-0 w-80 -translate-y-44 border-neutral-700 bg-neutral-900">
    <div class="flex justify-center gap-x-4">
      <Avatar.Root id={`minionCanvasContainer_${minion.id}`} class="h-12 w-12 flex-shrink-0 rounded-full bg-neutral-700">
        <canvas bind:this={minionCanvas} class="!h-full !w-full cursor-move rounded-full" />
        <Avatar.Fallback class="border-2 border-neutral-600 bg-neutral-700">{minion.user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
      </Avatar.Root>
      <div class="space-y-1">
        <h4 class="text-sm font-semibold">
          {minion.minion.name}
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
              <Tooltip.Trigger class="cursor-help font-minecraft text-[#FEFF55]">
                Raw Craft Cost: <span class="text-[#FEAB00]">{formatNumber(minion.minion.craftCost)} coins</span>
              </Tooltip.Trigger>
              <Tooltip.Content class="border-neutral-700 bg-neutral-900 text-neutral-200">
                <p>Raw Craft Cost is not 100% accurate.</p>
              </Tooltip.Content>
            </Tooltip.Root>
          </p>
        </h4>
      </div>
    </div>
  </HoverCard.Content>
</HoverCard.Root>
