<script lang="ts">
  import { enhance } from "$app/forms";
  import { page } from "$app/stores";
  import MinionCard from "$lib/components/Card.svelte";
  import CardLoading from "$lib/components/CardLoading.svelte";
  import MinionCopyButton from "$lib/components/MinionCopyButton.svelte";
  import MinionsListBox from "$lib/components/MinionsListBox.svelte";
  import TierListbox from "$lib/components/TierListbox.svelte";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import * as Avatar from "$lib/components/ui/avatar";
  import * as Card from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Switch } from "$lib/components/ui/switch";
  import { formatNumber } from "$lib/utilities";
  import type { Minion, MinionSeller as Seller, User } from "@prisma/client";
  import * as skinview3d from "skinview3d";
  import type { PageData } from "./$types";

  import { onMount } from "svelte";

  export let data: PageData;
  $: user = data.user as User;

  let moreThan1 = false;
  let hiddenPrice: HTMLInputElement;

  let showDelete = false;
  let minionToDelete: Seller & { minion: Minion } & { user: User };

  let minecraftAvatar: HTMLCanvasElement;
  let minecraftAvatarContainer: HTMLDivElement;

  let canvasIsLoading = true;

  onMount(async () => {
    const minecraftAvatarContainerDimensions = minecraftAvatarContainer.getBoundingClientRect();
    const viewer = new skinview3d.SkinViewer({
      canvas: minecraftAvatar,
      width: minecraftAvatarContainerDimensions.width,
      height: minecraftAvatarContainerDimensions.height,
      skin: `data:image/png;base64,${user.skin}`,
      [user.cape ? "cape" : ""]: `data:image/png;base64,${user.cape}`,
      enableControls: true,
      animation: new skinview3d.IdleAnimation(),
      nameTag: user.username,
      zoom: 0.7,
      panorama: "/assets/images/panorama.png",
      background: "#050505"
    });
    // disable zooming
    viewer.controls.enableZoom = false;
    // enable damping (smooth dragging)
    viewer.controls.enableDamping = true;
    // disable rotation on the y axis
    viewer.controls.maxPolarAngle = -Math.PI / 2; // upper boundary for the polar angle
    viewer.controls.minPolarAngle = Math.PI / 2; // lower boundary for the polar angle

    canvasIsLoading = false;
  });
</script>

<div class="mx-auto flex max-w-xl flex-col justify-center gap-8 self-center px-2 md:px-0">
  <div class="w-full pt-8">
    <div class="relative mt-5">
      <div bind:this={minecraftAvatarContainer} class="relative">
        <MinionCopyButton class="absolute right-3 top-3 z-30" on:click={() => navigator.clipboard.writeText(`${window.location.protocol}/${window.location.host}/${user.username}/`)} />
        {#if canvasIsLoading}
          <div class="absolute h-full w-full animate-pulse rounded-lg bg-[#050505]" />
        {/if}
        <canvas bind:this={minecraftAvatar} class="relative !h-full !w-full overflow-hidden rounded-lg bg-[#050505] transition-all duration-[3s]" class:opacity-100={!canvasIsLoading} class:opacity-0={canvasIsLoading} />
        <div class="pointer-events-none absolute inset-0 h-full rounded-lg border-2 border-black border-opacity-50" />
      </div>
    </div>
  </div>
  {#await data.streamed.userMinions then userMinions}
    {#if userMinions.length < 9}
      <Card.Root class="border-2 border-neutral-700 border-opacity-40 bg-[#050505] text-neutral-200">
        <form id="createForm" use:enhance method="POST" action="?/createMinion">
          <Card.Header>
            <Card.Title>Minions</Card.Title>
            <Card.Description>Auction a minion</Card.Description>
          </Card.Header>
          <Card.Content>
            <div class="grid w-full items-center justify-center gap-4">
              <div class="flex gap-4">
                <div>
                  {#await data.streamed.minionTypes then minionType}
                    <MinionsListBox {minionType} />
                  {/await}
                </div>
                <div>
                  <TierListbox />
                </div>
              </div>

              <div class="flex gap-4">
                <div class="mt-1 inline-flex flex-col rounded-md shadow-sm">
                  <Label for="amount" class="block text-base font-normal">Amount of minions</Label>
                  <Input
                    type="number"
                    name="amount"
                    id="amount"
                    max="64"
                    min="1"
                    required
                    class="w-40 ring-offset-0 focus-visible:border-neutral-500 focus-visible:ring-1 focus-visible:ring-neutral-500 focus-visible:ring-offset-0 md:w-44"
                    placeholder="1"
                    on:input={({ currentTarget }) => {
                      if (!(currentTarget instanceof HTMLInputElement)) return;
                      if (currentTarget.valueAsNumber > 64) {
                        currentTarget.value = "64";
                      }
                      if (currentTarget.valueAsNumber < 1) {
                        currentTarget.value = "1";
                      }
                      if (currentTarget.valueAsNumber > 1) {
                        moreThan1 = true;
                      } else {
                        moreThan1 = false;
                      }
                    }}
                    on:keydown={(e) => {
                      if (e.key === "e" || e.key === "." || e.key === "-" || e.key === "+" || e.key === "E" || e.key === " " || e.key === ",") {
                        e.preventDefault();
                      }
                    }}
                    on:paste={(e) => {
                      e.preventDefault();
                    }}
                  />
                </div>
                <div class="mt-1 inline-flex flex-col rounded-md shadow-sm">
                  <Label for="formattedPrice" class="block text-base font-normal">Price <span class="text-xs text-neutral-200/50 opacity-0 transition-opacity duration-500" class:opacity-100={moreThan1}>(each)</span></Label>
                  <input type="hidden" name="price" bind:this={hiddenPrice} />
                  <Input
                    type="text"
                    name="formattedPrice"
                    id="formattedPrice"
                    min="1"
                    max="11"
                    required
                    minlength={1}
                    maxlength={11}
                    class="w-40 ring-offset-0 focus-visible:border-neutral-500 focus-visible:ring-1 focus-visible:ring-neutral-500 focus-visible:ring-offset-0 md:w-44"
                    placeholder="100"
                    on:keydown={(e) => {
                      // check for ctrl + v, cmd + v, ctrl + a, cmd + a, ctrl + x, cmd + x, backspace and delete
                      if ((e.key === "v" && (e.ctrlKey || e.metaKey)) || (e.key === "a" && (e.ctrlKey || e.metaKey)) || (e.key === "x" && (e.ctrlKey || e.metaKey)) || e.key === "Backspace" || e.key === "Delete") {
                        return;
                      }
                      if (isNaN(Number(e.key))) {
                        e.preventDefault();
                      }
                    }}
                    on:paste={(e) => {
                      if (!(e.currentTarget instanceof HTMLInputElement)) return;
                      if (isNaN(Number(e.clipboardData?.getData("text/plain")))) e.preventDefault();
                    }}
                    on:change={({ currentTarget }) => {
                      if (!(currentTarget instanceof HTMLInputElement)) return;
                      if (currentTarget.valueAsNumber <= 0) {
                        currentTarget.value = "1";
                      }
                      hiddenPrice.value = currentTarget.value;
                      currentTarget.value = formatNumber(currentTarget.value);
                    }}
                  />
                </div>
              </div>
              <div>
                <div class="inline-flex flex-col">
                  <Label for="infusion" class="inline-flex text-base font-normal">Mithril Infused</Label>
                  <Switch id="infusion" name="infusion" class="data-[state=checked]:bg-neutral-800 data-[state=unchecked]:bg-neutral-700" />
                </div>
              </div>
            </div>
          </Card.Content>
          <Card.Footer class="justify-end">
            <button type="submit" class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-neutral-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2">Create</button>
          </Card.Footer>
        </form>
      </Card.Root>
    {:else}
      <div class="space-y-8 divide-y divide-neutral-800 rounded-lg border-2 border-neutral-700 border-opacity-40 bg-[#050505] px-6 py-8">
        <div class="space-y-8 divide-y divide-neutral-800">
          <div>You can't have more than 9 minions on the AH. Delete a few in order to make a new one</div>
        </div>
      </div>
    {/if}
  {/await}
</div>

<div class="py-8 max-md:pb-20">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <ul role="list" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#await data.streamed.userMinions}
        {#each Array(9) as _}
          <CardLoading />
        {/each}
      {:then minions}
        {#each minions as seller}
          <MinionCard
            minion={seller}
            on:openDeleteModal={() => {
              showDelete = true;
              // @ts-ignore
              minionToDelete = seller;
            }}
          />
        {/each}
      {/await}
    </ul>
  </div>
</div>

{#if $page.form}
  <AlertDialog.Root open={true} closeOnEscape={true} closeOnOutsideClick={true}>
    <AlertDialog.Content>
      {#if $page.form.status == 200}
        <AlertDialog.Header>
          <AlertDialog.Title>Success</AlertDialog.Title>
          <AlertDialog.Description>{$page.form.body.message}</AlertDialog.Description>
        </AlertDialog.Header>
      {:else if $page.form.status == 400}
        <AlertDialog.Header>
          <AlertDialog.Title>Oops</AlertDialog.Title>
          <AlertDialog.Description>{$page.form.body.error}</AlertDialog.Description>
        </AlertDialog.Header>
      {/if}
      <AlertDialog.Footer>
        <AlertDialog.Cancel>Close</AlertDialog.Cancel>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
{/if}

<AlertDialog.Root bind:open={showDelete} closeOnEscape={true} closeOnOutsideClick={true}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Warning</AlertDialog.Title>
      <AlertDialog.Description>Are you sure you want to delete this minion?</AlertDialog.Description>
      <ul>
        <li>
          <div class="relative list-item divide-y divide-neutral-700 rounded-lg bg-neutral-800 transition-all duration-300" class:group={false} class:hover:bg-neutral-900={false}>
            <div class="flex h-full w-full flex-col items-center justify-center gap-x-6 px-4 py-2">
              <Avatar.Root class="h-12 w-12 flex-shrink-0 rounded-full bg-neutral-700 ">
                <Avatar.Image class="pointer-events-none object-cover p-1" src={`data:image/png;base64,${minionToDelete.minion.texture}`} alt={minionToDelete.minion.name} />
                <Avatar.Fallback class="border-2 border-neutral-600 bg-neutral-700">{minionToDelete.user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
              </Avatar.Root>
              <h3 class="truncate text-sm font-medium text-white">{minionToDelete.minion.name.replace(/ [IVX]+$/, "")}</h3>
            </div>

            <div class="-mt-px flex divide-x divide-neutral-700">
              <div class="relative inline-flex w-0 flex-1 items-center justify-center overflow-hidden rounded-bl-lg text-sm font-medium text-neutral-200">
                <span class="z-10 inline-block flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-neutral-800 transition-transform duration-300 group-hover:scale-125 group-hover:text-neutral-900">{` Tier ${["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][minionToDelete.minion.generator_tier - 1]} (${minionToDelete.minion.generator_tier})`}</span>
                <div class="absolute z-0 h-5 w-20 flex-shrink-0 rounded-[50px] bg-neutral-400 transition-all duration-500 group-hover:h-full group-hover:w-full group-hover:rounded-none" />
              </div>
              <div class="relative -ml-px inline-flex w-0 flex-1 overflow-hidden">
                <span class="relative z-10 inline-flex w-0 flex-1 items-center justify-center overflow-hidden py-4 text-sm font-medium text-neutral-200 transition-all duration-300 group-hover:scale-125 group-hover:text-neutral-900">
                  <img class="pointer-events-none mr-1 h-6 w-6" src="/assets/images/coin.png" alt="Coin icon" />
                  {formatNumber(minionToDelete.price)}
                  {#if minionToDelete.amount ? minionToDelete.amount > 1 : false}
                    <span class="ml-1 text-sm text-neutral-200/50 transition-all duration-300 group-hover:ml-0 group-hover:text-neutral-900/0">/</span>
                    <span class="text-sm text-neutral-200/50 transition-all duration-300 group-hover:-ml-0.5 group-hover:text-neutral-900">each</span>
                  {/if}
                </span>
                <div class="absolute z-0 h-0 w-full flex-shrink-0 bg-neutral-400 transition-all duration-500 group-hover:h-full" />
              </div>
              <div class="relative inline-flex w-0 flex-1 items-center justify-center overflow-hidden rounded-br-lg text-sm font-medium text-neutral-200">
                <span class="z-10 inline-block flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-neutral-800 transition-transform duration-300 group-hover:scale-125 group-hover:text-neutral-900">{` Amount: ${minionToDelete.amount}`}</span>
                <div class="absolute z-0 h-5 w-20 flex-shrink-0 rounded-[50px] bg-neutral-400 transition-all duration-500 group-hover:h-full group-hover:w-full group-hover:rounded-none" />
              </div>
            </div>
          </div>
        </li>
      </ul>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <form action="?/deleteMinion" use:enhance method="POST">
        <input required type="hidden" name="minion" value={minionToDelete?.id} />
        <AlertDialog.Action type="submit">Delete</AlertDialog.Action>
      </form>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
