import { useMutation } from 'react-query';
import { axios } from '@/lib/axios';

const runFunction = async ({
	pageId,
	userInput,
	row,
	functionCall,
}: {
	pageId: string;
	userInput: any;
	row: any;
	functionCall: any;
}) => {
	const { data } = await axios.post('/task', {
		page_id: pageId,
		user_input: userInput,
		row,
		action: functionCall,
		call_type: 'function',
	});
	return data;
};

export const useRunFunction = (props: any = {}) => {
	return useMutation(runFunction, props);
};
