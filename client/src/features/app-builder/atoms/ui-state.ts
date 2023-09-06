import { atom } from 'jotai';

export const pageStateAtom = atom<any>({
	widget: {
		components: {
			name: {
				error_message: '',
				visible: true,
				options: [12, 23, 34, 45],
			},
			age: {
				error_message: '',
				visible: true,
				value: 123,
			},
		},
	},
});
