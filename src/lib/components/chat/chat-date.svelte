<script lang="ts">
  import { slide } from "svelte/transition";

  export let date: Date;
  export let self: boolean;
  function formatDate(createdAt: Date) {
    const messageDate = createdAt;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (isSameDay(messageDate, today)) {
      return "Today";
    } else if (isSameDay(messageDate, yesterday)) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString();
    }
  }

  function isSameDay(date1: Date, date2: Date) {
    return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
  }
</script>

<div transition:slide|global={{ axis: "x" }} class="self-center text-center text-xs text-ring" class:ml-2={self} class:mr-2={!self}>{formatDate(date)}</div>
