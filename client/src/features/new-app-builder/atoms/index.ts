import { atom } from 'jotai';
import { MonacoLanguageClient } from 'monaco-languageclient';

export const developerTabAtom = atom<any>({
	type: null,
	id: null,
});

export const lspInitializedAtom = atom<boolean>(false);

export const languageClientAtom = atom<MonacoLanguageClient | null>(null);
