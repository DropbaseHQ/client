import { useMutation } from 'react-query';
import { axios } from '@/lib/axios';

const runFunction = async ({
	pageId,
	userInput,
	row,
	functionCall,
	callType,
}: {
	pageId: string;
	userInput: any;
	row: any;
	functionCall: any;
	callType?: string;
}) => {
	const { data } = await axios.post('/task/', {
		page_id: pageId,
		user_input: userInput,
		row,
		action: functionCall,
		call_type: callType || 'function',
	});
	return data;
};

export const useRunFunction = (props: any = {}) => {
	return useMutation(runFunction, props);
};
