<script lang="ts">
  import * as Tabs from "$lib/components/ui/tabs";
  import { cubicInOut } from "svelte/easing";
  import { writable } from "svelte/store";
  import { crossfade } from "svelte/transition";
  import type { PageData } from "./$types";
  import LoginForm from "./login-form.svelte";
  import SignupForm from "./signup-form.svelte";

  export let data: PageData;

  const value = writable<"login" | "sign-up">("login");

  const tabs = [
    { title: "Login", value: "login" },
    { title: "Sign Up", value: "sign-up" }
  ];

  const handleSignUpButtonClick = () => {
    value.set("sign-up");
  };

  const handleSignInButtonClick = () => {
    value.set("login");
  };

  const [send, receive] = crossfade({
    duration: 300,
    easing: cubicInOut
  });
</script>

<Tabs.Root bind:value={$value} class="mx-auto w-full max-w-md px-4">
  <Tabs.List class="grid w-full grid-cols-2 gap-4">
    {#each tabs as tab}
      {@const isActive = $value === tab.value}
      <Tabs.Trigger value={tab.value} class="relative data-[state=active]:bg-transparent" data-sveltekit-noscroll>
        {#if isActive}
          <div class="absolute inset-0 rounded-md bg-accent" in:send={{ key: "active-tab" }} out:receive={{ key: "active-tab" }} />
        {/if}
        <div class="relative">
          {tab.title}
        </div>
      </Tabs.Trigger>
    {/each}
  </Tabs.List>
  <Tabs.Content value="login">
    <LoginForm data={data.form} on:signup={handleSignUpButtonClick} />
  </Tabs.Content>
  <Tabs.Content value="sign-up">
    <SignupForm on:signin={handleSignInButtonClick} />
  </Tabs.Content>
</Tabs.Root>
