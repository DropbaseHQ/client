import { format, parse } from 'date-fns';

const getDateInitiator = (epoch: any) => {
	if (Number.isFinite(+epoch)) {
		return +epoch;
	}
	return epoch;
};

const convertToUTC = (epochMillis: string) => {
	// Directly create a Date object assuming epochMillis is in UTC
	return new Date(parseInt(epochMillis, 10));
};

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

const getDateInstanceFromEpoch = (epochMillis) => new Date(parseInt(epochMillis, 10));

export const formatDate = (epoch) => {
	try {
		const dateInstance = getDateInstanceFromEpoch(epoch);
		const formattedInstance = format(dateInstance, 'dd-MM-yyyy');

		if (isNaN(dateInstance.getTime())) {
			throw new Error('Invalid date');
		}

		return formattedInstance;
	} catch (e) {
		return epoch;
	}
};

export const formatTime = (time: string) => {
	try {
		const date = parse(time.split('.')[0], 'HH:mm:ss', new Date());
		return format(date, 'hh:mm:ss a');
	} catch (e) {
		return time;
	}
};

export const getEpochFromTimeString = (time: string) => {
	try {
		const utcDate = parse(time.split('.')[0], 'HH:mm:ss', new Date()).getTime();
		const localDate = convertToLocal(utcDate).getTime();
		if (Number.isNaN(localDate)) throw new Error('Invalid date');
		return localDate;
	} catch (e) {
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
		const utcDate = convertToUTC(epoch);
		const formattedDate = format(utcDate, 'yyyy-MM-dd hh:mm:ss a');

		return formattedDate;
	} catch (e) {
		return epoch;
	}
};
