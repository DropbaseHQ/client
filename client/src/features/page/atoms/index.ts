import { atom } from 'jotai';

export const pageAtom = atom<{
	widgetName: string | null;
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
	widgetName: null,
	appName: null,
	pageName: null,
	widgets: [],
	modals: [],
});
