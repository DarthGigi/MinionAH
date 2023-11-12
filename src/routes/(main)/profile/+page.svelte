<script lang="ts">
  import { enhance } from "$app/forms";
  import { page } from "$app/stores";
  import MinionCard from "$lib/components/Card.svelte";
  import CardLoading from "$lib/components/CardLoading.svelte";
  import MinionCopyButton from "$lib/components/MinionCopyButton.svelte";
  import MinionsListBox from "$lib/components/MinionsListBox.svelte";
  import TierListbox from "$lib/components/TierListbox.svelte";
  import * as Card from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Switch } from "$lib/components/ui/switch";
  import type { User } from "@prisma/client";
  import { Dialog, DialogOverlay, DialogTitle, Transition, TransitionChild } from "@rgossiaux/svelte-headlessui";
  import type { PageData } from "./$types";

  let isOpen = false;

  export let data: PageData;
  $: user = data.user as User;

  let moreThan1 = false;

  let showDelete = false;
  let minionToDelete: string | null = null;
</script>

<div class="mx-auto flex max-w-xl flex-col justify-center gap-8 self-center">
  <div class="w-full pt-8">
    <h3 class="text-lg font-medium leading-6 text-neutral-200">Logged in as</h3>
    <dl class="relative mt-5">
      <MinionCopyButton class="absolute right-3 top-3" on:click={() => navigator.clipboard.writeText(`${window.location.protocol}/${window.location.host}/${user.username}/`)} />

      <div class="group w-full rounded-lg border-2 border-neutral-700 border-opacity-40 bg-[#050505] bg-cover bg-center bg-no-repeat px-4 py-5 shadow sm:p-6" style="background-image: url('https://cdn.discordapp.com/banners/{user.id}/{user.banner}?size=1024'); background-color: {user.accent_color ? '#' + user.accent_color : '#050505'};">
        <dt class="hidden truncate text-sm font-medium text-neutral-400">Profile</dt>
        <dd class="mt-1 text-3xl font-semibold tracking-tight text-neutral-300">
          <img
            src="https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}?size=1024"
            class="inline-block h-10 w-10 rounded-full"
            alt={user.username}
            on:error={({ currentTarget }) => {
              if (!(currentTarget instanceof HTMLImageElement)) return;
              currentTarget.src = `https://cdn.discordapp.com/embed/avatars/${Number(user.id) % 6}.png?size=64`;
            }}
          />
          <br />
          {user.username}
          <br />
          <span class="text-sm font-normal text-neutral-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">Not you? <a href="/logout" class="underline">Logout</a></span>
        </dd>
      </div>
    </dl>
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

              <!-- checkbox -->

              <div class="flex gap-4">
                <div class="mt-1 inline-flex flex-col rounded-md shadow-sm">
                  <Label for="amount" class="block text-base font-normal">Amount of minions</Label>
                  <Input
                    type="number"
                    name="amount"
                    id="amount"
                    max="64"
                    min="1"
                    class="w-44 ring-offset-0 focus-visible:border-neutral-500 focus-visible:ring-1 focus-visible:ring-neutral-500 focus-visible:ring-offset-0"
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
                  <Label for="price" class="block text-base font-normal">Price <span class="text-xs text-neutral-200/50 opacity-0 transition-opacity duration-500" class:opacity-100={moreThan1}>(each)</span></Label>
                  <Input
                    type="number"
                    name="price"
                    id="price"
                    min="1"
                    max="10000000000"
                    class="w-44 ring-offset-0 focus-visible:border-neutral-500 focus-visible:ring-1 focus-visible:ring-neutral-500 focus-visible:ring-offset-0"
                    placeholder="100"
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

<div class="py-8">
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
            on:openDeleteModal={({ detail }) => {
              showDelete = true;
              minionToDelete = detail.minion;
            }}
          />
        {/each}
      {/await}
    </ul>
  </div>
</div>

{#if $page.form}
  {void (isOpen = true) ?? ""}
  {#if $page.form.status == 200}
    <Transition show={isOpen}>
      <Dialog as="div" class="fixed inset-0 z-50 overflow-y-auto" open={isOpen} on:close={() => (isOpen = false)}>
        <div class="min-h-screen px-4 text-center">
          <TransitionChild enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <DialogOverlay class="fixed inset-0 bg-black/50" />
          </TransitionChild>

          <TransitionChild enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <!-- This element is to trick the browser into centering the modal contents. -->
            <span class="inline-block h-screen align-middle" aria-hidden="true"> &#8203; </span>
            <div class="my-8 inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-neutral-700 p-6 text-left align-middle shadow-xl transition-all">
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-white">Success</DialogTitle>
              <div class="mt-2">
                <p class=" text-neutral-200">{$page.form.body.message}</p>
              </div>

              <div class="mt-4">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                  on:click={() => {
                    isOpen = false;
                    $page.form = null;
                  }}
                >
                  Got it, thanks!
                </button>
              </div>
            </div>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  {:else if $page.form.status == 400}
    <Transition show={isOpen}>
      <Dialog as="div" class="fixed inset-0 z-50 overflow-y-auto" open={isOpen} on:close={() => (isOpen = false)}>
        <div class="min-h-screen px-4 text-center">
          <TransitionChild enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <DialogOverlay class="fixed inset-0 bg-black/50" />
          </TransitionChild>

          <TransitionChild enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <!-- This element is to trick the browser into centering the modal contents. -->
            <span class="inline-block h-screen align-middle" aria-hidden="true"> &#8203; </span>
            <div class="my-8 inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-neutral-700 p-6 text-left align-middle shadow-xl transition-all">
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-red-200">Oops</DialogTitle>
              <div class="mt-2">
                <p class=" text-red-400">{$page.form.body.error}</p>
              </div>

              <div class="mt-4">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
                  on:click={() => {
                    isOpen = false;
                    $page.form = null;
                  }}
                >
                  Got it, thanks!
                </button>
              </div>
            </div>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  {/if}
{/if}

<Transition show={showDelete}>
  <Dialog
    as="div"
    class="fixed inset-0 z-50 overflow-y-auto"
    open={showDelete}
    on:close={() => {
      showDelete = false;
      minionToDelete = null;
    }}
  >
    <div class="min-h-screen px-4 text-center">
      <TransitionChild enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
        <DialogOverlay class="fixed inset-0 bg-black/50" />
      </TransitionChild>

      <TransitionChild enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
        <!-- This element is to trick the browser into centering the modal contents. -->
        <span class="inline-block h-screen align-middle" aria-hidden="true"> &#8203; </span>
        <div class="my-8 inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-neutral-700 p-6 text-left align-middle shadow-xl transition-all">
          <DialogTitle as="h3" class="text-lg font-medium leading-6 text-orange-300">Warning</DialogTitle>
          <div class="mt-2">
            <p class=" text-red-200">Are you sure you want to delete this minion?</p>
          </div>

          <div class="mt-4">
            <form action="?/deleteMinion" use:enhance method="POST">
              <input type="hidden" name="minion" value={minionToDelete} />
              <button type="submit" class="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"> Delete </button>
            </form>
          </div>
        </div>
      </TransitionChild>
    </div>
  </Dialog>
</Transition>
