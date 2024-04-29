import { atom } from 'jotai';

export const pageAtom = atom<{
	appName: string | null;
	pageName: string | null;
	widgets:
		| {
				name: string;
				label: string;
				description: string;
				components: any[];
				type: string;
		  }[]
		| null;
	modals: {
		name: string;
		caller: string;
	}[];
}>({
	appName: null,
	pageName: null,
	widgets: [],
	modals: [],
});
