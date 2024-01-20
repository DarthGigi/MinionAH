<script lang="ts">
  import { page } from "$app/stores";
  import CardLoading from "$lib/components/CardLoading.svelte";
  import CopyButton from "$lib/components/CopyButton.svelte";
  import MinionsListBox from "$lib/components/MinionsListBox.svelte";
  import TierListbox from "$lib/components/TierListbox.svelte";
  import MinionCard from "$lib/components/card/cardminion.svelte";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Form from "$lib/components/ui/form";
  import { Label } from "$lib/components/ui/label";
  import { formatNumber } from "$lib/utilities";
  import type { Minion, MinionSeller as Seller, User } from "@prisma/client";
  import { ChevronsUpDown, Loader2 } from "lucide-svelte";
  import { parse } from "numerable";
  import * as skinview3d from "skinview3d";
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import type { PageData } from "./$types";
  import { formSchemaCreate, formSchemaDelete } from "./schema";
  export let data: PageData;
  let moreThan1 = false;

  let submittingCreate = false;
  let submittingDelete = false;
  let showFormStatusDialog = false;

  let showDeleteFormDialog = false;
  let minionToDelete: Seller & { minion: Minion } & { user: User };

  let minecraftAvatar: HTMLCanvasElement;
  let minecraftAvatarContainer: HTMLDivElement;

  let canvasIsLoading = true;

  let maxtier: number = 12;

  let tierListDisabled = true;

  let priceValue: number;

  onMount(async () => {
    const minecraftAvatarContainerDimensions = minecraftAvatarContainer.getBoundingClientRect();
    const viewer = new skinview3d.SkinViewer({
      canvas: minecraftAvatar,
      width: minecraftAvatarContainerDimensions.width,
      height: minecraftAvatarContainerDimensions.height,
      skin: `data:image/png;base64,${data.user!.skin}`,
      [data.user!.cape ? "cape" : ""]: `data:image/png;base64,${data.user!.cape}`,
      enableControls: true,
      animation: new skinview3d.IdleAnimation(),
      nameTag: data.user!.username,
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
        <div class="absolute right-3 top-3 z-30 flex flex-col gap-2">
          <CopyButton on:click={() => navigator.clipboard.writeText(`${window.location.origin}/${data.user?.username}`)} />
        </div>
        {#if canvasIsLoading}
          <div class="absolute h-full w-full animate-pulse rounded-lg bg-background" />
        {/if}
        <canvas bind:this={minecraftAvatar} class="relative !h-full !w-full overflow-hidden rounded-lg bg-background transition-all duration-[3s]" class:opacity-100={!canvasIsLoading} class:opacity-0={canvasIsLoading} />
      </div>
    </div>
  </div>
  {#await data.streamed.userMinions}
    <div class="h-[28.75rem] animate-pulse rounded-lg border-0 bg-background shadow-sm"></div>
  {:then userMinions}
    {#if userMinions.length < 9}
      <Form.Root
        options={{
          resetForm: true,
          onSubmit: () => {
            submittingCreate = true;
          },
          onUpdated: () => {
            submittingCreate = false;
            showFormStatusDialog = true;
          },
          onError: () => {
            submittingCreate = false;
            showFormStatusDialog = true;
          }
        }}
        form={data.formCreate}
        schema={formSchemaCreate}
        method="POST"
        action="?/createMinion"
        class="space-y-6"
        let:config>
        <Card.Root class="border-0 bg-background text-primary">
          <Card.Header>
            <Card.Title>Minions</Card.Title>
            <Card.Description>Auction a minion</Card.Description>
          </Card.Header>
          <Card.Content>
            <div class="flex w-full flex-col items-center justify-center gap-4">
              <div class="mx-auto flex flex-col gap-4">
                <div class="flex gap-4">
                  {#await data.streamed.minionTypes}
                    <div class="flex flex-col space-y-2">
                      <Label>Minion</Label>
                      <Button variant="outline" role="combobox" type="button" class="relative w-40 cursor-default justify-between rounded-md border-none bg-accent py-1.5 pl-3 text-left text-muted-foreground shadow-sm ring-1 ring-inset ring-transparent hover:bg-accent hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring sm:text-sm sm:leading-6 md:w-44">
                        <span>Loading...</span>
                        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </div>
                  {:then minionTypes}
                    <MinionsListBox
                      {config}
                      on:onSelect={({ detail }) => {
                        maxtier = detail;
                        if (detail > 0 && detail <= 12) tierListDisabled = false;
                      }}
                      minionType={minionTypes} />
                  {/await}
                  {#key maxtier}
                    <TierListbox {config} bind:disabled={tierListDisabled} bind:maxtier />
                  {/key}
                </div>
                <div class="flex gap-4">
                  <div class="mt-1 inline-flex flex-col rounded-md">
                    <Form.Field {config} name="amount" let:setValue>
                      <Form.Item class="flex w-40 flex-col md:w-44">
                        <Form.Label>Amount</Form.Label>
                        <Form.Input
                          type="number"
                          class="ring-offset-0 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
                          placeholder="Amount of minions"
                          max={64}
                          min={1}
                          on:input={({ currentTarget }) => {
                            if (!(currentTarget instanceof HTMLInputElement)) return;
                            if (currentTarget.valueAsNumber > 1) {
                              moreThan1 = true;
                            } else {
                              moreThan1 = false;
                            }
                            if (currentTarget.valueAsNumber > 64) {
                              currentTarget.value = "64";
                              setValue(currentTarget.valueAsNumber);
                            } else if (currentTarget.valueAsNumber < 1) {
                              currentTarget.value = "1";
                              setValue(currentTarget.valueAsNumber);
                            }
                          }}
                          on:keydown={(e) => {
                            if (e.key === "e" || e.key === "." || e.key === "-" || e.key === "+" || e.key === "E" || e.key === " " || e.key === ",") {
                              e.preventDefault();
                            }
                          }}
                          on:paste={(e) => {
                            e.preventDefault();
                          }} />
                        <Form.Validation />
                      </Form.Item>
                    </Form.Field>
                  </div>
                  <div class="mt-1 inline-flex flex-col rounded-md">
                    <Form.Field {config} name="price" let:setValue let:value>
                      <Form.Item class="flex w-40 flex-col md:w-44">
                        <Form.Label>Price <span class="inline text-neutral-200/50 opacity-0 transition-opacity duration-500" class:opacity-100={moreThan1}>(each)</span></Form.Label>
                        <Form.Input
                          type="text"
                          class="w-40 ring-offset-0 focus-visible:border-neutral-500 focus-visible:ring-1 focus-visible:ring-neutral-500 focus-visible:ring-offset-0 md:w-44"
                          placeholder={moreThan1 ? "Price of each minion" : "Price of minion"}
                          on:keydown={(e) => {
                            // check for ctrl + v, cmd + v, ctrl + a, cmd + a, ctrl + x, cmd + x, backspace and delete
                            if ((e.key === "v" && (e.ctrlKey || e.metaKey)) || (e.key === "a" && (e.ctrlKey || e.metaKey)) || (e.key === "x" && (e.ctrlKey || e.metaKey)) || e.key === "Backspace" || e.key === "Delete") {
                              return;
                            }
                            // check for k, m, b, t
                            if (e.key === "k" || e.key === "m" || e.key === "b" || e.key === "t") {
                              e.preventDefault();
                              if (isNaN(Number(e.currentTarget.value))) {
                                return;
                              }
                              let value = Number(e.currentTarget.value);
                              switch (e.key) {
                                case "k":
                                  value *= 1000;
                                  break;
                                case "m":
                                  value *= 1000000;
                                  break;
                                case "b":
                                  value *= 1000000000;
                                  break;
                                case "t":
                                  value *= 1000000000000;
                                  break;
                              }
                              if (value > 9999999999999) {
                                return;
                              }
                              setValue(value);
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
                            if (Number(currentTarget.value) <= 0) {
                              currentTarget.value = "1";
                              setValue(currentTarget.value);
                            }
                            setValue(currentTarget.value);
                            priceValue = Number(currentTarget.value);
                          }} />

                        {#if priceValue}
                          {#if Number(value) >= 1000}
                            <div transition:slide|global={{ axis: "y" }}>
                              <Form.Description>{parse(value)} = {formatNumber(value)}</Form.Description>
                            </div>
                          {/if}
                        {/if}

                        <Form.Validation />
                      </Form.Item>
                    </Form.Field>
                  </div>
                </div>
              </div>
              <div class="flex gap-4">
                <Form.Field {config} name="infusion">
                  <Form.Item class="flex flex-row items-center justify-between gap-6 rounded-lg bg-muted p-4">
                    <div class="select-none space-y-0.5">
                      <Form.Label>Mithril Infused</Form.Label>
                      <Form.Description><a href="https://hypixel-skyblock.fandom.com/wiki/Mithril_Infusion" target="_blank" class="underline underline-offset-2">Mithril Infusion</a> is a minion upgrade which <br /> increases a minion's speed by 10% permanently.</Form.Description>
                    </div>
                    <Form.Switch />
                  </Form.Item>
                </Form.Field>
              </div>
            </div>
          </Card.Content>
          <Card.Footer class="justify-end">
            <Form.Button disabled={submittingCreate}>
              {#if !submittingCreate}
                Create
              {:else}
                <Loader2 class="h-4 w-4 animate-spin" />
              {/if}
            </Form.Button>
          </Card.Footer>
        </Card.Root>
      </Form.Root>
    {:else}
      <div class="space-y-8 divide-y divide-secondary rounded-lg bg-background px-6 py-8 text-primary">
        <div class="space-y-8 divide-y divide-secondary">
          <div>You can't have more than 9 minions on the AH. Delete a few in order to make a new one</div>
        </div>
      </div>
    {/if}
  {/await}
</div>

<div class="py-8 max-md:pb-20">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <ul role="list" class="grid grid-cols-1 justify-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#await data.streamed.userMinions}
        {#each Array(9) as _}
          <CardLoading />
        {/each}
      {:then minions}
        {#each minions as seller}
          <MinionCard
            minion={seller}
            on:openDeleteModal={() => {
              showDeleteFormDialog = true;
              minionToDelete = seller;
            }}
            class="only:col-start-2" />
        {/each}
      {/await}
    </ul>
  </div>
</div>

<Form.Root
  options={{
    onSubmit: () => {
      submittingDelete = true;
    },
    onResult: () => {
      showDeleteFormDialog = false;
    },
    onUpdated: () => {
      showFormStatusDialog = true;
    },
    onError: () => {
      showFormStatusDialog = true;
    }
  }}
  form={data.formDelete}
  schema={formSchemaDelete}
  let:config
  action="?/deleteMinion"
  class="hidden"
  method="POST"
  id="deleteForm">
  <Form.Field {config} name="id">
    <Form.Input type="hidden" value={minionToDelete?.id} />
  </Form.Field>
</Form.Root>

<AlertDialog.Root bind:open={showFormStatusDialog}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      {#if $page.form && $page.form.form && $page.form.form.message}
        <AlertDialog.Title>
          {$page.form.form.message.title}
        </AlertDialog.Title>
        <AlertDialog.Description>
          {@html $page.form.form.message.description}
        </AlertDialog.Description>
      {/if}
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Close</AlertDialog.Cancel>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>

<AlertDialog.Root bind:open={showDeleteFormDialog} closeOnEscape={!submittingDelete} closeOnOutsideClick={!submittingDelete}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Warning</AlertDialog.Title>
      <AlertDialog.Description>Are you sure you want to delete this minion?</AlertDialog.Description>
      <ul>
        <MinionCard minion={minionToDelete} showButtons={false} />
      </ul>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel class="transition-all duration-300" disabled={submittingDelete}>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action
        class="transition-all duration-300"
        disabled={submittingDelete}
        on:click={(e) => {
          e.preventDefault();
          const deleteForm = document.getElementById("deleteForm");
          if (!(deleteForm instanceof HTMLFormElement)) return;
          deleteForm.requestSubmit();
        }}>
        {#if !submittingDelete}
          Delete
        {:else}
          <Loader2 class="h-4 w-4 animate-spin" />
        {/if}
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
