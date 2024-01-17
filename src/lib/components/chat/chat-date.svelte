<script lang="ts">
  export let date: Date;
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

<li class="text-center text-xs text-neutral-500">{formatDate(date)}</li>
