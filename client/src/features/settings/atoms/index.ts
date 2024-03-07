import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const proxyTokenAtom = atomWithStorage<string | null>('proxyToken', '');

export const canUseGranularPermissionsAtom = atom(false);

export const activeURLMappingAtom = atom<{ [key: string]: any } | null>(null);
