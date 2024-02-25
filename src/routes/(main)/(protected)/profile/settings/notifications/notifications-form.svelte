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
  import { Button } from "$lib/components/ui/button";
  import * as Form from "$lib/components/ui/form";
  import { Label } from "$lib/components/ui/label";
  import { requestNotificationPermission } from "$lib/utilities";
  import { getMessaging, getToken } from "firebase/messaging";
  import { onMount } from "svelte";
  import type { SuperValidated } from "sveltekit-superforms";
  import { page } from "$app/stores";
  import { toast } from "svelte-sonner";

  export let data: SuperValidated<NotificationFormSchema>;
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
      deviceRadioDisabled = false;
      allRadioDisabled = !hasEmail;
    } else if (permission === "denied" || permission === "default") {
      deviceRadioDisabled = true;
      allRadioDisabled = true;
    }
  };
</script>

<Form.Root
  form={data}
  schema={notificationsFormSchema}
  let:config
  method="POST"
  class="space-y-8"
  debug={true}
  options={{
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
  <Form.Item>
    <Form.Field {config} name="type">
      <Form.Label>Notify me via...</Form.Label>
      <Form.RadioGroup class="flex flex-col space-y-1">
        <div class="flex items-center space-x-4">
          <Form.RadioItem value="ALL" id="ALL" disabled={allRadioDisabled} />
          <Label for="ALL" class="flex flex-col font-normal">
            <span class="text-base">Device & Email</span>
            <span class="text-sm text-muted-foreground">Receive notifications on your device and via email.</span>
            {#if permission === "denied" || permission === "default"}
              <span class="text-sm font-semibold text-muted-foreground">You need to allow notifications to receive them.</span>
            {/if}
            {#if !hasEmail}
              <span class="text-sm font-semibold text-muted-foreground">You need to add an email to receive email notifications. You can do this in your <a href="/profile/settings" class="underline">profile settings</a>.</span>
            {/if}
          </Label>
        </div>
        <div class="flex items-center space-x-4">
          <Form.RadioItem value="EMAIL" id="EMAIL" disabled={!hasEmail} />
          <Label for="EMAIL" class="flex flex-col font-normal">
            <span class="text-base">Email</span>
            <span class="text-sm text-muted-foreground">Receive notifications via email only.</span>
            {#if !hasEmail}
              <span class="text-sm font-semibold text-muted-foreground">You need to add an email to receive email notifications. You can do this in your <a href="/profile/settings" class="underline">profile settings</a>.</span>
            {/if}
          </Label>
        </div>
        <div class="flex items-center space-x-4">
          <Form.RadioItem value="DEVICE" id="DEVICE" disabled={deviceRadioDisabled} />
          <Label for="DEVICE" class="flex flex-col font-normal">
            <span class="text-base">Device</span>
            <span class="text-sm text-muted-foreground">Receive notifications on your device only.</span>
            {#if permission === "denied" || permission === "default"}
              <span class="text-sm font-semibold text-muted-foreground">You need to allow notifications to receive them.</span>
            {/if}
          </Label>
        </div>
        <div class="flex items-center space-x-4">
          <Form.RadioItem value="NONE" id="NONE" />
          <Label for="NONE" class="flex flex-col font-normal">
            <span class="text-base">None</span>
            <span class="text-sm text-muted-foreground">Don't receive any notifications.</span>
          </Label>
        </div>
      </Form.RadioGroup>
    </Form.Field>
  </Form.Item>

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
  <div>
    <h3 class="mb-4 text-lg font-medium">Notifications</h3>
    <div class="space-y-4">
      <Form.Field {config} name="marketing_emails">
        <Form.Item class="flex flex-row items-center justify-between rounded-lg border border-border p-4">
          <div class="space-y-0.5">
            <Form.Label class="text-base">Marketing emails</Form.Label>
            <Form.Description>Receive emails about new features, news, and more.</Form.Description>
          </div>
          <Form.Switch />
        </Form.Item>
      </Form.Field>
      <Form.Field {config} name="social_emails">
        <Form.Item class="flex flex-row items-center justify-between rounded-lg border border-border p-4">
          <div class="space-y-0.5">
            <Form.Label class="text-base">Social emails</Form.Label>
            <Form.Description>Receive emails for when someone sends you a message.</Form.Description>
          </div>
          <Form.Switch />
        </Form.Item>
      </Form.Field>
    </div>
  </div>
  <Form.Button>Update notifications</Form.Button>
</Form.Root>
