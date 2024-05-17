import { atom } from 'jotai';

export type PromptType = {
	resource: 'header-component' | 'footer-component' | 'widget-component' | 'table' | 'ui' | null;
	name?: string | null;
	block?: string | null;
};

export const promptAtom = atom<PromptType>({
	resource: null,
	name: null,
	block: null,
});
