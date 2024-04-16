import { atom } from 'jotai';

// widget state atom
export const pageStateAtom = atom({});

const basePageContextAtom = atom({});

export function isObject(item: any) {
	return item && typeof item === 'object' && !Array.isArray(item);
}

const mergeContext = ({ newContext, currentContext }: any) => {
	const context: any = {};

	Object.keys(newContext || {}).forEach((key: any) => {
		if (key in currentContext) {
			const currentField = currentContext[key];
			const newField = newContext[key];

			if (isObject(newField)) {
				context[key] = {
					...(context[key] || {}),
					...mergeContext({
						newContext: newField,
						currentContext: currentField,
					}),
				};
			} else if (newField !== null) {
				context[key] = newField;
			} else {
				context[key] = currentField;
			}
		} else {
			context[key] = newContext[key];
		}
	});

	return context;
};

// widget context atom
export const pageContextAtom = atom(
	(get) => get(basePageContextAtom),
	(
		get,
		set,
		allContext: any,
		props?: {
			replace?: boolean;
		},
	) => {
		const { replace } = props || {};

		const current: any = get(basePageContextAtom);

		if (Object.keys(current)?.length === 0 || replace) {
			set(basePageContextAtom, allContext);
			return;
		}

		const updatedContext = mergeContext({
			newContext: allContext,
			currentContext: current,
		});

		set(basePageContextAtom, updatedContext);
	},
);

export const pageStateContextAtom = atom((get) => {
	return {
		state: get(pageStateAtom),
		context: get(pageContextAtom),
	};
});
