import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const cellEditsAtom = atom<any>({});

export const filtersAtom = atom<any>({});
export const sortsAtom = atom<any>({});

export const tablePageInfoAtom = atom<any>({});

export const tableColumnWidthAtom = atomWithStorage<any>('columnWidth', {});

export const hasSelectedRowAtom = atom<any>({});
