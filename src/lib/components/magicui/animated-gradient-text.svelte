<script lang="ts">
  import { cn } from "$lib/utils";

  export let colorClass: string = "";
</script>

<div class={cn("absolute inset-0 block h-full w-full animate-gradient rounded-[inherit] bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:300%_100%] p-px ![mask-composite:subtract] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]", colorClass)}></div>

<slot>Gradient</slot>
