<script lang="ts">
  import { enhance } from "$app/forms";
  import { page } from "$app/stores";
  import Card from "$lib/components/Card.svelte";
  import CardLoading from "$lib/components/CardLoading.svelte";
  import MinionsListbox from "$lib/components/MinionsListbox.svelte";
  import TierListbox from "$lib/components/TierListbox.svelte";
  import type { User } from "@prisma/client";
  import { Dialog, DialogOverlay, DialogTitle, Transition, TransitionChild } from "@rgossiaux/svelte-headlessui";
  import type { PageData } from "./$types";

  let isOpen = false;

  export let data: PageData;
  $: user = data.user as User;

  let showDelete = false;
  let minionToDelete: string;
</script>

<div class="mx-auto flex max-w-xl flex-col justify-center gap-8 self-center">
  <div class="w-full pt-8">
    <h3 class="text-lg font-medium leading-6 text-neutral-200">Logged in as</h3>
    <dl class="mt-5">
      <div class="group w-full rounded-lg border-2 border-neutral-700 border-opacity-40 bg-[#050505] bg-cover bg-center bg-no-repeat px-4 py-5 shadow sm:p-6" style="background-image: url('https://cdn.discordapp.com/banners/{user.id}/{user.banner}?size=1024'); background-color: {user.accent_color ? '#' + user.accent_color : '#050505'};">
        <dt class="hidden truncate text-sm font-medium text-neutral-400">Profile</dt>
        <dd class="mt-1 text-3xl font-semibold tracking-tight text-neutral-300">
          <img src="https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}?size=1024" class="inline-block h-10 w-10 rounded-full" alt="User Avatar" />
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
      <form id="createForm" use:enhance method="POST" action="?/createMinion" class="space-y-8 divide-y divide-neutral-800 rounded-lg border-2 border-neutral-700 border-opacity-40 bg-[#050505] px-6 py-8">
        <div class="space-y-8 divide-y divide-neutral-800">
          <div>
            <div>
              <h3 class="text-lg font-medium leading-6 text-neutral-200">Minions</h3>
              <p class="mt-1 text-sm text-neutral-400">Put a minion in the AH</p>
            </div>

            <div class="mt-6">
              <div class="flex gap-4 sm:col-span-4">
                <div class="mt-1 flex rounded-md shadow-sm">
                  {#await data.streamed.minionTypes then minionType}
                    <!-- promise was fulfilled -->
                    <MinionsListbox {minionType} />
                  {/await}
                </div>
                <div class="mt-1 flex flex-col rounded-md shadow-sm">
                  <TierListbox />
                </div>
                <div class="mt-1 flex flex-col rounded-md justify-center shadow-sm">
                  <!-- checkbox -->
                  <div class="flex h-5 items-center">
                    <input id="infusion" name="infusion" type="checkbox" class="h-4 w-4 rounded border-gray-300 focus:checked:bg-neutral-700 hover:checked:bg-neutral-700 checked:bg-neutral-600 ring-0 focus:ring-neutral-700" />
                    <label for="infusion" class="font-medium ml-1 text-neutral-200">Mithril Infused</label>
                  </div>
                </div>
              </div>

              <div class="flex gap-4 sm:col-span-4">
                <div class="mt-1 flex flex-col rounded-md shadow-sm">
                  <label for="amount" class="block font-medium text-neutral-200">Amount of minions</label>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    max="64"
                    min="1"
                    class="block h-9 w-full rounded-md border-neutral-300 bg-black placeholder-neutral-500 shadow-sm focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
                    placeholder="1"
                    on:input={(e) => {
                      if (e.target.valueAsNumber > 64) {
                        e.target.value = "64";
                      }
                      if (e.target.valueAsNumber < 1) {
                        e.target.value = "1";
                      }
                    }}
                  />
                </div>
                <div class="mt-1 flex flex-col rounded-md shadow-sm">
                  <label for="price" class="block font-medium text-neutral-200">Price <span class="text-xs text-neutral-200/50">(each)</span></label>
                  <input
                    type="number"
                    min="1"
                    max="10000000000"
                    name="price"
                    id="price"
                    class="block h-9 w-full rounded-md border-neutral-300 bg-black placeholder-neutral-500 shadow-sm invalid:border-red-500 focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
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
            </div>
          </div>
        </div>

        <div class="pt-5">
          <div class="flex justify-end">
            <button type="submit" class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-neutral-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2">Create</button>
          </div>
        </div>
      </form>
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
          <Card
            {seller}
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
  {(isOpen = true)}
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
