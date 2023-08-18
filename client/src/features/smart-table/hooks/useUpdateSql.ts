import { axios } from '@/lib/axios';
import { useMutation } from 'react-query';

const updateSql = async ({ sqlsId, code }: { sqlsId: string; code: string }) => {
	const response = await axios.put(`/sqls/${sqlsId}`, { code });
	return response.data;
};

export const useUpdateSql = (options?: {
	onSuccess?: (data: any) => void;
	onError?: (error: any) => void;
}) => {
	return useMutation(updateSql, options);
};
