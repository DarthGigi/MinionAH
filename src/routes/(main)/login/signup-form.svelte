<script lang="ts">
  import * as Accordion from "$lib/components/ui/accordion";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Collapsible from "$lib/components/ui/collapsible";
  import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  const handleSignInButtonClick = () => {
    dispatch("signin");
  };
</script>

<Card.Root class="border-border bg-popover">
  <Card.Header>
    <Card.Title>Sign Up</Card.Title>
    <Card.Description>Sign up for a an account to get the most out of MinionAH</Card.Description>
  </Card.Header>
  <Card.Content>
    <div class="flex flex-col items-center justify-center">
      <span class="mb-2 text-center text-xs text-muted-foreground"> By signing up, you agree to our <a href="https://newsroom.minionah.com/terms-of-service" target="_blank" class="underline">Terms of Service</a> and <a href="https://newsroom.minionah.com/privacy-policy" target="_blank" class="underline">Privacy Policy</a>.</span>
      <Button data-sveltekit-preload-data="tap" href="/api/oauth/minecraft" class="w-full">
        <img src="/assets/images/mc-auth.svg" class="pointer-events-none mr-1 h-6 w-auto" alt="Mc-Auth" />
        Sign up with MC-Auth
      </Button>
      <span class="mt-2 text-xs text-muted-foreground">This is a one-time process</span>
    </div>
  </Card.Content>
  <Card.Footer>
    <p class="w-full text-center text-sm">
      <span class="opacity-50">Already have an account?</span>
      <Button variant="link" on:click={handleSignInButtonClick} class={`inline-block p-0 underline underline-offset-2 opacity-50 transition-opacity duration-300 hover:opacity-100`}>Sign in</Button>
    </p>
  </Card.Footer>
</Card.Root>

<Collapsible.Root open={true} class="mt-6 flex w-full flex-col gap-y-6">
  <Collapsible.Trigger class="flex w-full items-center justify-between rounded-lg border border-border px-6 py-2 transition-colors duration-300 hover:bg-background ">FAQ <ChevronsUpDown class="size-5" /></Collapsible.Trigger>
  <Collapsible.Content class="rounded-lg border border-border px-6 py-2">
    <Accordion.Root class="w-full text-muted-foreground">
      <Accordion.Item value="item-1" class="border-border">
        <Accordion.Trigger class="text-start text-accent-foreground">How does it work?</Accordion.Trigger>
        <Accordion.Content>
          We use MC-Auth to authenticate your Minecraft account, which is the most secure way to do so.
          <br /><br />
          No sensitive information like your password, tokens, or any other personal information is being used or stored during this process.
          <br /><br />
          For more information, check out <a href="https://mc-auth.com" target="_blank" rel="noopener" class="text-accent-foreground underline">MC-Auth</a>.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2" class="border-border">
        <Accordion.Trigger class="text-start text-accent-foreground">Can I trust you with my account?</Accordion.Trigger>
        <Accordion.Content>
          We will never try to steal, sell, or otherwise misuse your Minecraft account information. We use the information provided by MC-Auth to verify your Minecraft identity.
          <br /><br />
          We will also never ask for your Minecraft password or any other sensitive information.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-3" class="border-border">
        <Accordion.Trigger class="text-start text-accent-foreground">What information do you store?</Accordion.Trigger>
        <Accordion.Content>
          We store the following information:
          <ul class="list-inside list-disc">
            <li>Your Minecraft UUID</li>
            <li>Your Minecraft username</li>
            <li>Your Minecraft skin</li>
            <li>Your Minecraft cape (if any)</li>
          </ul>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-4" class="border-none">
        <Accordion.Trigger class="text-start text-accent-foreground">What if your database is compromised?</Accordion.Trigger>
        <Accordion.Content>In the extremely unlikely event that our database is compromised, your Minecraft account will not be at risk at all and you will not have to change your Minecraft password.</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  </Collapsible.Content>
</Collapsible.Root>
