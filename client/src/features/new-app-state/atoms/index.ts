import { atom } from 'jotai';
import lodashSet from 'lodash/set';

// Selected table rows atom
export const newSelectedRowAtom: any = atom({});

// state is divided in two parts - tables & widget

// use to handle tables part of state, and other fields apart from widget in future
export const nonWidgetStateAtom = atom({});

// use to handle widgets part of state
export const allWidgetStateAtom = atom({
	selected: null,
	state: {},
});

export const allWidgetsInputAtom = atom({});

// read-write atom for widget components based on widgetState
export const widgetComponentsAtom: any = atom(
	(get) => {
		const currentState = get(allWidgetStateAtom) as any;

		return currentState.state;
	},
	(get, set, inputs: any) => {
		let widgetState: any = get(allWidgetStateAtom);
		let currentInputs = get(allWidgetsInputAtom);

		if (widgetState.selected) {
			Object.keys(inputs).forEach((i) => {
				widgetState = lodashSet(
					widgetState,
					`state.${widgetState.selected}.${i}.value`,
					inputs[i],
				);
				currentInputs = lodashSet(currentInputs, `${widgetState.selected}.${i}`, inputs[i]);
			});

			set(allWidgetsInputAtom, {
				...JSON.parse(JSON.stringify(currentInputs)),
			});

			set(allWidgetStateAtom, { ...JSON.parse(JSON.stringify(widgetState)) });
		}
	},
);

export const newPageStateAtom = atom((get) => {
	const userInputState: any = get(allWidgetsInputAtom) || {};

	return {
		state: {
			tables: get(newSelectedRowAtom) || {},
			widgets: userInputState || {},
		},
		context: { ...get(nonWidgetStateAtom), widgets: get(allWidgetStateAtom).state || {} },
	};
});
