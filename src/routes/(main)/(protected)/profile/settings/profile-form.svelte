<script lang="ts" context="module">
  import { z } from "zod";
  export const profileFormSchema = z.object({
    username: z.string().min(3).max(16),
    email: z.string().email().optional(),
    bio: z.string().max(160).optional(),
    website: z.string().url({ message: "Please enter a valid URL." }).default("https://shadcn-svelte.com").optional()
  });
  export type ProfileFormSchema = typeof profileFormSchema;
</script>

<script lang="ts">
  import { page } from "$app/stores";
  import * as Form from "$lib/components/ui/form";
  import { RefreshCw } from "lucide-svelte";
  import type { SuperValidated } from "sveltekit-superforms";
  import * as Avatar from "$lib/components/ui/avatar";

  export let data: SuperValidated<ProfileFormSchema>;
</script>

<Form.Root
  form={data}
  schema={profileFormSchema}
  let:config
  method="POST"
  class="space-y-8"
  options={{
    onSubmit: async ({ cancel }) => {
      cancel();
    }
  }}>
  <fieldset disabled={true}>
    <Form.Item>
      <Form.Field {config} name="username">
        <Form.Label>Minecraft account</Form.Label>
        <div class="flex gap-4">
          <Avatar.Root class="rounded-full ">
            <Avatar.Image class="pointer-events-none h-full w-full bg-accent p-1" src={`https://res.cloudinary.com/minionah/image/upload/v1/users/avatars/${$page.data.user.id}`} alt={`${$page.data.user.username}'s avatar`} />
            <Avatar.Fallback class="border-2 border-accent bg-accent">{$page.data.user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
          </Avatar.Root>
          <Form.Input readonly disabled class="w-1/4 flex-shrink" />
          <Form.Button disabled type="button" variant="outline" class="group flex gap-2 text-sm text-muted-foreground transition-all duration-300 hover:text-secondary-foreground">
            <RefreshCw class="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            Re-sync
          </Form.Button>
        </div>
        <Form.Description>This is your Minecraft account. You can edit your Minecraft account on <a href="https://www.minecraft.net/profile" class="underline" target="_blank">minecraft.net</a>.</Form.Description>
        <Form.Validation />
      </Form.Field>
    </Form.Item>
    <Form.Item>
      <Form.Field {config} name="email">
        <Form.Label>Email</Form.Label>
        <Form.Input type="email" />
        <Form.Description>
          Your email will be used to send you notifications and updates. You can configure your notification preferences in the <a href="/profile/settings/notifications" class="underline">notification settings</a>.
          <br />
          <span class="font-semibold">Your email address is private and will never be shared with anyone.</span>
        </Form.Description>
        <Form.Validation />
      </Form.Field>
    </Form.Item>
    <Form.Item>
      <Form.Field {config} name="bio">
        <Form.Label>Bio</Form.Label>
        <Form.Textarea />
        <Form.Description>Your bio will be visible to others on your profile.</Form.Description>
        <Form.Validation />
      </Form.Field>
    </Form.Item>
    <Form.Item>
      <Form.Field {config} name="website">
        <Form.Label>Website</Form.Label>
        <Form.Input />
        <Form.Description>Your personal website, blog, or portfolio.</Form.Description>
        <Form.Validation />
      </Form.Field>
    </Form.Item>
    <Form.Button>Update profile</Form.Button>
  </fieldset>
</Form.Root>
