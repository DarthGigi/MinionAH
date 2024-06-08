<script lang="ts">
  import { page } from "$app/stores";
  import { Separator } from "$lib/components/ui/separator";
  import BellRing from "lucide-svelte/icons/bell-ring";
  import Settings from "lucide-svelte/icons/settings";
  import UserRound from "lucide-svelte/icons/user-round";
  import type { ComponentType } from "svelte";
  import SidebarNav from "./settings/(components)/sidebar-nav.svelte";
  import { derived } from "svelte/store";

  const sidebarNavItems = [
    {
      title: "Profile",
      description: "Create auctions and manage your listings.",
      href: "/profile",
      icon: UserRound as ComponentType
    },
    {
      title: "Settings",
      description: "Manage your account settings.",
      href: "/profile/settings",
      icon: Settings as ComponentType
    },
    {
      title: "Notifications",
      description: "Customize your notification settings",
      href: "/profile/settings/notifications",
      icon: BellRing as ComponentType
    }
  ];

  const activeItem = derived(page, ($page) => {
    return sidebarNavItems.find((item) => item.href === $page.url.pathname);
  });
</script>

<div class="space-y-6 pb-28 pt-0">
  <div class="px-2 md:px-10">
    <div class="space-y-0.5">
      <div class="flex items-center gap-2">
        <h2 class="text-2xl font-bold tracking-tight">{$activeItem?.title ?? "Profile"}</h2>
      </div>
      <p class="text-muted-foreground">{$activeItem?.description ?? "Create auctions and manage your listings."}</p>
    </div>
    <Separator class="my-6" />
  </div>
  <div class="flex flex-col space-y-8">
    <aside>
      <SidebarNav items={sidebarNavItems} class="lg:px-2" />
    </aside>
    <div class="flex-1">
      <slot />
    </div>
  </div>
</div>
