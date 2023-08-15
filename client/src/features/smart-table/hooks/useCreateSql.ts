import { axios } from '@/lib/axios';
import { useMutation } from 'react-query';

const createSql = async ({ code, appId }: { code:string; appId:string }) => {
    const response = await axios.post(`/sqls`, { code, app_id: appId });
    return response.data;
}
export const useCreateSql = () => {
    return useMutation(createSql);

}
