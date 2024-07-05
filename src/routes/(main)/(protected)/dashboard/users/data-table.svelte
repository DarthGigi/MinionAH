<script lang="ts">
  import { page } from "$app/stores";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Input } from "$lib/components/ui/input";
  import * as Table from "$lib/components/ui/table";
  import type { User } from "@prisma/client";
  import ArrowUpDown from "lucide-svelte/icons/arrow-up-down";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import CircleEllipsis from "lucide-svelte/icons/circle-ellipsis";
  import LoaderCircle from "lucide-svelte/icons/loader-circle";
  import Trash2 from "lucide-svelte/icons/trash-2";
  import { Render, Subscribe, createRender, createTable } from "svelte-headless-table";
  import { addHiddenColumns, addPagination, addSelectedRows, addSortBy, addTableFilter } from "svelte-headless-table/plugins";
  import { readable } from "svelte/store";
  import DataTableCheckbox from "../components/data-table-checkbox.svelte";
  import DataTableActions from "./data-table-actions.svelte";
  import DataTableUser from "./data-table-user.svelte";
  export let data: User[];
  const table = createTable(readable(data.filter((user) => user.id !== $page.data.user.id)), {
    page: addPagination(),
    sort: addSortBy({ disableMultiSort: true }),
    filter: addTableFilter({
      fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase())
    }),
    hide: addHiddenColumns(),
    select: addSelectedRows()
  });

  const columns = table.createColumns([
    table.column({
      accessor: "id",
      header: (_, { pluginStates }) => {
        const { allPageRowsSelected } = pluginStates.select;
        return createRender(DataTableCheckbox, {
          checked: allPageRowsSelected
        });
      },
      cell: ({ row }, { pluginStates }) => {
        const { getRowState } = pluginStates.select;
        const { isSelected } = getRowState(row);
        return createRender(DataTableCheckbox, {
          checked: isSelected
        });
      },
      plugins: {
        sort: {
          disable: true
        }
      }
    }),
    table.column({
      accessor: (data) => {
        return data.username;
      },
      header: "Username",
      cell: ({ row }) => {
        if (!row.isData()) return "";
        return createRender(DataTableUser, { user: row.original });
      }
    }),
    table.column({
      accessor: "loggedInAt",
      header: "Last Login",
      cell: ({ value }) => {
        return new Date(value).toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric"
        });
      },
      plugins: {
        filter: {
          exclude: true
        }
      }
    }),
    table.column({
      accessor: "createdAt",
      header: "Joined",
      cell: ({ value }) => {
        return new Date(value).toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric"
        });
      },
      plugins: {
        filter: {
          exclude: true
        }
      }
    }),
    table.column({
      // @ts-ignore - Prisma doesn't have a type for this
      accessor: ({ _count }) => _count.auctions,
      header: "Minions",
      plugins: {
        filter: {
          exclude: true
        }
      }
    }),
    table.column({
      accessor: ({ id }) => id,
      header: "",
      cell: ({ row, value }) => {
        if (!row.isData()) return "";
        return createRender(DataTableActions, { id: value, username: row.original.username });
      },
      plugins: {
        sort: {
          disable: true
        },
        filter: {
          exclude: true
        }
      }
    })
  ]);

  const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates, flatColumns, rows } = table.createViewModel(columns);

  const { hasNextPage, hasPreviousPage, pageIndex, pageCount } = pluginStates.page;
  const { filterValue } = pluginStates.filter;
  const { hiddenColumnIds } = pluginStates.hide;
  const { selectedDataIds } = pluginStates.select;

  let selectedIds: (string | undefined)[];
  $: {
    selectedIds = Object.entries($selectedDataIds)
      .filter(([id, isSelected]) => isSelected && $rows[Number(id)])
      .map(([id]) => {
        const row = $rows[Number(id)];
        if (!row.isData()) return;
        return row.original.id;
      });
  }

  const ids = flatColumns.map((col) => col.id);
  let hideForId = Object.fromEntries(ids.map((id) => [id, true]));
  $: $hiddenColumnIds = Object.entries(hideForId)
    .filter(([, hide]) => !hide)
    .map(([id]) => id);
  const hidableCols = ["loggedInAt", "Minions"];

  let loading = false;
  let statusDialog = {
    open: false,
    title: "",
    description: ""
  };
  let usersDeleteDialogOpen = false;

  async function handleButtonClick(apiEndpoint: string, method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH", body: string, errorMessage: string, dialogOpenSetter: { (value: any): any; (value: any): any; (arg0: boolean): void }) {
    loading = true;
    try {
      const res = await fetch(apiEndpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json"
        },
        [method !== "GET" ? "body" : ""]: body
      });
      const resJson = await res.json();
      if (resJson.success) {
        dialogOpenSetter(false);
        window.location.reload();
      } else {
        dialogOpenSetter(false);
        statusDialog = { open: true, title: "Oops", description: errorMessage };
        loading = false;
      }
    } catch (e) {
      dialogOpenSetter(false);
      statusDialog = { open: true, title: "Oops", description: errorMessage };
      loading = false;
    }
  }
</script>

<div class="flex justify-center">
  <div class="w-full max-w-7xl flex-col">
    <div class="flex items-center py-4">
      <Input class="max-w-sm border-none bg-accent ring-offset-background placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0" placeholder="Filter users..." type="text" bind:value={$filterValue} />
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild let:builder>
          <Button variant="outline" class="ml-auto border-none bg-accent" builders={[builder]}>
            Columns <ChevronDown class="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content class="border-border bg-popover text-popover-foreground">
          {#each flatColumns as col}
            {#if hidableCols.includes(col.id)}
              <DropdownMenu.CheckboxItem bind:checked={hideForId[col.id]}>
                {col.header}
              </DropdownMenu.CheckboxItem>
            {/if}
          {/each}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>

    <div class="w-full rounded-md border border-border">
      <Table.Root {...$tableAttrs}>
        <Table.Header>
          {#each $headerRows as headerRow}
            <Subscribe rowAttrs={headerRow.attrs()}>
              <Table.Row class="border-border hover:bg-accent/50">
                {#each headerRow.cells as cell (cell.id)}
                  <Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
                    <Table.Head {...attrs} class="[&:has([role=checkbox])]:pl-8">
                      {#if props.sort.disabled}
                        <Render of={cell.render()} />
                      {:else}
                        <Button variant="ghost" on:click={props.sort.toggle} class="border-none hover:bg-accent">
                          <Render of={cell.render()} />
                          <ArrowUpDown class={"ml-2 h-4 w-4"} />
                        </Button>
                      {/if}
                    </Table.Head>
                  </Subscribe>
                {/each}
              </Table.Row>
            </Subscribe>
          {/each}
        </Table.Header>
        <Table.Body {...$tableBodyAttrs}>
          {#each $pageRows as row (row.id)}
            <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
              <Table.Row {...rowAttrs} data-state={$selectedDataIds[row.id] && "selected"} class="border-border hover:bg-accent/50 data-[state=selected]:bg-accent/70">
                {#each row.cells as cell (cell.id)}
                  <Subscribe attrs={cell.attrs()} let:attrs>
                    <Table.Cell {...attrs} class={`px-8 ${cell.id === "" ? "text-end" : ""}`}>
                      <Render of={cell.render()} />
                    </Table.Cell>
                  </Subscribe>
                {/each}
              </Table.Row>
            </Subscribe>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>
    <div class="flex items-center justify-end space-x-2 py-4">
      <div class="flex flex-1 items-center gap-2 text-sm text-muted-foreground">
        <div>
          {Object.keys($selectedDataIds).length} of{" "}
          {$rows.length} row{#if $rows.length !== 1}s{/if} selected
        </div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild let:builder>
            {#if Object.keys($selectedDataIds).length > 0}
              <Button variant="ghost" builders={[builder]} size="icon" class="relative h-8 w-8 p-0">
                <span class="sr-only">Open menu</span>
                <CircleEllipsis class="h-5 w-5" />
              </Button>
            {/if}
          </DropdownMenu.Trigger>
          <DropdownMenu.Content class="border-border bg-popover text-popover-foreground">
            <DropdownMenu.Label>Selected Items</DropdownMenu.Label>
            <DropdownMenu.Group>
              <DropdownMenu.Separator class="bg-border" />
              <DropdownMenu.Item on:click={() => (usersDeleteDialogOpen = true)}><Trash2 class="mr-2 h-4 w-4" />Delete users</DropdownMenu.Item>
            </DropdownMenu.Group>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
      <span class="text-sm text-muted-foreground">
        Page {$pageIndex + 1} of {$pageCount}
      </span>
      <Button variant="outline" size="sm" class="border-none bg-accent" on:click={() => ($pageIndex = $pageIndex - 1)} disabled={!$hasPreviousPage}>Previous</Button>
      <Button variant="outline" size="sm" class="border-none bg-accent" disabled={!$hasNextPage} on:click={() => ($pageIndex = $pageIndex + 1)}>Next</Button>
    </div>
  </div>
</div>

<AlertDialog.Root bind:open={usersDeleteDialogOpen} closeOnEscape={!loading} closeOnOutsideClick={!loading}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Delete selected users</AlertDialog.Title>
      <AlertDialog.Description>
        This will delete all the selected users and their associated data:
        <ul class="list-inside list-disc">
          <li>Auctions</li>
          <li>Chats</li>
          <li>Messages</li>
        </ul>
        <br />
        <span class="text-destructive">This action is irreversible.</span>
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel disabled={loading}>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action asChild>
        <Button disabled={loading} variant="destructive" on:click={() => handleButtonClick("/api/internal/dashboard/users/delete", "DELETE", JSON.stringify({ ids: selectedIds }), "Deleting the users failed. Please try again later or contact support.", (value) => (usersDeleteDialogOpen = value))}>
          {#if loading}
            <LoaderCircle class="h-4 w-4 animate-spin" />
          {:else}
            Continue
          {/if}
        </Button>
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>

<Dialog.Root bind:open={statusDialog.open}>
  <Dialog.Content class="border-border bg-popover">
    <Dialog.Header>
      <Dialog.Title>{statusDialog.title}</Dialog.Title>
      <Dialog.Description>
        {@html statusDialog.description}
      </Dialog.Description>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>
