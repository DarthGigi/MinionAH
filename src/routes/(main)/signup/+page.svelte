<script lang="ts">
  import { Button } from "$lib/components/ui/button";
</script>

<div class="flex h-[calc(50%-4rem)] flex-col items-center justify-end">
  <Button data-sveltekit-preload-data="tap" href="/api/oauth" class="group scale-125 bg-[#343a40] font-medium text-[#f8f9fa] duration-300 hover:bg-[#343a40]/50 hover:text-[#f8f9fa]/50">
    <img src="/assets/images/mc-auth.svg" class="pointer-events-none mr-1 h-6 w-auto select-none transition-opacity duration-300 group-hover:opacity-70" alt="Mc-Auth" />
    Sign up with MC-Auth
  </Button>
</div>
<div class="mx-auto max-w-xl select-none px-4 py-8 text-accent max-md:pb-20 md:px-0">
  <p>
    MinionAH will never try to steal, sell, or otherwise misuse your Minecraft account information. We use the information provided by MC-Auth to verify your Minecraft identity.
    <br />
    We will never ask for your Minecraft password or any other sensitive information.
    <br /><br />
    MC-Auth is the most secure way to authenticate your Minecraft account. We do not have access to your account or any other sensitive information. You can check out <a href="https://mc-auth.com" target="_blank" class="underline underline-offset-2">mc-auth.com</a> for more information.
    <br /><br />
    We also only store the following in our database:
  </p>
  <ul class="list-inside list-disc">
    <li>Your Minecraft UUID</li>
    <li>Your Minecraft username</li>
    <li>Your Minecraft (active) skin</li>
    <li>Your Minecraft (active) cape (if any)</li>
  </ul>
  <p>
    <br /><br />
    This makes sure that in the extremely unlikely event that our database is compromised, your account will not be at risk at all and you will not have to change your password.
    <br /><br />
    We hope this clears up any concerns you may have about the security of your account and trust us with authenticating you for our services.
    <br /><br />
    If you have any concerns, the project is fully open source and you can view the source code of the login part <a href="https://github.com/DarthGigi/MinionAH/tree/main/src/routes/api/oauth" target="_blank" class="underline underline-offset-2">here</a>.
    <br /><br />
    If you have any questions or other concerns, feel free to contact us.
  </p>
</div>
