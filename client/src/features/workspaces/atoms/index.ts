import { atomWithStorage } from 'jotai/utils';

export const workspaceAtom = atomWithStorage<{
	id: string | null;
	name?: string;
	owner?: {
		id: string;
		email: string;
	};
	worker_url?: string;
	in_trial?: boolean;
	trial_end_date?: string;
}>('workspaceId', {
	id: null,
});
