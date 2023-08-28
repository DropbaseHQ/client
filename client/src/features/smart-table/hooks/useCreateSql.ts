import { useMutation } from 'react-query';
import { axios } from '@/lib/axios';

const createSql = async ({ code, pageId }: { code: string; pageId: string }) => {
	const response = await axios.post(`/sqls`, { code, page_id: pageId });
	return response.data;
};

export const useCreateSql = (options?: {
	onSuccess?: (data: any) => void;
	onError?: (error: any) => void;
}) => {
	return useMutation(createSql, options);
};
