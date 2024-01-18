<script lang="ts">
  import * as Avatar from "$lib/components/ui/avatar";
  import * as HoverCard from "$lib/components/ui/hover-card";
  import type { Seller } from "$lib/types";
  import * as headview3d from "headview3d";
  import { Info, MessagesSquare } from "lucide-svelte";
  import { getContext } from "svelte";
  const minion = getContext<Seller>("minion");

  let userViewer: headview3d.SkinViewer;
  let userCanvas: HTMLCanvasElement;

  $: userCanvas, createUserViewer();
  function createUserViewer() {
    if (userCanvas) {
      if (!minion.user.skin) return;
      const userCanvasContainerDimensions = (document.getElementById(`userCanvasContainer_${minion.id}`) as HTMLDivElement).getBoundingClientRect();
      userViewer = new headview3d.SkinViewer({
        canvas: userCanvas,
        width: userCanvasContainerDimensions.width,
        height: userCanvasContainerDimensions.height,
        skin: `data:image/png;base64,${minion.user.skin}`,
        zoom: 2.5,
        background: "#404040"
      });

      userViewer.animations.add(headview3d.RotatingAnimation).speed = 0.5;

      let control = headview3d.createOrbitControls(userViewer);
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

  let userisOpen = false;

  $: if (!userisOpen && userViewer) {
    destroyViewer(userViewer);
  }
</script>

<HoverCard.Root openDelay={150} closeDelay={150} bind:open={userisOpen}>
  <HoverCard.Trigger href={`/${minion.user.username}`} class="my-2 flex flex-col items-center truncate rounded p-1 transition-all duration-500">
    <Avatar.Root class="h-12 w-12 flex-shrink-0 rounded-full ">
      <Avatar.Image class="pointer-events-none h-full w-full bg-neutral-700 p-1" src={`data:image/png;base64,${minion.user.avatar}`} alt={`${minion.user.username}'s avatar`} />
      <Avatar.Fallback class="border-2 border-neutral-600 bg-neutral-700">{minion.user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
    </Avatar.Root>
    <h3 class="truncate text-sm font-medium text-white">{minion.user.username}</h3>
  </HoverCard.Trigger>
  <HoverCard.Content class="mt-0 -translate-y-44 gap-x-2 border-neutral-700 bg-neutral-900">
    <div class="flex items-center justify-center gap-x-2">
      <Avatar.Root id={`userCanvasContainer_${minion.id}`} class="h-12 w-12 flex-shrink-0 rounded-full bg-neutral-700">
        <canvas bind:this={userCanvas} class="!h-full !w-full cursor-move rounded-full" />
        <Avatar.Fallback class="border-2 border-neutral-600 bg-neutral-700">{minion.user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
      </Avatar.Root>
      <div>
        <h4 class="text-sm font-semibold">
          {minion.user.username}
        </h4>
        <p class="text-xs text-muted-foreground">
          Last online: {new Date(minion.user.loggedInAt).toLocaleString(window.navigator.language, {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric"
          })}
        </p>
      </div>
      <div class="flex flex-col gap-2">
        <a href={`https://sky.shiiyu.moe/stats/${minion.user.username}`} target="_blank" rel="noopener" class="group rounded bg-neutral-700 p-1 text-sm text-neutral-400 focus:outline-none focus:ring-4 focus:ring-transparent">
          <Info class="h-5 w-5 transition-colors duration-300 group-hover:text-white" />
        </a>
        <a href={`/${minion.user.username}/chat`} class="group rounded bg-neutral-700 p-1 text-sm text-neutral-400 focus:outline-none focus:ring-4 focus:ring-transparent">
          <MessagesSquare class="h-5 w-5 transition-colors duration-300 group-hover:text-white" />
        </a>
      </div>
    </div>
  </HoverCard.Content>
</HoverCard.Root>
