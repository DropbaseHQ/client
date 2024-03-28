import { format, parse } from 'date-fns';

const getDateInitiator = (epoch: any) => {
	if (Number.isFinite(+epoch)) {
		return +epoch;
	}
	return epoch;
};

const convertToUTC = (dateInstance: any) =>
	new Date(new Date(dateInstance).getTime() + new Date().getTimezoneOffset() * 60 * 1000);

const convertToLocal = (epoch: any) =>
	new Date(getDateInitiator(epoch) - new Date().getTimezoneOffset() * 60 * 1000);

const isValidDate = (d: any) => {
	if (Object.prototype.toString.call(d) === '[object Date]') {
		// it is a date
		if (Number.isFinite(+d)) {
			return true;
		}
		return false;
	}

	return false;
};

export const getDateInstance = (string: any) => {
	try {
		const epochDate = new Date(+string);

		if (isValidDate(epochDate)) {
			return epochDate;
		}

		const stringDate = new Date(string);

		return stringDate;
	} catch (e) {
		return string;
	}
};

// converts epoch time to string of format dd-MM-YYYY
export const formatDate = (epoch: string) => {
	const dateInstance = getDateInstance(epoch);

	try {
		return format(convertToUTC(dateInstance), 'dd-MM-yyyy');
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
	const dateInstance = getDateInstance(epoch);

	try {
		return format(convertToUTC(dateInstance), 'yyyy-MM-dd hh:mm:ss a');
	} catch (e) {
		return epoch;
	}
};

export const formatDateForInput = (epoch: number) => {
	const dateInstance = getDateInstance(epoch);

	try {
		return format(convertToUTC(dateInstance), "yyyy-MM-dd'T'hh:mm").slice(0, 10);
	} catch (e) {
		return epoch.toString();
	}
};

export const formatDateTimeForInput = (epoch: number) => {
	const dateInstance = getDateInstance(epoch);

	try {
		return format(convertToUTC(dateInstance), "yyyy-MM-dd'T'hh:mm");
	} catch (e) {
		return epoch.toString();
	}
};
