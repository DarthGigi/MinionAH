<script lang="ts" context="module">
  import { z } from "zod";
  export const notificationsFormSchema = z.object({
    type: z
      .enum(["ALL", "DEVICE", "EMAIL", "NONE"], {
        required_error: "You need to select a notification type."
      })
      .default("NONE"),
    social_notifications: z.boolean().default(false).optional(),
    marketing_notifications: z.boolean().default(false).optional(),
    fcmToken: z.string().optional()
  });
  type NotificationFormSchema = typeof notificationsFormSchema;
</script>

<script lang="ts">
  import { page } from "$app/stores";
  import { PUBLIC_VAPID_KEY } from "$env/static/public";
  import * as Alert from "$lib/components/ui/alert";
  import { Button } from "$lib/components/ui/button";
  import * as Drawer from "$lib/components/ui/drawer";
  import * as Form from "$lib/components/ui/form";
  import * as RadioGroup from "$lib/components/ui/radio-group";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { Switch } from "$lib/components/ui/switch";
  import { internalStorage } from "$lib/stores/preferences";
  import { requestNotificationPermission } from "$lib/utilities";
  import { getMessaging, getToken } from "firebase/messaging";
  import LoaderCircle from "lucide-svelte/icons/loader-circle";
  import Share from "lucide-svelte/icons/share";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { derived, readable, writable } from "svelte/store";
  import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";

  export let data: SuperValidated<Infer<NotificationFormSchema>>;

  const form = superForm(data, {
    validators: zodClient(notificationsFormSchema),
    dataType: "json",
    resetForm: false,
    timeoutMs: 2000
  });

  const { form: formData, enhance, tainted, isTainted, submitting, timeout, submit } = form;

  const isiOS = writable(false);
  const iOSCanInstall = writable(false);
  const iOSIsInstalled = writable(false);
  const registering = writable(false);

  const showInstallInstructions = writable(false);

  const deviceRadioDisabled = writable(false);

  const permission = writable<NotificationPermission | undefined>();
  const hasEmail = readable($page.data.userData.settings?.profileSettings?.email ? true : false);
  const allRadioDisabled = derived([deviceRadioDisabled, hasEmail, iOSIsInstalled], ([$deviceRadioDisabled, $hasEmail, $iOSIsInstalled]) => {
    return $deviceRadioDisabled || !$hasEmail || ($isiOS && !$iOSIsInstalled);
  });
  const toastLoading = writable<number | string>();

  const handleRequestPermission = async (request: boolean = false) => {
    permission.set(await requestNotificationPermission(request));
    if ($permission === "granted") {
      const token = await getToken(getMessaging(), {
        vapidKey: PUBLIC_VAPID_KEY,
        serviceWorkerRegistration: await navigator.serviceWorker.ready
      });
      internalStorage.update((state) => ({ ...state, fcmToken: token }));
      deviceRadioDisabled.set(false);
    } else if ($permission === "denied" || $permission === "default" || $permission === undefined) {
      deviceRadioDisabled.set(true);
    }
  };

  timeout.subscribe((value) => {
    if (value) {
      toast.loading("It's taking longer than expected to update your notification preferences...", {
        id: $toastLoading,
        duration: Number.POSITIVE_INFINITY
      });
    }
  });

  onMount(async () => {
    // @ts-expect-error - userAgentData is not yet in the TS types
    isiOS.set(window.navigator?.userAgentData ? window.navigator.userAgentData?.platform === "iOS" : navigator.platform === "iPhone" || navigator.platform === "iPad");

    if ($isiOS && "standalone" in window.navigator) {
      iOSCanInstall.set(true);
      iOSIsInstalled.set(window.navigator.standalone === true);
    }

    if ($isiOS && $iOSIsInstalled) {
      await handleRequestPermission();
    } else if (!$isiOS) {
      await handleRequestPermission();
    }
  });
</script>

<Alert.Root class="border-accent bg-accent/20  text-accent-foreground/80">
  <Alert.Description class="text-pretty">
    The device notifications feature is in
    <span class="rounded-full border border-accent bg-accent/20 px-2 py-0.5 text-accent-foreground/80">Beta</span>. You may experience issues with notifications. If you do, try using the email notifications option instead.
  </Alert.Description>
</Alert.Root>
<form
  method="POST"
  class="space-y-8"
  use:enhance={{
    onSubmit: async ({ cancel }) => {
      $toastLoading = toast.loading("Updating your notification preferences...");
      if ($internalStorage.fcmToken && $formData.type !== "NONE" && $formData.type !== "EMAIL") {
        formData.update((state) => ({ ...state, fcmToken: $internalStorage.fcmToken }));
      } else if (!$internalStorage.fcmToken && $formData.type !== "NONE" && $formData.type !== "EMAIL") {
        $toastLoading = toast.error("Failed to update your notification preferences. Please refresh the page and try again.");
        cancel();
      }
    },
    onUpdate: async ({ result }) => {
      if (result.type === "success") {
        toast.success("Your notification preferences have been updated successfully.", { id: "updateToast" });
      } else {
        toast.error("Failed to update your notification preferences.", { id: "updateToast" });
      }
      toast.dismiss($toastLoading);
    },
    onError: async () => {
      toast.error("Something went wrong trying to update your notification preferences.");
      toast.dismiss($toastLoading);
    }
  }}>
  <Form.Fieldset {form} name="type" disabled={$registering}>
    <Form.Legend>Notify me via...</Form.Legend>
    <RadioGroup.Root class="flex flex-col space-y-1" bind:value={$formData.type}>
      <div class="flex items-center space-x-4">
        <Form.Control let:attrs>
          <RadioGroup.Item disabled={$allRadioDisabled} value="ALL" {...attrs} />
          <Form.Label class="flex flex-col font-normal">
            <span class="flex items-center gap-1.5 text-base">
              Device & Email
              <span class="rounded-full border border-accent bg-accent/20 px-2 py-0.5 text-xs text-accent-foreground/80">Beta</span>
            </span>
            <span class="text-sm text-muted-foreground">Receive notifications on your device and via email.</span>
            {#if $permission === "denied" || $permission === "default"}
              <span class="text-sm font-semibold text-muted-foreground">You need to allow notifications to receive them.</span>
            {/if}
            {#if !$hasEmail}
              <span class="text-sm font-semibold text-muted-foreground">You need to add an email to receive email notifications. You can do this in your <a href="/profile/settings" class="underline">profile settings</a>.</span>
            {/if}
          </Form.Label>
        </Form.Control>
      </div>
      <div class="flex items-center space-x-4">
        <Form.Control let:attrs>
          <RadioGroup.Item disabled={!$hasEmail} value="EMAIL" {...attrs} />
          <Form.Label class="flex flex-col font-normal">
            <span class="text-base">Email</span>
            <span class="text-sm text-muted-foreground">Receive notifications via email only.</span>
            {#if !$hasEmail}
              <span class="text-sm font-semibold text-muted-foreground">You need to add an email to receive email notifications. You can do this in your <a href="/profile/settings" class="underline">profile settings</a>.</span>
            {/if}
          </Form.Label>
        </Form.Control>
      </div>
      <div class="flex items-center space-x-4">
        <Form.Control let:attrs>
          <RadioGroup.Item value="DEVICE" disabled={$deviceRadioDisabled || ($isiOS && !$iOSIsInstalled)} {...attrs} />
          <Form.Label class="flex flex-col font-normal">
            <span class="flex items-center gap-1.5 text-base">
              Device
              <span class="rounded-full border border-accent bg-accent/20 px-2 py-0.5 text-xs text-accent-foreground/80">Beta</span>
            </span>
            <span class="text-sm text-muted-foreground">Receive notifications on your device only.</span>
            {#if $permission === "denied" || $permission === "default"}
              <span class="text-sm font-semibold text-muted-foreground">You need to allow notifications to receive them.</span>
            {/if}
          </Form.Label>
        </Form.Control>
      </div>
      <div class="flex items-center space-x-4">
        <Form.Control let:attrs>
          <RadioGroup.Item value="NONE" {...attrs} />
          <Form.Label class="flex flex-col font-normal">
            <span class="text-base">None</span>
            <span class="text-sm text-muted-foreground">Don't receive any notifications.</span>
          </Form.Label>
        </Form.Control>
      </div>
    </RadioGroup.Root>
  </Form.Fieldset>

  {#if $isiOS && !$iOSIsInstalled}
    <div class="flex flex-col">
      <Button class="w-fit" variant="outline" on:click={() => showInstallInstructions.set(true)}>Install MinionAH</Button>
      <p class="text-sm text-red-500">On iOS devices, you need to install MinionAH first in order to receive notifications.</p>
    </div>
  {:else if $permission === "denied" || $permission === "default"}
    <div class="flex flex-col">
      {#if $permission === "default"}
        <Button
          class="w-fit"
          variant="outline"
          disabled={$submitting || $registering}
          on:click={async () => {
            registering.set(true);
            await handleRequestPermission(true);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - TypeScript doesn't know that the permission has been set
            if ($permission === "granted" && $internalStorage.fcmToken) {
              submit();
            }
            registering.set(false);
          }}>
          {#if $submitting || $registering}
            <LoaderCircle class="size-4 animate-spin" />
          {:else}
            Receive notifications on this device
          {/if}
        </Button>

        <p class="text-sm text-muted-foreground">You need to allow notifications to receive them.</p>
      {/if}
      {#if $permission === "denied"}
        <p class="text-sm text-red-500">You have denied notifications. Please allow them in your {$isiOS ? "device settings" : "browser settings"} to receive notifications.</p>
      {/if}
    </div>
  {/if}

  <div class="space-y-4">
    <Form.Field {form} name="marketing_notifications">
      <Form.Legend>Send me...</Form.Legend>
      <Form.Control let:attrs>
        <div class="flex flex-row items-center justify-between rounded-lg border border-border p-4">
          <div class="space-y-0.5">
            <Form.Label class="text-base">Marketing notifications</Form.Label>
            <Form.Description>Receive notifications about new features, news, and more.</Form.Description>
          </div>
          <Switch includeInput {...attrs} bind:checked={$formData.marketing_notifications} />
        </div>
      </Form.Control>
    </Form.Field>
    <Form.Field {form} name="social_notifications">
      <Form.Control let:attrs>
        <div class="flex flex-row items-center justify-between rounded-lg border border-border p-4">
          <div class="space-y-0.5">
            <Form.Label class="text-base">Social notifications</Form.Label>
            <Form.Description>Receive notifications for when someone sends you a message.</Form.Description>
          </div>
          <Switch includeInput {...attrs} bind:checked={$formData.social_notifications} />
        </div>
      </Form.Control>
    </Form.Field>
  </div>

  <Form.Button disabled={!isTainted($tainted) || $submitting || $registering}>Update notifications</Form.Button>
</form>

{#if $isiOS}
  <Drawer.Root bind:open={$showInstallInstructions} openFocus={null}>
    <Drawer.Content class="border-border bg-popover">
      <Drawer.Header class="pb-0">
        <Drawer.Title class="pb-4">Install MinionAH</Drawer.Title>
        <Drawer.Description>
          <ScrollArea class="h-[28rem]" data-vaul-no-drag>
            <p>To receive notifcations from MinionAH on your Apple device, you need to install the app first. <br /> <br />Follow these simple steps to install MinionAH on your device.</p>
            <ol class="mt-2 list-inside list-decimal pb-4 text-center">
              <li>
                Tap the <span class="inline-flex items-center gap-1 font-semibold"><Share class="size-4" /> Share</span> button at the bottom of the screen.
                <img src="/assets/images/ios-install/Install Step 1.png" alt="Step 1" class="mx-auto max-h-96" />
              </li>
              <li>
                Tap <strong>Add to Home Screen</strong>.
                <img src="/assets/images/ios-install/Install Step 2.png" alt="Step 2" class="mx-auto max-h-96" />
              </li>
              <li>
                Tap <strong>Add</strong> in the top right corner.
                <img src="/assets/images/ios-install/Install Step 3.png" alt="Step 3" class="mx-auto max-h-96" />
              </li>
              <li>
                That's all! Just use MinionAH from your home screen instead of via Safari.
                <img src="/assets/images/ios-install/Install Step 4.png" alt="Step 4" class="mx-auto max-h-96" />
              </li>
            </ol>
          </ScrollArea>
        </Drawer.Description>
      </Drawer.Header>
      <Drawer.Footer>
        <Drawer.Close>Close</Drawer.Close>
      </Drawer.Footer>
    </Drawer.Content>
  </Drawer.Root>
{/if}
