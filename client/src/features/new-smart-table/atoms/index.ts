import { atom } from 'jotai';

export const cellEditsAtom = atom<any>([]);

export const filtersAtom = atom<any[]>([]);
export const sortsAtom = atom<any[]>([]);

export const tableFilters = atom((get) => get(filtersAtom).filter((f) => f.column_name && f.value));
export const tableSorts = atom((get) => get(sortsAtom).filter((f) => f.column_name));
