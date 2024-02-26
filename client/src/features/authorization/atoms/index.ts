import { atom } from 'jotai';

export const onboardingAtom = atom<{ name: string; last_name: string } | boolean>(false);
