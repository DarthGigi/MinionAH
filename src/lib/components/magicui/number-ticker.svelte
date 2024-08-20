<script lang="ts">
  import { cn } from "$lib/utils";
  import { onMount } from "svelte";
  import { cubicOut } from "svelte/easing";
  import { tweened } from "svelte/motion";
  export let value = 100;
  export let initial = 0;
  export let duration = 6000;
  let num = tweened(initial, {
    duration: duration,
    easing: cubicOut
  });
  let className: string = "";
  export { className as class };
  onMount(() => {
    num.set(value);
  });
</script>

<div class={cn("inline-block tracking-normal", className)} {...$$restProps}>
  {$num.toFixed(0)}
</div>
