import { atom } from 'jotai';

export const userInputAtom = atom({});

export const selectedRowAtom = atom({});

export const fetchersAtom = atom<any>({});

export const uiCodeAtom = atom('some test');

export const runResultAtom = atom<any>('');

export const fetchersLastSavedAtom = atom<any>('');

export const uiCodeLastSavedAtom = atom<any>('');
