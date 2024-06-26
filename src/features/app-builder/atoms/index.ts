import { atom } from 'jotai';

export const developerTabAtom = atom<any>({
	type: 'python',
	id: 'main',
});

export const inspectedResourceAtom = atom<any>({
	type: null,
	id: null,
	meta: null,
});

export const selectedTableIdAtom = atom((get) => {
	const devTab = get(inspectedResourceAtom);

	return devTab.type === 'table' ? devTab.id : null;
});

export const previewCodeAtom = atom<any>({
	name: null,
	code: null,
});

export type Log = {
	meta?: { [key: string]: any };
	message: string;
	stdout: string;
	traceback: string;
	type?: string;
	time?: any;

	preview?: {
		rows: any;
		columns: any;
		type: any;
	};
};

type Logs = {
	logs: Log[];
};

export const readWriteLogsAtom = atom<Logs>({
	logs: [],
});

export const logsAtom = atom(
	(get) => get(readWriteLogsAtom),
	(get, set, log: Log) => {
		const currentLogs = get(readWriteLogsAtom).logs;
		set(readWriteLogsAtom, { logs: [{ ...log, time: Date.now() }, ...currentLogs] });
	},
);
