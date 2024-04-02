import { atom } from 'jotai';

// widget state atom
export const pageStateAtom = atom({});

const basePageContextAtom = atom({});

function non_empty_values(obj: any) {
	const non_empty: any = {};
	for (var k in obj) {
		if (obj.hasOwnProperty(k)) {
			if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
				var nested = non_empty_values(obj[k]);
				if (Object.keys(nested).length !== 0) {
					non_empty[k] = nested;
				}
			} else if (obj[k]) {
				// for JavaScript boolean check
				non_empty[k] = obj[k];
			}
		}
	}
	return non_empty;
}

// widget context atom
export const pageContextAtom = atom(
	(get) => get(basePageContextAtom),
	(get, set, allContext: any) => {
		const current: any = get(basePageContextAtom);

		if (Object.keys(current)?.length === 0) {
			set(basePageContextAtom, allContext);
			return;
		}

		const newContext = non_empty_values(allContext);
		console.log('newContext', newContext);

		console.log('current', current);
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
