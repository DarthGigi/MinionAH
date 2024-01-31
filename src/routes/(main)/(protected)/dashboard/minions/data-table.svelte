<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Input } from "$lib/components/ui/input";
  import * as Table from "$lib/components/ui/table";
  import { preferences } from "$lib/stores/preferences";
  import { formatNumber } from "$lib/utilities";
  import type { Minion } from "@prisma/client";
  import { ArrowUpDown, ChevronDown, RefreshCw, Trash2 } from "lucide-svelte";
  import { Render, Subscribe, createRender, createTable } from "svelte-headless-table";
  import { addHiddenColumns, addPagination, addSelectedRows, addSortBy, addTableFilter } from "svelte-headless-table/plugins";
  import { readable } from "svelte/store";
  import DataTableActions from "./data-table-actions.svelte";
  import DataTableCheckbox from "./data-table-checkbox.svelte";
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
        console.log(_count.sellers);
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
      cell: (data) => {
        return createRender(DataTableActions, { id: data.value, name: (data.row as any).original.name });
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

  const ids = flatColumns.map((col) => col.id);
  let hideForId = Object.fromEntries(ids.map((id) => [id, true]));
  $: $hiddenColumnIds = Object.entries(hideForId)
    .filter(([, hide]) => !hide)
    .map(([id]) => id);
  const hidableCols = ["generator_tier", "craftCost", "Auctions"];
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
              <DropdownMenu.Item>
                <RefreshCw class="mr-2 h-4 w-4" />
                Update every minion
              </DropdownMenu.Item>
              <DropdownMenu.Item>
                <RefreshCw class="mr-2 h-4 w-4" />
                Update craft costs
              </DropdownMenu.Item>
            </DropdownMenu.Group>
            <DropdownMenu.Separator class="bg-border" />
            <DropdownMenu.Group>
              <DropdownMenu.Item>
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
      <div class="flex-1 text-sm text-muted-foreground">
        {Object.keys($selectedDataIds).length} of{" "}
        {$rows.length} item{#if $rows.length !== 1}s{/if} selected
      </div>
      <span class="text-sm text-muted-foreground">
        Page {$pageIndex + 1} of {$pageCount}
      </span>
      <Button variant="outline" size="sm" class="border-none bg-accent" on:click={() => ($pageIndex = $pageIndex - 1)} disabled={!$hasPreviousPage}>Previous</Button>
      <Button variant="outline" size="sm" class="border-none bg-accent" disabled={!$hasNextPage} on:click={() => ($pageIndex = $pageIndex + 1)}>Next</Button>
    </div>
  </div>
</div>
