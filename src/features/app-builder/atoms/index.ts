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

type Log = {
	meta?: { [key: string]: any };
	log: string;
	preview?: {
		rows: any;
		columns: any;
		type: any;
	};
	time?: any;
};

type Logs = {
	logs: Log[];
};

const readWriteLogsAtom = atom<Logs>({
	logs: [],
});

export const logsAtom = atom(
	(get) => get(readWriteLogsAtom),
	(get, set, log: Log) => {
		const currentLogs = get(readWriteLogsAtom).logs;

		set(readWriteLogsAtom, { logs: [...currentLogs, { ...log, time: Date.now() }] });
	},
);
