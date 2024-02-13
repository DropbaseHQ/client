import { atom } from 'jotai';

export const appModeAtom = atom({
	isPreview: false,
});

export const websocketStatusAtom = atom(false);
