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
		  }[]
		| null;
}>({
	widgetName: null,
	appName: null,
	pageName: null,
	widgets: [],
});
