<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Separator } from "$lib/components/ui/separator";
  import ArrowLeft from "lucide-svelte/icons/arrow-left";
  import BellRing from "lucide-svelte/icons/bell-ring";
  import UserRound from "lucide-svelte/icons/user-round";
  import type { ComponentType } from "svelte";
  import SidebarNav from "./(components)/sidebar-nav.svelte";

  const sidebarNavItems = [
    {
      title: "Profile",
      href: "/profile/settings",
      icon: UserRound as ComponentType
    },
    {
      title: "Notifications",
      href: "/profile/settings/notifications",
      icon: BellRing as ComponentType
    }
  ];
</script>

<div class="space-y-6 p-10 pb-28">
  <div class="space-y-0.5">
    <div class="flex items-center gap-2">
      <Button variant="link" href="/profile" class="px-0"><ArrowLeft /></Button>
      <h2 class="text-2xl font-bold tracking-tight">Settings</h2>
    </div>
    <p class="text-muted-foreground">Manage your account and notification settings.</p>
  </div>
  <Separator class="my-6" />
  <div class="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
    <aside class="-mx-4 lg:w-1/5">
      <SidebarNav items={sidebarNavItems} />
    </aside>
    <div class="flex-1 lg:max-w-2xl">
      <slot />
    </div>
  </div>
</div>
