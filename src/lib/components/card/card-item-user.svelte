<script lang="ts">
  import * as Avatar from "$lib/components/ui/avatar";
  import * as HoverCard from "$lib/components/ui/hover-card";
  import type { Seller } from "$lib/types";
  import * as headview3d from "headview3d";
  import Info from "lucide-svelte/icons/info";
  import MessagesSquare from "lucide-svelte/icons/messages-square";
  import { getContext } from "svelte";
  const minion = getContext<Seller>("minion");

  let userViewer: headview3d.SkinViewer;
  let userCanvas: HTMLCanvasElement;

  $: userCanvas, createUserViewer();
  const createUserViewer = () => {
    if (userCanvas) {
      if (!minion.user.id) return;
      const skinUrl = `https://res.cloudinary.com/minionah/image/upload/v1/users/skins/${minion.user.id}`;
      const userCanvasContainerDimensions = (document.getElementById(`userCanvasContainer_${minion.id}`) as HTMLDivElement).getBoundingClientRect();
      userViewer = new headview3d.SkinViewer({
        canvas: userCanvas,
        width: userCanvasContainerDimensions.width,
        height: userCanvasContainerDimensions.height,
        skin: skinUrl,
        enableControls: true,
        zoom: 2.5
      });

      userViewer.resetSkin();
      userViewer.autoRotate = true;
      userViewer.autoRotateSpeed = 0.5;
      userViewer.controls.enableRotate = true;
      userViewer.controls.enableZoom = false;
      userViewer.controls.enablePan = false;
    } else {
      return;
    }
  };

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
  <HoverCard.Trigger href={`/user/${minion.user.username}`} class="my-2 flex flex-col items-center truncate rounded p-1 transition-all duration-500">
    <Avatar.Root class="h-12 w-12 flex-shrink-0 rounded-full ">
      <Avatar.Image class="pointer-events-none h-full w-full bg-accent p-1" src={`https://res.cloudinary.com/minionah/image/upload/v1/users/avatars/${minion.user.id}`} alt={`${minion.user.username}'s avatar`} />
      <Avatar.Fallback class="border-2 border-accent bg-accent">{minion.user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
    </Avatar.Root>
    <h3 class="truncate text-sm font-medium text-white">{minion.user.username}</h3>
  </HoverCard.Trigger>
  <HoverCard.Content class="mt-0 gap-x-2 border-accent bg-muted" side="top" align="center">
    <div class="flex items-center justify-center gap-x-2">
      <Avatar.Root id={`userCanvasContainer_${minion.id}`} class="h-12 w-12 flex-shrink-0 rounded-full bg-accent">
        <canvas bind:this={userCanvas} class="!h-full !w-full cursor-move rounded-full" />
        <Avatar.Fallback class="border-2 border-accent bg-accent">{minion.user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
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
        <a href={`https://sky.shiiyu.moe/stats/${minion.user.username}`} target="_blank" rel="noopener" class="group rounded bg-accent p-1 text-sm text-muted-foreground focus:outline-none focus:ring-4 focus:ring-transparent">
          <Info class="h-5 w-5 transition-colors duration-300 group-hover:text-white" />
        </a>
        <a href={`/user/${minion.user.username}/chat`} data-sveltekit-preload-data="off" class="group rounded bg-accent p-1 text-sm text-muted-foreground focus:outline-none focus:ring-4 focus:ring-transparent">
          <MessagesSquare class="h-5 w-5 transition-colors duration-300 group-hover:text-white" />
        </a>
      </div>
    </div>
  </HoverCard.Content>
</HoverCard.Root>
