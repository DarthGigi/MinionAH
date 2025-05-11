<script lang="ts" context="module">
  import { z } from "zod";
  export const deleteAccountFormSchema = z.object({
    password: z.string().min(8, { message: "Password is at least 8 characters long." })
  });
  export type DeleteAccountFormSchema = typeof deleteAccountFormSchema;
</script>

<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Button } from "$lib/components/ui/button";
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import LoaderCircle from "lucide-svelte/icons/loader-circle";
  import { toast } from "svelte-sonner";
  import { writable } from "svelte/store";
  import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";

  export let data: SuperValidated<Infer<DeleteAccountFormSchema>>;

  const form = superForm(data, {
    id: "delete-account-form",
    validators: zodClient(deleteAccountFormSchema),
    dataType: "json",
    resetForm: false,
    timeoutMs: 2000,
    validationMethod: "oninput"
  });

  const { form: formData, enhance, errors, tainted, isTainted, submitting, timeout, submit, message } = form;

  const toastLoading = writable<number | string>();
  const alertOpen = writable(false);

  timeout.subscribe((value) => {
    if (value) {
      toast.loading("It's taking longer than expected to update your profile preferences...", {
        id: $toastLoading
      });
    }
  });
</script>

<div class="flex flex-col gap-4 rounded-md border border-destructive p-4">
  <h2 class="text-lg font-semibold text-destructive">Danger Zone</h2>
  <p class="text-sm text-muted-foreground">This is the last chance to turn back. Once you delete your account, there is no going back. Please be certain.</p>
  <AlertDialog.Root bind:open={$alertOpen}>
    <Button variant="destructive" on:click={() => ($alertOpen = !$alertOpen)}>Delete my account</Button>
    <form
      method="POST"
      class="space-y-8"
      action="?/deleteAccount"
      use:enhance={{
        onSubmit: () => {
          $toastLoading = toast.loading("Deleting your account...");
        },
        onResult: () => {
          // toast.dismiss($toastLoading);
        },
        onUpdate: ({ result }) => {
          if (result.type === "success") {
            toast.loading("Your account has been deleted successfully, you will be logged out in a few seconds...", {
              important: true,
              id: $toastLoading
            });
            // setTimeout(() => {
            //   window.location.href = "/logout";
            // }, 3000);
          } else {
            // toast.dismiss($toastLoading);
            if (result.data?.form?.message) {
              toast.error(result.data?.form?.message.title ?? "Something went wrong trying to delete your account.", {
                description: result.data?.form?.message.description ?? "Please try again later.",
                id: $toastLoading
              });
            } else {
              toast.error("Something went wrong trying to delete your account.", {
                description: "Please try again later.",
                id: $toastLoading
              });
            }
          }
        },
        onError: () => {
          toast.error("Something went wrong trying to delete your account.", {
            description: "Please try again later.",
            id: $toastLoading
          });
        }
      }}>
      <AlertDialog.Content class="border-destructive bg-popover">
        <AlertDialog.Header>
          <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
          <AlertDialog.Description>This action cannot be undone. This will permanently delete your account and remove your data from our servers.</AlertDialog.Description>
          <AlertDialog.Description>We make a backup of our database every 24 hours, and keep the last 10 backups. So after 10 days, your data will be permanently deleted from our backups as well.</AlertDialog.Description>
        </AlertDialog.Header>

        <Form.Field {form} name="password">
          <Form.Control let:attrs>
            <Form.Label for="password">Password</Form.Label>
            <Form.Description>
              This is your <span class="font-semibold">MinionAH</span> password.
            </Form.Description>
            <Input {...attrs} bind:value={$formData.password} type="password" name="current-password" id="current-password" autocomplete="current-password" passwordrules="minlength: 8;" class="border-2 border-accent transition-all duration-300 focus:border-muted-foreground focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 data-[invalid]:border-destructive/40 focus:data-[invalid]:border-destructive" />
            <Form.FieldErrors />
          </Form.Control>
        </Form.Field>
        <AlertDialog.Description>If you're banned from MinionAH, we will only keep your minecraft UUID stored to prevent you from creating a new account.</AlertDialog.Description>

        <AlertDialog.Footer>
          <AlertDialog.Cancel disabled={$submitting}>Cancel</AlertDialog.Cancel>
          <Form.Button on:click={submit} variant="destructive" disabled={!isTainted($tainted) || $submitting || ($errors.password?.length ?? 0) > 0}>
            {#if !$submitting}
              Delete account
            {:else}
              <LoaderCircle class="size-4 animate-spin" />
            {/if}
          </Form.Button>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </form>
  </AlertDialog.Root>
</div>
