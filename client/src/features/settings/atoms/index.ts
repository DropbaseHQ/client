import { atomWithStorage } from 'jotai/utils';

export const proxyTokenAtom = atomWithStorage<string | null>('proxyToken', '');
