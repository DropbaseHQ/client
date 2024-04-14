import { atom } from 'jotai';

// widget state atom
export const pageStateAtom = atom({});

// widget context atom
export const pageContextAtom = atom({});

export const pageStateContextAtom = atom((get) => {
	return {
		state: get(pageStateAtom),
		context: get(pageContextAtom),
	};
});
