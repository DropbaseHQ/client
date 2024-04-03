import { atom } from 'jotai';

// widget state atom
export const pageStateAtom = atom({});

const basePageContextAtom = atom({});

function filterEmptyValues(obj: any) {
	const nonEmpty: any = {};
	Object.keys(obj).forEach((k: any) => {
		// eslint-disable-next-line no-prototype-builtins
		if (obj.hasOwnProperty(k)) {
			if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
				const nested = filterEmptyValues(obj[k]);
				if (Object.keys(nested).length !== 0) {
					nonEmpty[k] = nested;
				}
			} else if (obj[k]) {
				// for JavaScript boolean check
				nonEmpty[k] = obj[k];
			}
		}
	});

	return nonEmpty;
}

// widget context atom
export const pageContextAtom = atom(
	(get) => get(basePageContextAtom),
	(get, set, allContext: any, disableFilterEmptyValues?: any) => {
		const current: any = get(basePageContextAtom);

		if (Object.keys(current)?.length === 0) {
			set(basePageContextAtom, allContext);
			return;
		}

		const newContext = disableFilterEmptyValues ? allContext : filterEmptyValues(allContext);
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
		// console.log('updatedContext', updatedContext);
		set(basePageContextAtom, updatedContext);
	},
);

export const pageStateContextAtom = atom((get) => {
	return {
		state: get(pageStateAtom),
		context: get(pageContextAtom),
	};
});
