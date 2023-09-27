import { atom } from 'jotai';

export const developerTabAtom = atom<any>({
	type: null,
	id: null,
});

export const selectedTableIdAtom = atom((get) => {
	const devTab = get(developerTabAtom);

	return devTab.type === 'table' ? devTab.id : null;
});
