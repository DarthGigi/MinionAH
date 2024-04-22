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
  import { Button } from "$lib/components/ui/button";
  import * as Form from "$lib/components/ui/form";
  import * as RadioGroup from "$lib/components/ui/radio-group";
  import { Switch } from "$lib/components/ui/switch";
  import { internalStorage } from "$lib/stores/preferences";
  import { requestNotificationPermission } from "$lib/utilities";
  import { getMessaging, getToken } from "firebase/messaging";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { readable, writable } from "svelte/store";
  import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";

  export let data: SuperValidated<Infer<NotificationFormSchema>>;

  const form = superForm(data, {
    validators: zodClient(notificationsFormSchema),
    dataType: "json",
    resetForm: false,
    timeoutMs: 2000
  });

  const { form: formData, enhance, tainted, isTainted, submitting, timeout } = form;

  const deviceRadioDisabled = writable(false);
  const permission = writable<NotificationPermission>();
  const hasEmail = readable($page.data.userData.settings?.profileSettings?.email ? true : false);
  const allRadioDisabled = writable(false);
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
      allRadioDisabled.set(!$hasEmail);
    } else if ($permission === "denied" || $permission === "default") {
      deviceRadioDisabled.set(true);
      allRadioDisabled.set(true);
    }
  };

  timeout.subscribe((value) => {
    if (value) {
      toast.loading("It's taking longer than expected to update your notification preferences...", {
        id: $toastLoading
      });
    }
  });

  onMount(async () => {
    handleRequestPermission();
  });
</script>

<form
  method="POST"
  class="space-y-8"
  use:enhance={{
    onSubmit: async ({ cancel }) => {
      if ($internalStorage.fcmToken && $formData.type !== "NONE" && $formData.type !== "EMAIL") {
        formData.update((state) => ({ ...state, fcmToken: $internalStorage.fcmToken }));
        $toastLoading = toast.loading("Updating your notification preferences...");
      } else if (!$internalStorage.fcmToken && $formData.type !== "NONE" && $formData.type !== "EMAIL") {
        toast.error("Failed to update your notification preferences. Please refresh the page and try again.");
        cancel();
      }
    },
    onResult: async () => {
      setTimeout(() => toast.dismiss($toastLoading), 300);
    },
    onUpdate: async ({ result }) => {
      if (result.type === "success") {
        toast.success("Your notification preferences have been updated successfully.");
      } else {
        toast.error("Failed to update your notification preferences.");
      }
    },
    onError: async () => {
      toast.error("Something went wrong trying to update your notification preferences.");
    }
  }}>
  <Form.Fieldset {form} name="type">
    <Form.Legend>Notify me via...</Form.Legend>
    <RadioGroup.Root class="flex flex-col space-y-1" bind:value={$formData.type}>
      <div class="flex items-center space-x-4">
        <Form.Control let:attrs>
          <RadioGroup.Item value="ALL" disabled={true} {...attrs} />
          <Form.Label class="flex flex-col font-normal">
            <span class="text-base">Device & Email</span>
            <span class="text-sm text-muted-foreground">Receive notifications on your device and via email. (coming soon)</span>
            {#if $permission === "denied" || $permission === "default"}
              <span class="text-sm font-semibold text-muted-foreground">You need to allow notifications to receive them.</span>
            {/if}
            {#if !hasEmail}
              <span class="text-sm font-semibold text-muted-foreground">You need to add an email to receive email notifications. You can do this in your <a href="/profile/settings" class="underline">profile settings</a>.</span>
            {/if}
          </Form.Label>
        </Form.Control>
      </div>
      <div class="flex items-center space-x-4">
        <Form.Control let:attrs>
          <RadioGroup.Item value="EMAIL" disabled={true} {...attrs} />
          <Form.Label class="flex flex-col font-normal">
            <span class="text-base">Email</span>
            <span class="text-sm text-muted-foreground">Receive notifications via email only. (coming soon) </span>
            {#if !hasEmail}
              <span class="text-sm font-semibold text-muted-foreground">You need to add an email to receive email notifications. You can do this in your <a href="/profile/settings" class="underline">profile settings</a>.</span>
            {/if}
          </Form.Label>
        </Form.Control>
      </div>
      <div class="flex items-center space-x-4">
        <Form.Control let:attrs>
          <RadioGroup.Item value="DEVICE" disabled={$deviceRadioDisabled} {...attrs} />
          <Form.Label class="flex flex-col font-normal">
            <span class="text-base">Device</span>
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

  {#if $permission === "denied" || $permission === "default"}
    <div class="flex flex-col">
      {#if $permission === "default"}
        <Button class="w-fit" variant="outline" on:click={() => handleRequestPermission(true)}>Allow notifications</Button>
      {/if}
      {#if $permission === "denied"}
        <p class="text-sm text-red-500">You have denied notifications. Please allow them in your browser settings.</p>
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

  <Form.Button disabled={!isTainted($tainted) || $submitting}>Update notifications</Form.Button>
</form>
