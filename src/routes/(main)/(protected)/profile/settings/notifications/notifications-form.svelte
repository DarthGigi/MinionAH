<script lang="ts" context="module">
  import { z } from "zod";
  export const notificationsFormSchema = z.object({
    type: z
      .enum(["ALL", "DEVICE", "EMAIL", "NONE"], {
        required_error: "You need to select a notification type."
      })
      .default("NONE"),
    social_emails: z.boolean().default(false).optional(),
    marketing_emails: z.boolean().default(false).optional(),
    fcmToken: z.string().optional()
  });
  type NotificationFormSchema = typeof notificationsFormSchema;
</script>

<script lang="ts">
  import { page } from "$app/stores";
  import { Button } from "$lib/components/ui/button";
  import * as Form from "$lib/components/ui/form";
  import * as RadioGroup from "$lib/components/ui/radio-group";
  import { Switch } from "$lib/components/ui/switch";
  import { requestNotificationPermission } from "$lib/utilities";
  import { getMessaging, getToken } from "firebase/messaging";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";

  export let data: SuperValidated<Infer<NotificationFormSchema>>;

  const form = superForm(data, {
    validators: zodClient(notificationsFormSchema),
    dataType: "json",
    resetForm: false
  });
  const { form: formData, enhance } = form;

  let fcmToken: string;
  let deviceRadioDisabled = false;
  let permission: NotificationPermission;
  let hasEmail = $page.data.settings?.profileSettings?.email ? true : false;
  let allRadioDisabled: boolean = false;

  onMount(async () => {
    handleRequestPermission();
  });

  const handleRequestPermission = async (request: boolean = false) => {
    permission = await requestNotificationPermission(request);
    if (permission === "granted") {
      const messaging = getMessaging();
      fcmToken = await getToken(messaging, {
        serviceWorkerRegistration: await navigator.serviceWorker.ready
      });
      $formData.fcmToken = fcmToken;
      deviceRadioDisabled = false;
      allRadioDisabled = !hasEmail;
    } else if (permission === "denied" || permission === "default") {
      deviceRadioDisabled = true;
      allRadioDisabled = true;
    }
  };
</script>

<form
  method="POST"
  class="space-y-8"
  use:enhance={{
    onSubmit: async ({ formData }) => {
      formData.set("fcmToken", fcmToken);
    },
    onResult: async ({ result }) => {
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
          <RadioGroup.Item value="ALL" disabled={allRadioDisabled} {...attrs} />
          <Form.Label class="flex flex-col font-normal">
            <span class="text-base">Device & Email</span>
            <span class="text-sm text-muted-foreground">Receive notifications on your device and via email.</span>
            {#if permission === "denied" || permission === "default"}
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
          <RadioGroup.Item value="EMAIL" disabled={!hasEmail} {...attrs} />
          <Form.Label class="flex flex-col font-normal">
            <span class="text-base">Email</span>
            <span class="text-sm text-muted-foreground">Receive notifications via email only.</span>
            {#if !hasEmail}
              <span class="text-sm font-semibold text-muted-foreground">You need to add an email to receive email notifications. You can do this in your <a href="/profile/settings" class="underline">profile settings</a>.</span>
            {/if}
          </Form.Label>
        </Form.Control>
      </div>
      <div class="flex items-center space-x-4">
        <Form.Control let:attrs>
          <RadioGroup.Item value="DEVICE" disabled={deviceRadioDisabled} {...attrs} />
          <Form.Label class="flex flex-col font-normal">
            <span class="text-base">Device</span>
            <span class="text-sm text-muted-foreground">Receive notifications on your device only.</span>
            {#if permission === "denied" || permission === "default"}
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

  {#if permission === "denied" || permission === "default"}
    <div class="flex flex-col">
      {#if permission === "default"}
        <Button class="w-fit" variant="outline" on:click={() => handleRequestPermission(true)}>Allow notifications</Button>
      {/if}
      {#if permission === "denied"}
        <p class="text-sm text-red-500">You have denied notifications. Please allow them in your browser settings.</p>
      {/if}
    </div>
  {/if}

  <div class="space-y-4">
    <Form.Field {form} name="marketing_emails">
      <Form.Legend>Notify me about...</Form.Legend>
      <Form.Control let:attrs>
        <div class="flex flex-row items-center justify-between rounded-lg border border-border p-4">
          <div class="space-y-0.5">
            <Form.Label class="text-base">Marketing</Form.Label>
            <Form.Description>Receive notifications about new features, news, and more.</Form.Description>
          </div>
          <Switch includeInput {...attrs} bind:checked={$formData.marketing_emails} />
        </div>
      </Form.Control>
    </Form.Field>
    <Form.Field {form} name="social_emails">
      <Form.Control let:attrs>
        <div class="flex flex-row items-center justify-between rounded-lg border border-border p-4">
          <div class="space-y-0.5">
            <Form.Label class="text-base">Social emails</Form.Label>
            <Form.Description>Receive emails for when someone sends you a message.</Form.Description>
          </div>
          <Switch includeInput {...attrs} bind:checked={$formData.social_emails} />
        </div>
      </Form.Control>
    </Form.Field>
  </div>

  <Form.Button>Update notifications</Form.Button>
</form>
