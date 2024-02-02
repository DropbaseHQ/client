import { atomWithStorage } from 'jotai/utils';

export const workspaceAtom = atomWithStorage<{
	id: string | null;
	name?: string;
	owner?: {
		id: string;
		email: string;
	};
	workerUrl?: string;
	inTrial?: boolean;
	trialEndDate?: string;
}>('workspaceId', {
	id: null,
});
