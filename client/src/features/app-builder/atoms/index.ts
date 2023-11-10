import { atom } from 'jotai';

export const developerTabAtom = atom<any>({
	type: null,
	id: null,
});

export const inspectedResourceAtom = atom<any>({
	type: null,
	id: null,
});

export const selectedTableIdAtom = atom((get) => {
	const devTab = get(inspectedResourceAtom);

	return devTab.type === 'table' ? devTab.id : null;
});
