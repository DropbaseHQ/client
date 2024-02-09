import { format, parse } from 'date-fns';

const convertToUTC = (epoch: string) =>
	new Date(parseInt(epoch, 10) + new Date().getTimezoneOffset() * 60 * 1000);

const convertToLocal = (epoch: number) =>
	new Date(epoch - new Date().getTimezoneOffset() * 60 * 1000);

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

// converts hh:mm:ss.ms to epoch seconds
export const getEpochFromTimeString = (time: string) => {
	try {
		const utcDate = parse(time.split('.')[0], 'HH:mm:ss', new Date()).getTime();
		const localDate = convertToLocal(utcDate).getTime();
		if (Number.isNaN(localDate)) throw new Error('Invalid date');
		return localDate;
	} catch (e) {
		// fall back on current time if time string is invalid or null
		return new Date().getTime();
	}
};

// converts epoch seconds to hh:mm:ss.ms
export const getTimeStringFromEpoch = (epoch: string) => {
	try {
		return format(convertToUTC(epoch), 'HH:mm:ss');
	} catch (e) {
		// fall back on empty string if epoch is null
		return '';
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
