<script lang="ts">
  import { page } from "$app/stores";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { Loader2 } from "lucide-svelte";
  import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { formSchema, type FormSchema } from "./schema";

  export let data: SuperValidated<Infer<FormSchema>>;

  const form = superForm(data, {
    warnings: { duplicateId: false },
    validators: zodClient(formSchema),
    dataType: "json"
  });

  const { form: formData, enhance, message } = form;

  let passwordInputIsValid = false;
  let submitting = false;

  $: if ($page.form) {
    submitting = false;
  }
</script>

<form
  method="POST"
  use:enhance={{
    onSubmit: () => {
      submitting = true;
    }
  }}
  class="relative mx-auto flex h-1/2 max-w-md flex-col justify-center self-center px-4 md:px-0">
  <Form.Field {form} name="username">
    <Form.Control let:attrs>
      <Form.Label for="username">Username</Form.Label>
      <Form.Description>This is your <span class="font-semibold">Minecraft</span> username.</Form.Description>
      <Input {...attrs} bind:value={$formData.username} maxlength={16} type="text" class="border-2 border-accent transition-all duration-300 focus:border-muted-foreground focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 data-[invalid]:border-destructive/40 focus:data-[invalid]:border-destructive" autocomplete="username" name="username" id="username" />
      <Form.FieldErrors />
    </Form.Control>
  </Form.Field>
  <Form.Field {form} name="current-password">
    <Form.Control let:attrs>
      <Form.Label for="current-password">Password</Form.Label>
      <Form.Description>Enter your <span class="font-semibold">MinionAH</span> password to login.</Form.Description>
      <Input
        {...attrs}
        bind:value={$formData["current-password"]}
        type="password"
        name="current-password"
        id="current-password"
        autocomplete="current-password"
        passwordrules="minlength: 8;"
        class="border-2 border-accent transition-all duration-300 focus:border-muted-foreground focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 data-[invalid]:border-destructive/40 focus:data-[invalid]:border-destructive"
        on:input={({ currentTarget }) => {
          if (currentTarget.attributes.getNamedItem("data-invalid") === null && currentTarget.attributes.getNamedItem("aria-invalid") === null && currentTarget.value.length >= 8) {
            passwordInputIsValid = true;
          } else {
            passwordInputIsValid = false;
          }
        }} />
      <Form.FieldErrors />
    </Form.Control>
  </Form.Field>

  <Form.Button disabled={!passwordInputIsValid || submitting} class="transition-all duration-300">
    {#if !submitting}
      Login
    {:else}
      <Loader2 class="h-4 w-4 animate-spin" />
    {/if}
  </Form.Button>

  <span class="my-2 w-full text-center text-sm opacity-50">Or</span>
  <Form.Button aria-disabled data-sveltekit-preload-data="tap" href="/api/oauth" class={`group bg-[#343a40] text-[#f8f9fa] duration-300 hover:bg-[#343a40]/50 hover:text-[#f8f9fa]/50 ${submitting ? "pointer-events-none cursor-default opacity-50" : ""}`}>
    <img src="/assets/images/mc-auth.svg" class="pointer-events-none mr-1 h-6 w-auto select-none transition-opacity duration-300 group-hover:opacity-70" alt="Mc-Auth" />
    Login with MC-Auth
  </Form.Button>

  <span class="my-4 w-full text-center text-sm">
    <span class="opacity-50">Don't have an account?</span>
    <a href="/signup" class={`underline underline-offset-2 opacity-50 transition-opacity duration-300 hover:opacity-100 ${submitting ? "pointer-events-none cursor-default" : ""}`}>Sign up</a>
  </span>
</form>

<AlertDialog.Root
  open={$message !== undefined}
  onOpenChange={(open) => {
    if (open === false) {
      $message = undefined;
    }
  }}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>
        {#if $message}{$message.title}{/if}
      </AlertDialog.Title>
      <AlertDialog.Description>
        {#if $message}{@html $message.description}{/if}
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Close</AlertDialog.Cancel>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
