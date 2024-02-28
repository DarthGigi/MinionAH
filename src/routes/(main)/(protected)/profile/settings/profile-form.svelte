<script lang="ts" context="module">
  import { z } from "zod";
  export const profileFormSchema = z.object({
    username: z.string().min(3).max(16),
    email: z.string().email({ message: "Please enter a valid email" }).optional(),
    bio: z.string().max(160, { message: "Your bio can't be longer than 160 characters." }).optional(),
    website: z.string().url({ message: "Please enter a valid URL." }).max(100, { message: "Your website URL can't be longer than 100 characters." }).optional()
  });
  export type ProfileFormSchema = typeof profileFormSchema;
</script>

<script lang="ts">
  import { page } from "$app/stores";
  import * as Avatar from "$lib/components/ui/avatar";
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
  import RefreshCw from "lucide-svelte/icons/refresh-cw";
  import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";

  export let data: SuperValidated<Infer<ProfileFormSchema>>;

  const form = superForm(data, {
    validators: zodClient(profileFormSchema)
  });

  const { form: formData, enhance } = form;
</script>

<form
  method="POST"
  class="space-y-8"
  use:enhance={{
    onSubmit: async ({ cancel }) => {
      cancel();
    }
  }}>
  <fieldset disabled={true}>
    <Form.Field {form} name="username">
      <Form.Control let:attrs>
        <Form.Label>Minecraft account</Form.Label>
        <div class="flex gap-4">
          <Avatar.Root class="rounded-full ">
            <Avatar.Image class="pointer-events-none h-full w-full bg-accent p-1" src={`https://res.cloudinary.com/minionah/image/upload/v1/users/avatars/${$page.data.user.id}`} alt={`${$page.data.user.username}'s avatar`} />
            <Avatar.Fallback class="border-2 border-accent bg-accent">{$page.data.user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
          </Avatar.Root>
          <Input readonly disabled class="w-1/4 flex-shrink" {...attrs} bind:value={$formData.username} />
          <Form.Button disabled type="button" variant="outline" class="group flex gap-2 text-sm text-muted-foreground transition-all duration-300 hover:text-secondary-foreground">
            <RefreshCw class="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            Re-sync
          </Form.Button>
        </div>
      </Form.Control>
      <Form.Description>This is your Minecraft account. You can edit your Minecraft account on <a href="https://www.minecraft.net/profile" class="underline" target="_blank">minecraft.net</a>.</Form.Description>
      <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="email">
      <Form.Control let:attrs>
        <Form.Label>Email</Form.Label>
        <Input type="email" {...attrs} bind:value={$formData.email} />
        <Form.Description>
          Your email will be used to send you notifications and updates. You can configure your notification preferences in the <a href="/profile/settings/notifications" class="underline">notification settings</a>.
          <br />
          <span class="font-semibold">Your email address is private and will never be shared with anyone.</span>
        </Form.Description>
        <Form.FieldErrors />
      </Form.Control>
    </Form.Field>
    <Form.Field {form} name="bio">
      <Form.Control let:attrs>
        <Form.Label>Bio</Form.Label>
        <Textarea {...attrs} bind:value={$formData.bio} />
        <Form.Description>Your bio will be visible to others on your profile.</Form.Description>
        <Form.FieldErrors />
      </Form.Control>
    </Form.Field>
    <Form.Field {form} name="website">
      <Form.Control let:attrs>
        <Form.Label>Website</Form.Label>
        <Input {...attrs} bind:value={$formData.website} />
        <Form.Description>Your personal website, blog, or portfolio.</Form.Description>
        <Form.FieldErrors />
      </Form.Control>
    </Form.Field>
    <Form.Button>Update profile</Form.Button>
  </fieldset>
</form>
