<script lang="ts" context="module">
  import { z } from "zod";
  export const profileFormSchema = z.object({
    username: z.string().min(3).max(16),
    discord: z.string().min(2).max(32).optional().nullable(),
    email: z.string().email({ message: "Please enter a valid email" }).optional().or(z.literal("")),
    bio: z.string().max(160, { message: "Your bio can't be longer than 160 characters." }).optional(),
    urls: z.array(z.string().url({ message: "Please enter a valid URL" }).max(100, { message: "Your website URL can't be longer than 100 characters." })).max(6, { message: "You can't add more than 6 URLs." })
  });
  export type ProfileFormSchema = typeof profileFormSchema;
</script>

<script lang="ts">
  import { page } from "$app/stores";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import * as Avatar from "$lib/components/ui/avatar";
  import { Button } from "$lib/components/ui/button";
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { cn } from "$lib/utils";
  import { formatDistanceToNowStrict } from "date-fns";
  import CircleMinus from "lucide-svelte/icons/circle-minus";
  import Earth from "lucide-svelte/icons/earth";
  import Info from "lucide-svelte/icons/info";
  import RefreshCw from "lucide-svelte/icons/refresh-cw";
  import Trash2 from "lucide-svelte/icons/trash-2";
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
  const regex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;
  const urlErrors = writable<boolean>();
  const urlRegexErrors = writable<boolean>();
  const toastLoading = writable<number | string>();
  const syncingMinecraft = writable<boolean>();
  const syncingDiscord = writable<boolean>();
  const deletingDiscordAccount = writable<boolean>();
  // sync avaiable every 3 days
  const ms = 1000 * 60 * 60 * 24 * 3;
  const canSyncMinecraft = $page.data.user.syncedAt === null || Number($page.data.user.syncedAt) + ms < Date.now();
  const canSyncDiscord = $page.data.discordAccount?.syncedAt === null || Number($page.data.discordAccount?.syncedAt) + ms < Date.now();

  const addUrl = () => {
    $formData.urls = [...$formData.urls, ""];

    tick().then(() => {
      const urlInputs = Array.from(document.querySelectorAll<HTMLElement>("#profile-form input[name='urls']"));
      const lastInput = urlInputs[urlInputs.length - 1];
      if (lastInput) {
        lastInput.focus();
      }
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

  const handleSync = async (type: "MC" | "DISCORD") => {
    if (type === "MC") {
      syncingMinecraft.set(true);
    } else {
      syncingDiscord.set(true);
    }

    const url = type === "MC" ? `/api/internal/minecraft/profile/${$page.data.user.id}` : `/api/internal/discord/profile/${$page.data.discordAccount.id}`;

    const promise = fetch(url, {
      method: "PATCH"
    }).finally(() => {
      setTimeout(() => {
        if (type === "MC") {
          syncingMinecraft.set(false);
        } else {
          syncingDiscord.set(false);
        }
        window.location.reload();
      }, 1000);
    });

    const provider = type === "MC" ? "Minecraft" : "Discord";

    toast.promise(promise, {
      loading: `Syncing your ${provider} account...`,
      success: `Your ${provider} account has been synced successfully. Avatars may take a few minutes to update.`,
      error: `Failed to sync your ${provider} account.`
    });
  };

  const deleteDiscordAccount = async () => {
    deletingDiscordAccount.set(true);

    const promise = fetch(`/api/internal/discord/profile/${$page.data.discordAccount.id}`, {
      method: "DELETE"
    }).finally(() => {
      setTimeout(() => {
        deletingDiscordAccount.set(false);
        window.location.reload();
      }, 1000);
    });

    toast.promise(promise, {
      loading: "Unlinking your Discord account...",
      success: "Your Discord account has been unlinked successfully.",
      error: "Failed to unlink your Discord account."
    });
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
        {#if canSyncMinecraft}
          <Form.Button disabled={$syncingMinecraft} type="button" variant="outline" class="group flex gap-2 text-sm text-muted-foreground transition-all duration-300 hover:text-secondary-foreground" on:click={async () => await handleSync("MC")}>
            <RefreshCw class={cn("h-4 w-4", $syncingMinecraft ? "animate-spin" : "transition-transform duration-300 group-hover:rotate-90")} />
            Re-sync
          </Form.Button>
        {:else}
          <Tooltip.Root openDelay={0} closeDelay={0} closeOnPointerDown={false}>
            <Tooltip.Trigger class="group relative flex h-10 cursor-default items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground opacity-50 ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <RefreshCw class="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
              Re-sync
            </Tooltip.Trigger>
            <Tooltip.Content class="border-border bg-popover">
              You can sync again {formatDistanceToNowStrict(new Date($page.data.user.syncedAt).getTime() + ms, {
                addSuffix: true
              })}
            </Tooltip.Content>
          </Tooltip.Root>
        {/if}
      </div>
    </Form.Control>
    <Form.Description>This is your Minecraft account. You can edit your Minecraft account on <a href="https://www.minecraft.net/profile" class="underline" target="_blank">minecraft.net</a>.</Form.Description>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="discord">
    <Form.Control let:attrs>
      <Form.Label>Discord account</Form.Label>
      {#if $page.data.discordAccount}
        <div class="flex gap-4">
          <Avatar.Root class="rounded-full ">
            <Avatar.Image class="pointer-events-none h-full w-full rounded-full bg-accent p-0.5" src={`https://res.cloudinary.com/minionah/image/upload/v1/users/providers/discord/avatars/${$page.data.discordAccount.id}`} alt={`${$page.data.discordAccount.providerUsername}'s avatar`} />
            <Avatar.Fallback class="border-2 border-accent bg-accent">{$page.data.user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
          </Avatar.Root>
          <Input readonly disabled class="w-1/4 flex-shrink" {...attrs} bind:value={$formData.discord} />
          {#if canSyncDiscord}
            <Form.Button disabled={$syncingDiscord} type="button" variant="outline" class="group flex gap-2 text-sm text-muted-foreground transition-all duration-300 hover:text-secondary-foreground" on:click={async () => handleSync("DISCORD")}>
              <RefreshCw class={cn("h-4 w-4", $syncingDiscord ? "animate-spin" : "transition-transform duration-300 group-hover:rotate-90")} />
              Re-sync
            </Form.Button>
          {:else}
            <Tooltip.Root openDelay={0} closeDelay={0} closeOnPointerDown={false}>
              <Tooltip.Trigger class="group relative flex h-10 cursor-default items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-muted-foreground opacity-50 ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <RefreshCw class="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                Re-sync
              </Tooltip.Trigger>
              <Tooltip.Content class="border-border bg-popover">
                You can sync again {formatDistanceToNowStrict(new Date($page.data.discordAccount.syncedAt).getTime() + ms, {
                  addSuffix: true
                })}
              </Tooltip.Content>
            </Tooltip.Root>
          {/if}
          <AlertDialog.Root>
            <AlertDialog.Trigger disabled={$deletingDiscordAccount} type="button" class="group flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-muted-foreground ring-offset-background transition-all duration-300 hover:bg-accent hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
              <Trash2 class="size-4" />
            </AlertDialog.Trigger>
            <AlertDialog.Content class="border-border bg-popover">
              <AlertDialog.Header>
                <AlertDialog.Title>Are you sure?</AlertDialog.Title>
                <AlertDialog.Description>This will unlink your Discord account from your profile.</AlertDialog.Description>
              </AlertDialog.Header>
              <AlertDialog.Footer>
                <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                <AlertDialog.Action disabled={$deletingDiscordAccount} on:click={deleteDiscordAccount}>Unlink</AlertDialog.Action>
              </AlertDialog.Footer>
            </AlertDialog.Content>
          </AlertDialog.Root>
        </div>
      {:else}
        <div>
          <Button href="/api/oauth/discord" variant="outline" class="inline-flex items-center justify-center gap-1.5">
            <svg viewBox="0 0 256 199" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" class="size-4">
              <path d="M216.856 16.597A208.502 208.502 0 0 0 164.042 0c-2.275 4.113-4.933 9.645-6.766 14.046-19.692-2.961-39.203-2.961-58.533 0-1.832-4.4-4.55-9.933-6.846-14.046a207.809 207.809 0 0 0-52.855 16.638C5.618 67.147-3.443 116.4 1.087 164.956c22.169 16.555 43.653 26.612 64.775 33.193A161.094 161.094 0 0 0 79.735 175.3a136.413 136.413 0 0 1-21.846-10.632 108.636 108.636 0 0 0 5.356-4.237c42.122 19.702 87.89 19.702 129.51 0a131.66 131.66 0 0 0 5.355 4.237 136.07 136.07 0 0 1-21.886 10.653c4.006 8.02 8.638 15.67 13.873 22.848 21.142-6.58 42.646-16.637 64.815-33.213 5.316-56.288-9.08-105.09-38.056-148.36ZM85.474 135.095c-12.645 0-23.015-11.805-23.015-26.18s10.149-26.2 23.015-26.2c12.867 0 23.236 11.804 23.015 26.2.02 14.375-10.148 26.18-23.015 26.18Zm85.051 0c-12.645 0-23.014-11.805-23.014-26.18s10.148-26.2 23.014-26.2c12.867 0 23.236 11.804 23.015 26.2 0 14.375-10.148 26.18-23.015 26.18Z" fill="currentColor" />
            </svg>
            Connect your Discord account
          </Button>
        </div>
      {/if}
    </Form.Control>
    {#if $page.data.discordAccount}
      <Form.Description>This is your Discord account. You can edit your Discord account on <a href="https://discord.com/channels/@me" class="underline" target="_blank">discord.com</a>.</Form.Description>
      <Form.FieldErrors />
    {/if}
  </Form.Field>
  <Form.Field {form} name="email">
    <Form.Control let:attrs>
      <Form.Label>Email</Form.Label>
      <div class="relative">
        <Input type="email" autocomplete="email" class="no-input-borders pl-8" {...attrs} bind:value={$formData.email} />
        <Tooltip.Root openDelay={100} closeDelay={0} closeOnPointerDown={false}>
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
