import { atomWithStorage } from 'jotai/utils';
import { atom } from 'jotai';

export const proxyTokenAtom = atomWithStorage<string | null>('proxyToken', '');

export const canUseGranularPermissionsAtom = atom(false);
