import { useMutation } from 'react-query';
import { axios } from '@/lib/axios';

const runFunction = async ({
	appId,
	userInput,
	row,
	functionCall,
}: {
	appId: string;
	userInput: any;
	row: any;
	functionCall: any;
}) => {
	const { data } = await axios.post('/task/function', {
		app_id: appId,
		user_input: userInput,
		row,
		function_call: functionCall,
	});
	return data;
};

export const useRunFunction = (props: any = {}) => {
	return useMutation(runFunction, props);
};
