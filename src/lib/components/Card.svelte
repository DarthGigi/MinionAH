<script lang="ts">
  import { page } from "$app/stores";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import type { Seller } from "$lib/types";
  import { createEventDispatcher, onMount } from "svelte";
  import { fade } from "svelte/transition";
  import MinionCopyButton from "./MinionCopyButton.svelte";
  import { formatNumber } from "$lib/utilities";
  import * as Avatar from "$lib/components/ui/avatar";
  import * as HoverCard from "$lib/components/ui/hover-card";
  import * as headview3d from "headview3d";

  export let minion: Seller;

  const isHome = $page.url.pathname === "/";
  const isMinionPage = $page.url.pathname === `/` || $page.url.pathname === `/profile` || $page.url.pathname === `/${minion.user.username}`;
  let hovering = false;
  let minionCanvas: HTMLCanvasElement;
  let userCanvas: HTMLCanvasElement;

  const dispatch = createEventDispatcher();

  function openModal(minionID: string) {
    dispatch("openDeleteModal", {
      minion: minionID
    });
  }
  let userViewer: headview3d.SkinViewer;
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

  let minionisOpen = false;
  let userisOpen = false;

  $: if (!minionisOpen && minionViewer) {
    destroyViewer(minionViewer);
  }
  $: if (!userisOpen && userViewer) {
    destroyViewer(userViewer);
  }
</script>

<li in:fade|global={{ delay: 0 }}>
  <div class="user-select-none relative list-item divide-y divide-neutral-700 rounded-lg bg-neutral-800 transition-all duration-300" class:group={isHome} class:hover:bg-neutral-900={isHome} on:mouseover={() => (hovering = true)} on:mouseout={() => (hovering = false)} on:blur={() => (hovering = false)} on:focus={() => (hovering = true)} role="listitem">
    <div class="flex h-full w-full items-center justify-center gap-x-6 px-4">
      <HoverCard.Root openDelay={150} closeDelay={150} bind:open={minionisOpen}>
        <HoverCard.Trigger href={`https://hypixel-skyblock.fandom.com/wiki/${minion.minion.name.replace(/ [IVX]+$/, "").replace(/ /g, "_")}`} target="_blank" rel="noopener" class="my-2 flex flex-col items-center truncate rounded p-1 transition-all duration-500">
          <Avatar.Root class="h-12 w-12 flex-shrink-0 rounded-full ">
            <Avatar.Image class="pointer-events-none h-full w-full bg-neutral-700 p-1" src={`data:image/png;base64,${minion.minion.texture}`} alt={minion.minion.name} />
            <Avatar.Fallback class="border-2 border-neutral-600 bg-neutral-700">{minion.user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
          </Avatar.Root>
          <h3 class="truncate text-sm font-medium text-white">{minion.minion.name.replace(/ [IVX]+$/, "")}</h3>
        </HoverCard.Trigger>
        <HoverCard.Content class="mt-0 -translate-y-44 border-neutral-700 bg-neutral-900">
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
                </p>
              </h4>
            </div>
          </div>
        </HoverCard.Content>
      </HoverCard.Root>
      {#if isHome}
        <HoverCard.Root openDelay={150} closeDelay={150} bind:open={userisOpen}>
          <HoverCard.Trigger class="my-2 flex flex-col items-center truncate rounded p-1 transition-all duration-500">
            <Avatar.Root class="h-12 w-12 flex-shrink-0 rounded-full ">
              <Avatar.Image class="pointer-events-none h-full w-full bg-neutral-700 p-1" src={`data:image/png;base64,${minion.user.avatar}`} alt={`${minion.user.username}'s avatar`} />
              <Avatar.Fallback class="border-2 border-neutral-600 bg-neutral-700">{minion.user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
            </Avatar.Root>
            <h3 class="truncate text-sm font-medium text-white">{minion.user.username}</h3>
          </HoverCard.Trigger>
          <HoverCard.Content class="mt-0 -translate-y-44 border-neutral-700 bg-neutral-900">
            <div class="flex justify-center gap-x-4">
              <Avatar.Root id={`userCanvasContainer_${minion.id}`} class="h-12 w-12 flex-shrink-0 rounded-full bg-neutral-700">
                <canvas bind:this={userCanvas} class="!h-full !w-full cursor-move rounded-full" />
                <Avatar.Fallback class="border-2 border-neutral-600 bg-neutral-700">{minion.user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
              </Avatar.Root>
              <div class="space-y-1">
                <h4 class="text-sm font-semibold">
                  {minion.user.username}
                  <p class="text-xs text-muted-foreground">
                    Last online: {new Date(minion.user.loggedInAt).toLocaleString(window.navigator.language, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric"
                    })}
                  </p>
                </h4>
              </div>
            </div>
          </HoverCard.Content>
        </HoverCard.Root>
      {/if}
    </div>

    <div class="-mt-px flex divide-x divide-neutral-700">
      <div class="relative inline-flex w-0 flex-1 items-center justify-center overflow-hidden rounded-bl-lg text-sm font-medium text-neutral-200">
        <span class="z-10 inline-block flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-neutral-800 transition-transform duration-300 group-hover:scale-125 group-hover:text-neutral-900">{` Tier ${["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][minion.minion.generator_tier - 1]} (${minion.minion.generator_tier})`}</span>
        <div class="absolute z-0 h-5 w-20 flex-shrink-0 rounded-[50px] bg-neutral-400 transition-all duration-500 group-hover:h-full group-hover:w-full group-hover:rounded-none" />
      </div>
      <div class="relative -ml-px inline-flex w-0 flex-1 overflow-hidden">
        <span class="relative z-10 inline-flex w-0 flex-1 items-center justify-center overflow-hidden py-4 text-sm font-medium transition-all duration-300 group-hover:translate-y-0 group-hover:scale-125" class:group-hover:translate-y-0={minion.amount ? minion.amount > 1 : false}>
          <img class="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 transition-opacity duration-500 group-hover:opacity-0" src="/assets/images/coin.png" alt="Coin icon" />
          <div class="grid basis-10 transition-all duration-300 group-hover:translate-y-0" class:-translate-y-2.5={minion.amount ? minion.amount > 1 : false}>
            {#if hovering && isHome}
              <span transition:fade class="text-center text-neutral-200 transition-colors duration-500 [grid-area:1/1] group-hover:text-neutral-900">{formatNumber(minion.price * (minion.amount ?? 1))}</span>
            {:else}
              <span transition:fade class="text-center text-neutral-200 transition-colors duration-500 [grid-area:1/1] group-hover:text-neutral-900">{formatNumber(minion.price)}</span>
            {/if}
          </div>
          {#if minion.amount ? minion.amount > 1 : false}
            <span class="absolute -bottom-1 pt-1 text-sm text-neutral-200/50 transition-all duration-300" class:group-hover:opacity-0={isHome} class:-translate-y-2.5={minion.amount ? minion.amount > 1 : false}>/each</span>
          {/if}
        </span>
        <div class="absolute z-0 h-0 w-full flex-shrink-0 bg-neutral-400 transition-all duration-500 group-hover:h-full" />
      </div>
      <div class="relative inline-flex w-0 flex-1 items-center justify-center overflow-hidden rounded-br-lg text-sm font-medium text-neutral-200">
        <span class="z-10 inline-block flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-neutral-800 transition-transform duration-300 group-hover:scale-125 group-hover:text-neutral-900">{` Amount: ${minion.amount}`}</span>
        <div class="absolute z-0 h-5 w-20 flex-shrink-0 rounded-[50px] bg-neutral-400 transition-all duration-500 group-hover:h-full group-hover:w-full group-hover:rounded-none" />
      </div>
    </div>
    {#if minion.hasInfusion}
      <Tooltip.Root>
        <Tooltip.Trigger class="absolute right-2 top-2 m-0 flex h-10 w-10 items-center justify-center rounded-lg !border-2 !border-black/30 bg-neutral-700 p-2 transition-all duration-300 group-hover:!border-black/0 group-hover:bg-neutral-900">
          <img class="pointer-events-none h-auto w-full" src="https://mc-heads.net/head/7e051df4dd2151481f5145b93fb7a9aa62888fbcb90add9890ad07caf1faca73" alt="Mithril Infusion" />
        </Tooltip.Trigger>
        <Tooltip.Content class="border-neutral-700 bg-neutral-900 text-neutral-200">
          <p>Mithril Infused</p>
        </Tooltip.Content>
      </Tooltip.Root>
    {/if}
    {#if $page.url.pathname === "/profile"}
      <button class="group absolute left-12 top-2 rounded-lg !border-0 bg-neutral-700 p-1.5 text-sm text-neutral-400 transition-all duration-300 hover:bg-red-600 hover:text-white/70 focus:outline-none focus:ring-4 focus:ring-transparent group-hover:opacity-100" type="button" on:click={() => openModal(minion.id)}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </button>
    {/if}

    {#if isMinionPage}
      <MinionCopyButton
        class="absolute left-2 top-2"
        {isHome}
        on:click={() => {
          // copy url to clipboard
          navigator.clipboard.writeText(`${window.location.protocol}/${window.location.host}/${minion.user.username}/${minion.id}/`);
        }}
      />

      <a href={`${minion.user.username}/${minion.id}`} class="group absolute left-2 top-12 rounded-lg !border-0 bg-neutral-700 bg-opacity-0 p-1.5 text-sm text-neutral-400 transition-all duration-300 hover:bg-opacity-100 focus:outline-none focus:ring-4 focus:ring-transparent group-hover:opacity-100" class:opacity-0={isHome} class:!bg-opacity-100={!isHome}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5 transition-colors duration-300 group-hover:text-white">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </a>
    {/if}
  </div>
</li>
