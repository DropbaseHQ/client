import { format, parse } from 'date-fns';

const convertToUTC = (epoch: string) =>
	new Date(parseInt(epoch, 10) + new Date().getTimezoneOffset() * 60 * 1000);

// converts epoch time to string of format yyyy-mm-dd
export const formatDate = (epoch: string) => {
	try {
		return format(convertToUTC(epoch), 'yyyy-MM-dd');
	} catch (e) {
		return epoch;
	}
};

// converts hh:mm:ss.ms to hh:mm:ss AM/PM
export const formatTime = (time: string) => {
	try {
		const date = parse(time.split('.')[0], 'HH:mm:ss', new Date());
		return format(date, 'hh:mm:ss a');
	} catch (e) {
		return time;
	}
};

// converts epoch time to string of format yyyy-mm-dd hh:mm:ss AM/PM
export const formatDateTime = (epoch: string) => {
	try {
		return format(convertToUTC(epoch), 'yyyy-MM-dd hh:mm:ss a');
	} catch (e) {
		return epoch;
	}
};
