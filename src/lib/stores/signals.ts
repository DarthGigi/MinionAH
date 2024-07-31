import type { Seller } from "$lib/types";
import { writable } from "svelte/store";

export const searchSignal = writable("");
export const chatSignal = writable<Seller | undefined>();
