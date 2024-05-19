<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import LoaderCircle from "lucide-svelte/icons/loader-circle";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";

  const code = $page.url.searchParams.get("code");
  const state = $page.url.searchParams.get("state");
  const timePassed = writable<number>(0);

  const interval = setInterval(() => {
    timePassed.update((value) => value + 1);
    if ($timePassed === 10) {
      clearInterval(interval);
    }
  }, 1000);

  onMount(async () => {
    if (code && state) {
      const response = await fetch("/api/oauth/minecraft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code, state })
      });

      if (response.ok && response.redirected) {
        await goto(response.url, {
          replaceState: true,
          invalidateAll: true
        });
        timePassed.set(20);
      } else {
        clearInterval(interval);
        timePassed.set(10);
      }
    }
  });
</script>

<div class="mx-auto mt-4 w-full max-w-md px-4">
  <Card.Root class="border-border bg-popover">
    <Card.Header>
      <Card.Title>Creating your account</Card.Title>
      <Card.Description>
        {#if $timePassed >= 10}
          All done!
        {:else if $timePassed >= 10}
          Something went wrong. Please try again.
        {:else if $timePassed >= 5}
          This is taking longer than expected...
        {:else if $timePassed >= 3}
          We're almost done...
        {:else}
          Just a moment...
        {/if}
      </Card.Description>
    </Card.Header>
    <Card.Content>
      {#if $timePassed >= 20}
        <Button href="/profile" class="w-full">Go to Profile</Button>
      {:else if $timePassed >= 10}
        <Button href="/" class="w-full">Go Home</Button>
      {:else}
        <LoaderCircle class="mx-auto size-10 animate-spin" />
      {/if}
    </Card.Content>
  </Card.Root>
</div>
