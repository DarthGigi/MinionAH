<script lang="ts" context="module">
  import { z } from "zod";
  export const profileFormSchema = z.object({
    username: z.string().min(3).max(16),
    email: z.string().email({ message: "Please enter a valid email" }).optional().or(z.literal("")),
    bio: z.string().max(160, { message: "Your bio can't be longer than 160 characters." }).optional(),
    urls: z.array(z.string().url({ message: "Please enter a valid URL" }).max(100, { message: "Your website URL can't be longer than 100 characters." })).max(6, { message: "You can't add more than 6 URLs." })
  });
  export type ProfileFormSchema = typeof profileFormSchema;
</script>

<script lang="ts">
  import { page } from "$app/stores";
  import * as Avatar from "$lib/components/ui/avatar";
  import { Button } from "$lib/components/ui/button";
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import CircleMinus from "lucide-svelte/icons/circle-minus";
  import Earth from "lucide-svelte/icons/earth";
  import Info from "lucide-svelte/icons/info";
  import RefreshCw from "lucide-svelte/icons/refresh-cw";
  import { tick } from "svelte";
  import { toast } from "svelte-sonner";
  import { writable } from "svelte/store";
  import { slide } from "svelte/transition";
  import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";

  export let data: SuperValidated<Infer<ProfileFormSchema>>;

  const form = superForm(data, {
    validators: zodClient(profileFormSchema),
    dataType: "json",
    resetForm: false,
    timeoutMs: 2000,
    validationMethod: "oninput"
  });

  const { form: formData, enhance, errors, tainted, isTainted, submitting, timeout } = form;
  const regex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
  const urlErrors = writable<boolean>();
  const urlRegexErrors = writable<boolean>();
  const toastLoading = writable<number | string>();

  const addUrl = () => {
    $formData.urls = [...$formData.urls, ""];

    tick().then(() => {
      const urlInputs = Array.from(document.querySelectorAll<HTMLElement>("#profile-form input[name='urls']"));
      const lastInput = urlInputs[urlInputs.length - 1];
      lastInput && lastInput.focus();
    });
  };

  const getFavicon = (domain: string, alt: boolean = false) => {
    if (!domain || domain === "") return `/api/internal/favicon/${encodeURIComponent(new URL(`https://minionah.com/${$page.data.user.username}`).toString())}`;
    let url: URL;
    try {
      if (!regex.test(domain)) {
        urlRegexErrors.set(true);
        throw new Error("Invalid URL");
      } else {
        urlRegexErrors.set(false);
      }
      url = new URL(domain);
      if (alt) return url.hostname;
      encodeURIComponent(url.toString());
    } catch {
      return null;
    }
    return `/api/internal/favicon/${encodeURIComponent(url.toString())}`;
  };

  errors.subscribe(({ urls }) => {
    if (urls) {
      urlErrors.set(Object.values(urls).some((url) => url !== undefined));
    } else {
      urlErrors.set(false);
    }
  });

  timeout.subscribe((value) => {
    if (value) {
      toast.loading("It's taking longer than expected to update your profile preferences...", {
        id: $toastLoading
      });
    }
  });
</script>

<form
  method="POST"
  class="space-y-8"
  use:enhance={{
    onSubmit: () => {
      $toastLoading = toast.loading("Updating your profile preferences...");
    },
    onResult: () => {
      setTimeout(() => toast.dismiss($toastLoading), 300);
    },
    onUpdate: ({ result }) => {
      if (result.type === "success") {
        toast.success("Your profile preferences have been updated successfully.");
      } else {
        toast.error("Failed to update your profile preferences.");
      }
    },
    onError: () => {
      toast.error("Something went wrong trying to update your profile preferences.");
    }
  }}>
  <Form.Field {form} name="username">
    <Form.Control let:attrs>
      <Form.Label>Minecraft account</Form.Label>
      <div class="flex gap-4">
        <Avatar.Root class="rounded-full ">
          <Avatar.Image class="pointer-events-none h-full w-full bg-accent p-1" src={`https://res.cloudinary.com/minionah/image/upload/v1/users/avatars/${$page.data.user.id}`} alt={`${$page.data.user.username}'s avatar`} />
          <Avatar.Fallback class="border-2 border-accent bg-accent">{$page.data.user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
        </Avatar.Root>
        <Input readonly disabled class="w-1/4 flex-shrink" {...attrs} bind:value={$formData.username} />
        <Form.Button disabled type="button" variant="outline" class="group relative flex gap-2 text-sm text-muted-foreground transition-all duration-300 hover:text-secondary-foreground">
          <RefreshCw class="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
          Re-sync
          <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">(coming soon)</div>
        </Form.Button>
      </div>
    </Form.Control>
    <Form.Description>This is your Minecraft account. You can edit your Minecraft account on <a href="https://www.minecraft.net/profile" class="underline" target="_blank">minecraft.net</a>.</Form.Description>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="email">
    <Form.Control let:attrs>
      <Form.Label>Email</Form.Label>
      <div class="relative">
        <Input type="email" autocomplete="email" class="no-input-borders pl-8" {...attrs} bind:value={$formData.email} />
        <Tooltip.Root closeOnPointerDown={false} openDelay={150}>
          <Tooltip.Trigger class="absolute left-2 top-1/2 z-10 -translate-y-1/2">
            <Info class="size-4 opacity-50 group-hover:opacity-100" />
          </Tooltip.Trigger>
          <Tooltip.Content class="border-border bg-popover">
            <p class="max-w-80 text-xs">Your email will be used to send you notifications and updates. <br /> <br /> You can configure your notification preferences in the <a href="/profile/settings/notifications" class="underline">notification settings</a>.</p>
          </Tooltip.Content>
        </Tooltip.Root>
      </div>
      <Form.Description>
        <span class="font-semibold">Your email is private and will never be shared with anyone.</span>
      </Form.Description>
      <Form.FieldErrors />
    </Form.Control>
  </Form.Field>
  <Form.Field {form} name="bio">
    <Form.Control let:attrs>
      <Form.Label>Bio</Form.Label>
      <Textarea {...attrs} bind:value={$formData.bio} class="no-input-borders resize-none" />
      <Form.Description>Your bio will be visible to others on your profile.</Form.Description>
      <Form.FieldErrors />
    </Form.Control>
  </Form.Field>
  <Form.Fieldset {form} name="urls">
    <Form.Legend>URLs</Form.Legend>
    <Form.Description>Add links to your website, blog, or social media profiles.</Form.Description>
    {#each $formData.urls as _, i}
      <Form.ElementField {form} name="urls[{i}]">
        <Form.Control let:attrs>
          <div class="relative" transition:slide={{ axis: "y", duration: 300 }}>
            <Avatar.Root class="absolute left-2 top-1/2 z-10 size-6 -translate-y-1/2 select-none">
              <Avatar.Image class="pointer-events-none h-full w-full rounded-full bg-accent p-0.5" src={getFavicon($formData.urls[i])} alt="Favicon" />
              <Avatar.Fallback class="pointer-events-none h-full w-full rounded-full bg-accent p-0.5"><Earth /></Avatar.Fallback>
            </Avatar.Root>
            <Input {...attrs} bind:value={$formData.urls[i]} class="no-input-borders relative pl-10" placeholder="https://minionah.com/user/{$page.data.user.username}" />
            <Button type="button" variant="link" size="sm" class="group absolute right-2 top-1/2 h-auto -translate-y-1/2 transform p-0" on:click={() => ($formData.urls = $formData.urls.filter((_, j) => j !== i))}>
              <CircleMinus class="opacity-50 transition-opacity duration-300 group-hover:opacity-100" />
            </Button>
          </div>
        </Form.Control>
        <Form.FieldErrors />
      </Form.ElementField>
    {/each}
    {#if $formData.urls.length === 6}
      <Form.Description class="text-sm text-muted-foreground">You can't add more than 6 URLs. Remove an URL to add a new one.</Form.Description>
    {:else if $formData.urls.every((url) => url !== "")}
      {#if !$urlErrors}
        <div transition:slide>
          <Button type="button" variant="outline" size="sm" class="mt-2" on:click={addUrl}>Add URL</Button>
        </div>
      {/if}
    {:else}
      <Form.Description class="text-sm text-muted-foreground">Please fill in all the URLs before adding a new one.</Form.Description>
    {/if}
  </Form.Fieldset>
  <Form.Button disabled={!isTainted($tainted) || $submitting || $urlErrors || $urlRegexErrors}>Update profile</Form.Button>
</form>
