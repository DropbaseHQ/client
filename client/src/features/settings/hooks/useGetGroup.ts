import { axios } from '@/lib/axios';
import { useQuery } from 'react-query';

export type GroupResponse = {
	group: {
		id: string;
		name: string;
		workspace_id: string;
	};
	permissions: {
		group_id: string;
		resource: string;
		action: string;
	}[];
};

const fetchGroup = async ({ groupId }: { groupId: string }) => {
	const { data } = await axios.get<GroupResponse>(`/group/${groupId}`);
	return data;
};

export const useGetGroup = ({ groupId }: { groupId: any }) => {
	const queryKey = ['group', groupId];
	const { data: response, ...rest } = useQuery(queryKey, () => fetchGroup({ groupId }));
	return {
		group: response?.group || {},
		permissions: response?.permissions || [],
		...rest,
	};
};
