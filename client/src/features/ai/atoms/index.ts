import { atom } from 'jotai';

export type PromptType = {
	isOpen: boolean;
};

export const promptAtom = atom<PromptType>({
	isOpen: false,
});
