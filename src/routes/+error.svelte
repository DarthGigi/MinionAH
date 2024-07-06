<script lang="ts">
  import { page } from "$app/stores";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { feedbackIntegration, sendFeedback } from "@sentry/svelte";
  import MoveVertical from "lucide-svelte/icons/move-vertical";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { writable } from "svelte/store";
  import type { LayoutData } from "./$types";

  export let data: LayoutData;

  const bugMessageValue = writable<string>("");

  onMount(() => {
    feedbackIntegration({
      // Additional SDK configuration goes in here, for example:
      colorScheme: "dark",
      showBranding: false,
      showEmail: false,
      showName: false,
      autoInject: false
    });
  });
</script>

<div class="flex h-full w-screen flex-col items-center justify-center">
  <Card.Root class="border-border bg-popover ">
    <Card.Header>
      <Card.Title>Something went wrong</Card.Title>
      <Card.Description>Sorry, something went wrong. Please try again later.</Card.Description>
    </Card.Header>
    <Card.Content>
      <h3 class="mb-2 text-sm">Report this incident to help us improve MinionAH</h3>
      <Label for="message">Description (required)</Label>
      <div class="relative">
        <Textarea id="message" placeholder="What happened? What did you expect?" class="max-h-36 resize-y focus:border-input focus:ring-0 focus:ring-offset-transparent focus-visible:ring-offset-0" bind:value={$bugMessageValue}></Textarea>
        <MoveVertical class="pointer-events-none absolute bottom-1 right-1 size-3 opacity-30" />
      </div>
    </Card.Content>
    <Card.Footer class="flex flex-col gap-2">
      <Button
        type="button"
        class="w-full"
        disabled={!$bugMessageValue}
        on:click={async () => {
          if (!$bugMessageValue) return;
          toast.promise(
            sendFeedback(
              {
                message: $bugMessageValue,
                name: data.user?.username || undefined
              },
              { includeReplay: true }
            ),
            {
              loading: "Sending your bug report",
              success: "Your bug report has been sent",
              error: "Something went wrong trying to send the bug report. Try disabling your adblocker and try again."
            }
          );
          bugMessageValue.set("");
        }}>Send Bug Report</Button>
      <Button href="/" variant="secondary" class="w-full">Go home</Button>
    </Card.Footer>
  </Card.Root>
  <span class="mt-2 text-xs text-muted-foreground">Error: {$page.status} — {$page.error?.message}</span>
</div>
