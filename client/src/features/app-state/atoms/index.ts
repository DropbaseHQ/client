import { atom } from 'jotai';

// widget state atom
export const pageStateAtom = atom({});

const basePageContextAtom = atom({});

// widget context atom
export const pageContextAtom = atom(
	(get) => get(basePageContextAtom),
	(get, set, newContext: any) => {
		const current: any = get(basePageContextAtom);

		if (Object.keys(current)?.length === 0) {
			set(basePageContextAtom, newContext);
			return;
		}

		const updatedContext = Object.keys(current).reduce((agg: any, field: any) => {
			if (field in newContext) {
				return {
					...agg,
					[field]: {
						...(current?.[field] || {}),
						...(newContext?.[field] || {}),
					},
				};
			}

			return {
				...agg,
				[field]: current[field],
			};
		}, {});

		set(basePageContextAtom, updatedContext);
	},
);

export const pageStateContextAtom = atom((get) => {
	return {
		state: get(pageStateAtom),
		context: get(pageContextAtom),
	};
});
