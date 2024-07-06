<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Drawer from "$lib/components/ui/drawer";
  import { Label } from "$lib/components/ui/label";
  import * as Popover from "$lib/components/ui/popover";
  import { Textarea } from "$lib/components/ui/textarea";
  import { feedbackIntegration, sendFeedback } from "@sentry/svelte";
  import Bug from "lucide-svelte/icons/bug";
  import MoveVertical from "lucide-svelte/icons/move-vertical";
  import { onMount } from "svelte";
  import { mediaQuery } from "svelte-legos";
  import { toast } from "svelte-sonner";
  import { writable } from "svelte/store";
  import type { LayoutData } from "./$types";

  export let data: LayoutData;

  const bugMessageValue = writable<string>("");
  const bugReportOpen = writable(false);

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

  const isMobile = mediaQuery("(max-width: 640px)");
</script>

{#if $isMobile}
  <Drawer.Root bind:open={$bugReportOpen} openFocus="data-dialog-close" shouldScaleBackground={true}>
    <Drawer.Trigger class="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-0 z-50 translate-x-1/2 -rotate-90 rounded-full border border-input bg-background p-2 text-muted-foreground transition-all duration-300 hover:translate-x-0 hover:rotate-0 hover:bg-accent hover:text-accent-foreground data-[open=true]:translate-x-0 data-[open=true]:rotate-0 data-[open=true]:bg-accent data-[open=true]:text-accent-foreground" data-open={$bugReportOpen}>
      <Bug class="size-4" />
    </Drawer.Trigger>
    <Drawer.Content class="border-border bg-popover">
      <Drawer.Header>
        <Drawer.Title>Report a Bug</Drawer.Title>
        <Drawer.Description>Report a bug to help us improve MinionAH</Drawer.Description>
      </Drawer.Header>
      <div class="px-4">
        <Label for="message">Description (required)</Label>
        <Textarea id="message" placeholder="What's the bug? What did you expect?" class="max-h-36 resize-y focus:border-input focus:ring-0 focus:ring-offset-transparent focus-visible:ring-offset-0" data-vaul-no-drag bind:value={$bugMessageValue} autofocus={false}></Textarea>
      </div>
      <Drawer.Footer>
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
            bugReportOpen.set(false);
            bugMessageValue.set("");
          }}>Send Bug Report</Button>
        <Drawer.Close data-cancel-button>Cancel</Drawer.Close>
      </Drawer.Footer>
    </Drawer.Content>
  </Drawer.Root>
{:else}
  <Popover.Root bind:open={$bugReportOpen} openFocus="[data-cancel-button]">
    <Popover.Trigger class="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-0 z-[9999999999] translate-x-1/2 -rotate-90 rounded-full border border-input bg-background p-2 text-muted-foreground transition-all duration-300 hover:translate-x-0 hover:rotate-0 hover:bg-accent hover:text-accent-foreground data-[open=true]:translate-x-0 data-[open=true]:rotate-0 data-[open=true]:bg-accent data-[open=true]:text-accent-foreground" data-open={$bugReportOpen}>
      <Bug class="size-4" />
    </Popover.Trigger>
    <Popover.Content side="top" sideOffset={4} align="end" alignOffset={4} class="z-[9999999999] w-full max-w-96 rounded-lg border border-border shadow-sm ">
      <Card.Root class="rounded-none border-none bg-transparent text-card-foreground">
        <Card.Header>
          <Card.Title>Report a Bug</Card.Title>
          <Card.Description>Report a bug to help us improve MinionAH</Card.Description>
        </Card.Header>
        <Card.Content>
          <Label for="message">Description (required)</Label>
          <div class="relative">
            <Textarea id="message" placeholder="What's the bug? What did you expect?" class="max-h-36 resize-y focus:border-input focus:ring-0 focus:ring-offset-transparent focus-visible:ring-offset-0" bind:value={$bugMessageValue}></Textarea>
            <MoveVertical class="pointer-events-none absolute bottom-1 right-1 size-3 opacity-30" />
          </div>
        </Card.Content>
        <Card.Footer class="flex-col gap-4">
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
              bugReportOpen.set(false);
              bugMessageValue.set("");
            }}>Send Bug Report</Button>
          <Button
            type="button"
            variant="secondary"
            class="w-full"
            data-cancel-button
            on:click={() => {
              bugReportOpen.set(false);
              bugMessageValue.set("");
            }}>Cancel</Button>
        </Card.Footer>
      </Card.Root>
    </Popover.Content>
  </Popover.Root>
{/if}
