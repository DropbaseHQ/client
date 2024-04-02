import { atom } from 'jotai';
import { merge } from 'lodash';

// widget state atom
export const pageStateAtom = atom({});

const basePageContextAtom = atom({});

// widget context atom
export const pageContextAtom = atom(
	(get) => get(basePageContextAtom),
	(get, set, newContext: any) => {
		const current: any = get(basePageContextAtom);

		if (Object.keys(current)?.length === 0) {
			set(basePageContextAtom, newContext);
			return;
		}

		const updatedContext = merge(newContext, current);
		set(basePageContextAtom, updatedContext);
	},
);

export const pageStateContextAtom = atom((get) => {
	return {
		state: get(pageStateAtom),
		context: get(pageContextAtom),
	};
});
