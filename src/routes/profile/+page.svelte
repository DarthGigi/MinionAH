<script lang="ts">
  import type { PageData } from "./$types";
  import type { AuthUser } from "@prisma/client";
  import MinionsListbox from "$lib/components/MinionsListbox.svelte";
  import TierListbox from "$lib/components/TierListbox.svelte";
  import { enhance } from "$app/forms";

  export let data: PageData;
  $: user = data.user as AuthUser;
</script>

<div class=" flex w-full justify-center">
  <div class="flex max-w-2xl flex-col gap-8">
    <div class="w-96 pt-8">
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

    <form id="createForm" use:enhance method="POST" action="?/createMinion" class="space-y-8 divide-y divide-neutral-800 rounded-lg border-2 border-neutral-700 border-opacity-40 bg-[#050505] px-2 py-8">
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
                <label for="price" class="block font-medium text-neutral-200">Price</label>
                <input
                  type="text"
                  name="price"
                  id="price"
                  class="block h-9 w-full rounded-md border-neutral-300 bg-black placeholder-neutral-500 shadow-sm invalid:border-red-500 focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
                  placeholder="1"
                  on:input={(e) => {
                    const lastChar = e.target.value.slice(-1);
                    const rest = e.target.value.slice(0, -1);

                    if (lastChar === "k" || lastChar === "m") {
                      if (isNaN(Number(rest)) || rest === "") {
                        e.target.classList.add("!border-red-500");
                        e.target.labels[0].innerText = "Not a valid number";
                        e.target.labels[0].classList.add("!text-red-500");
                        e.target.invalid = true;
                      } else {
                        e.target.classList.remove("!border-red-500");
                        e.target.labels[0].innerText = "Price";
                        e.target.labels[0].classList.remove("!text-red-500");
                        e.target.invalid = false;
                      }
                    } else {
                      if (isNaN(Number(e.target.value)) || e.target.value === "") {
                        e.target.classList.add("!border-red-500");
                        e.target.labels[0].innerText = "Not a valid number";
                        e.target.labels[0].classList.add("!text-red-500");
                        e.target.invalid = true;
                      } else {
                        e.target.classList.remove("!border-red-500");
                        e.target.labels[0].innerText = "Price";
                        e.target.labels[0].classList.remove("!text-red-500");
                        e.target.invalid = false;
                      }
                    }
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
  </div>
</div>
