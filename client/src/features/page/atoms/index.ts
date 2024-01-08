import { atom } from 'jotai';

export const pageAtom = atom<{
	widgetName: string | null;
	appName: string | null;
	pageName: string | null;
	widgets: string[] | null;
}>({
	widgetName: null,
	appName: null,
	pageName: null,
	widgets: [],
});
