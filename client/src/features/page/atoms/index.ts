import { atom } from 'jotai';

export const pageAtom = atom<{
	widgetId: string | null;
	appName: string | null;
	pageName: string | null;
	widgets: string[] | null;
}>({
	widgetId: null,
	appName: null,
	pageName: null,
	widgets: [],
});
