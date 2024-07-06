<script lang="ts">
  import { cn } from "$lib/utils";

  export let shimmerWidth: number = 100;
  let className: string = "";
  export { className as class };
</script>

<p
  style="--shimmer-width: {shimmerWidth}px;"
  class={cn(
    "mx-auto max-w-md  text-neutral-400/50 ",

    // Shimmer effect
    "animate-shimmer bg-clip-text bg-no-repeat [background-position:0_0] [background-size:var(--shimmer-width)_100%] [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]",

    // Shimmer gradient
    "bg-gradient-to-r from-transparent via-white/80 via-50% to-transparent",

    className
  )}>
  <slot />
</p>
