import { atom } from 'jotai';

// Selected table rows atom
export const selectedRowAtom: any = atom({});

// state is divided in two parts - tables & widget

// use to handle tables part of state, and other fields apart from widget in future
// I think this is used for table context
export const nonWidgetContextAtom = atom<any>({});

export const tableStateAtom = atom({});
export const tableColumnTypesAtom = atom({});

// use to handle widgets part of state
export const allWidgetStateAtom = atom({
	selected: null,
	state: {},
});

// input values grouped by widget
export const allWidgetsInputAtom: any = atom({});

// read-write atom for widget components based on widgetState
export const widgetComponentsAtom: any = atom((get) => {
	const currentState = get(allWidgetStateAtom) as any;

	return currentState.state;
});

export const newPageStateAtom = atom((get) => {
	const userInputState: any = get(allWidgetsInputAtom) || {};

	return {
		state: {
			tables: get(selectedRowAtom) || {},
			widgets: userInputState || {},
		},
		context: { ...get(nonWidgetContextAtom), widgets: get(allWidgetStateAtom).state || {} },
	};
});
