<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Input } from "$lib/components/ui/input";
  import * as Table from "$lib/components/ui/table";
  import { preferences } from "$lib/stores/preferences";
  import { formatNumber } from "$lib/utilities";
  import type { Minion } from "@prisma/client";
  import ArrowUpDown from "lucide-svelte/icons/arrow-up-down";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import CircleEllipsis from "lucide-svelte/icons/circle-ellipsis";
  import LoaderCircle from "lucide-svelte/icons/loader-circle";
  import RefreshCw from "lucide-svelte/icons/refresh-cw";
  import Trash2 from "lucide-svelte/icons/trash-2";
  import { Render, Subscribe, createRender, createTable } from "svelte-headless-table";
  import { addHiddenColumns, addPagination, addSelectedRows, addSortBy, addTableFilter } from "svelte-headless-table/plugins";
  import { readable } from "svelte/store";
  import DataTableCheckbox from "../components/data-table-checkbox.svelte";
  import DataTableActions from "./data-table-actions.svelte";
  import DataTableMinion from "./data-table-minion.svelte";

  export let data: Minion[];
  const table = createTable(readable(data), {
    page: addPagination(),
    sort: addSortBy({ disableMultiSort: true, initialSortKeys: [{ id: "Auctions", order: "desc" }] }),
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
        return data.name;
      },
      header: "Minion",
      cell: ({ row }) => {
        if (!row.isData()) return "";
        return createRender(DataTableMinion, { minion: row.original });
      }
    }),
    table.column({
      accessor: "generator_tier",
      header: "Tier",
      cell: ({ value }) => {
        return $preferences.romanNumerals ? `${["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][value - 1]}` : `${value}`;
      },
      plugins: {
        filter: {
          exclude: true
        }
      }
    }),
    table.column({
      accessor: "craftCost",
      header: "Craft Cost",
      cell: ({ value }) => {
        return formatNumber(value);
      },
      plugins: {
        filter: {
          exclude: true
        }
      }
    }),
    table.column({
      accessor: ({ _count }) => {
        return _count.sellers;
      },
      header: "Auctions",
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

        return createRender(DataTableActions, { id: value, name: row.original.name });
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

  let selectedIds: string[];
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
  const hidableCols = ["generator_tier", "craftCost", "Auctions"];
  let minionRefreshDialogOpen = false;
  let minionRCCDialogOpen = false;
  let minionDeleteDialogOpen = false;
  let minionsDeleteDialogOpen = false;
  let loading = false;
  let statusDialog = { open: false, title: "", description: "" };

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
    <div class="flex items-center justify-between py-4">
      <Input class="max-w-sm border-none bg-accent ring-offset-background placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0" placeholder="Filter minions..." type="text" bind:value={$filterValue} />
      <div class="flex gap-4">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="outline" class="ml-auto border-none bg-accent">Actions <ChevronDown class="ml-2 h-4 w-4" /></Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content class="border-border bg-popover text-popover-foreground">
            <DropdownMenu.Group>
              <DropdownMenu.Item on:click={() => (minionRefreshDialogOpen = true)}>
                <RefreshCw class="mr-2 h-4 w-4" />
                Update every minion
              </DropdownMenu.Item>
              <DropdownMenu.Item on:click={() => (minionRCCDialogOpen = true)}>
                <RefreshCw class="mr-2 h-4 w-4" />
                Update craft costs
              </DropdownMenu.Item>
            </DropdownMenu.Group>
            <DropdownMenu.Separator class="bg-border" />
            <DropdownMenu.Group>
              <DropdownMenu.Item on:click={() => (minionDeleteDialogOpen = true)}>
                <Trash2 class="mr-2 h-4 w-4" />
                Delete every minion
              </DropdownMenu.Item>
            </DropdownMenu.Group>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
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
              <DropdownMenu.Item on:click={() => (minionsDeleteDialogOpen = true)}><Trash2 class="mr-2 h-4 w-4" />Delete minions</DropdownMenu.Item>
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

<AlertDialog.Root bind:open={minionRefreshDialogOpen} closeOnEscape={!loading} closeOnOutsideClick={!loading}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
      <AlertDialog.Description
        >Updating every minion will first delete all minions and then re-add them.
        <br /><br />
        <span class="text-destructive">This will cause every auction to be deleted. <br /> <span class="font-semibold">This action is irreversible.</span></span>
        <br /><br />
        This action will take some time to complete.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel disabled={loading}>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action asChild>
        <Button disabled={loading} variant="destructive" on:click={() => handleButtonClick("/api/dashboard/minions/resetall", "PUT", JSON.stringify({}), "Updating the minions failed. Please try again later or contact support.", (value) => (minionRefreshDialogOpen = value))}>
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

<AlertDialog.Root bind:open={minionRCCDialogOpen} closeOnEscape={!loading} closeOnOutsideClick={!loading}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>RCC Update</AlertDialog.Title>
      <AlertDialog.Description
        >This will update the craft costs of every minion.
        <br /><br />
        Please note that this is already done automatically every 24 hours.
        <br /><br />
        This action may take some time to complete.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel disabled={loading}>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action asChild>
        <Button disabled={loading} variant="default" on:click={() => handleButtonClick("/api/dashboard/minions/priceall", "PATCH", JSON.stringify({}), "Updating the prices failed. Please try again later or contact support.", (value) => (minionRCCDialogOpen = value))}>
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

<AlertDialog.Root bind:open={minionDeleteDialogOpen} closeOnEscape={!loading} closeOnOutsideClick={!loading}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
      <AlertDialog.Description
        >Deleting every minion will cause all auctions to be deleted.
        <br /><br />
        <span class="text-destructive">This will cause every auction to be deleted. <br /> <span class="font-semibold">This action is irreversible.</span></span>
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel disabled={loading}>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action asChild>
        <Button disabled={loading} variant="default" on:click={() => handleButtonClick("/api/dashboard/minions/deleteall", "DELETE", JSON.stringify({}), "Updating the prices failed. Please try again later or contact support.", (value) => (minionRCCDialogOpen = value))}>
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

<AlertDialog.Root bind:open={minionsDeleteDialogOpen} closeOnEscape={!loading} closeOnOutsideClick={!loading}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Delete selected minions</AlertDialog.Title>
      <AlertDialog.Description>
        This will delete all the selected minions
        <br /><br />
        <span class="font-semibold text-destructive">This will also delete every auction associated with the minions.</span>
        <br />
        <span class="text-destructive">This action is irreversible.</span>
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel disabled={loading}>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action asChild>
        <Button disabled={loading} variant="destructive" on:click={() => handleButtonClick("/api/dashboard/chats/delete", "DELETE", JSON.stringify({ ids: selectedIds }), "Deleting the minions failed. Please try again later or contact support.", (value) => (minionsDeleteDialogOpen = value))}>
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
