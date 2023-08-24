import { axios } from '@/lib/axios';
import { useMutation } from 'react-query';

const deleteFunction = async (functionId: string) => {
	const { data } = await axios.delete(`/function/${functionId}`);
	return data;
};

export const useDeleteFunction = (props: any = {}) => {
	return useMutation(deleteFunction, props);
};
