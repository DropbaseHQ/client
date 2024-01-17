import { format, parse } from 'date-fns';

// converts epoch time to string of format yyyy-mm-dd
export const formatDate = (epoch: number) => {
	return format(new Date(epoch), 'yyyy-MM-dd');
};

// converts hh:mm:ss.ms to hh:mm:ss AM/PM
export const formatTime = (time: string) => {
	const date = parse(time.split('.')[0], 'HH:mm:ss', new Date());
	return format(date, 'hh:mm:ss a');
};

// converts epoch time to string of format yyyy-mm-dd hh:mm:ss AM/PM
export const formatDateTime = (epoch: number) => {
	return format(new Date(epoch), 'yyyy-MM-dd hh:mm:ss a');
};
