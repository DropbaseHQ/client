import { format } from 'date-fns';

// converts epoch time to string of format yyyy-mm-dd
export const formatDate = (epoch: number) => {
	return format(new Date(epoch), 'yyyy-MM-dd');
};

// converts hh:mm:ss.ms to hh:mm:ss AM/PM
export const formatTime = (time: string) => {
	let [hours, mins, secs] = time.split(':');
	const suffix = parseInt(hours, 10) >= 12 ? 'PM' : 'AM';
	hours = String(parseInt(hours, 10) % 12).padStart(2, '0');
	if (hours === '00') hours = '12';
	mins = String(Math.round(parseInt(mins, 10))).padStart(2, '0');
	secs = String(Math.round(parseInt(secs, 10))).padStart(2, '0');

	return `${hours}:${mins}:${secs} ${suffix}`;
};

// converts epoch time to string of format yyyy-mm-dd hh:mm:ss AM/PM
export const formatDateTime = (epoch: number) => {
	return format(new Date(epoch), 'yyyy-MM-dd hh:mm:ss a');
};
