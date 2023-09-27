import { atom } from 'jotai';
import lodashSet from 'lodash/set';
import lodashGet from 'lodash/get';

// Selected table rows atom
export const newSelectedRowAtom = atom({});

// state is divided in two parts - tables & widget

// use to handle tables part of state, and other fields apart from widget in future
export const nonWidgetStateAtom = atom({});

// use to handle widgets part of state
export const allWidgetStateAtom = atom({
	selected: null,
	state: {},
});

// read-write atom for widget components based on widgetState
export const widgetComponentsAtom: any = atom(
	(get) => {
		const currentState = get(allWidgetStateAtom) as any;

		const currentWidgetComponents = lodashGet(
			currentState.state,
			`${currentState.selected}.components`,
			{},
		);

		return currentWidgetComponents;
	},
	(get, set, inputs: any) => {
		let widgetState: any = get(allWidgetStateAtom);

		if (widgetState.selected) {
			Object.keys(inputs).forEach((i) => {
				widgetState = lodashSet(
					widgetState,
					`state.${widgetState.selected}.components.${i}.value`,
					inputs[i],
				);
			});

			set(allWidgetStateAtom, { ...JSON.parse(JSON.stringify(widgetState)) });
		}
	},
);

export const newPageStateAtom = atom((get) => {
	const userInputState: any = get(widgetComponentsAtom) || {};

	return {
		tables: get(newSelectedRowAtom) || {},
		user_input: Object.keys(userInputState).reduce(
			(agg, field) => ({
				...agg,
				[field]: userInputState?.[field]?.value,
			}),
			{},
		),
		state: { ...get(nonWidgetStateAtom), widget: get(allWidgetStateAtom).state || {} },
	};
});
