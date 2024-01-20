<script lang="ts">
  import { page } from "$app/stores";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import * as Form from "$lib/components/ui/form";
  import { Loader2 } from "lucide-svelte";
  import { superForm } from "sveltekit-superforms/client";
  import type { PageData } from "./$types";
  import { formSchema } from "./schema";
  export let data: PageData;

  const { message } = superForm(data.form, { warnings: { duplicateId: false } });

  let passwordConfirmInputIsValid = false;
  let submitting = false;

  $: if ($page.form) {
    submitting = false;
  }
</script>

<Form.Root method="POST" form={data.form} schema={formSchema} on:submit={() => (submitting = true)} let:config class="mx-auto flex h-1/2 max-w-md flex-col justify-center px-4 md:px-0">
  <Form.Field {config} name="username">
    <Form.Item>
      <Form.Label>Username</Form.Label>
      <Form.Description>This is your Minecraft username.</Form.Description>
      <Form.Input tabindex={-1} type="text" aria-readonly readonly class="pointer-events-none select-none border-2 border-accent read-only:cursor-not-allowed read-only:opacity-50 focus:border-accent focus:shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0" autocomplete="username" name="username" id="username" />
      <Form.Validation />
    </Form.Item>
  </Form.Field>
  <Form.Field {config} name="new-password">
    <Form.Item>
      <Form.Label for="new-password">New Password</Form.Label>
      <Form.Description>Create a password for your account.</Form.Description>
      <Form.Input type="password" name="new-password" id="new-password" autocomplete="new-password" passwordrules="minlength: 8;" class="border-2 border-accent transition-all duration-300 focus:border-muted-foreground focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 data-[invalid]:border-destructive/40 focus:data-[invalid]:border-destructive" />
      <Form.Validation />
    </Form.Item>
  </Form.Field>
  <Form.Field {config} name="confirm-password">
    <Form.Item>
      <Form.Label for="confirm-password">Confirm Password</Form.Label>
      <Form.Input
        type="password"
        name="confirm-password"
        id="confirm-password"
        autocomplete="new-password"
        passwordrules="minlength: 8;"
        class="border-2 border-accent transition-all duration-300 focus:border-muted-foreground focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 data-[invalid]:border-destructive/40 focus:data-[invalid]:border-destructive"
        on:input={({ currentTarget }) => {
          if (currentTarget.attributes.getNamedItem("data-invalid") === null && currentTarget.attributes.getNamedItem("aria-invalid") === null && currentTarget.value.length >= 8) {
            passwordConfirmInputIsValid = true;
          } else {
            passwordConfirmInputIsValid = false;
          }
        }} />
      <Form.Validation class="pb-2" />
    </Form.Item>
  </Form.Field>
  <Form.Button disabled={!passwordConfirmInputIsValid || submitting} class="transition-all duration-300">
    {#if !submitting}
      Create Account
    {:else}
      <Loader2 class="h-4 w-4 animate-spin" />
    {/if}
  </Form.Button>
</Form.Root>

<AlertDialog.Root
  open={$message !== undefined}
  onOpenChange={(open) => {
    if (open === false) {
      $message = undefined;
    }
  }}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title
        >{#if $message}{$message.title}{/if}</AlertDialog.Title>
      <AlertDialog.Description>
        {#if $message}{@html $message.description}{/if}
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Close</AlertDialog.Cancel>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
