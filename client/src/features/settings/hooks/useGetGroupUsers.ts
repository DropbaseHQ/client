import { axios } from '@/lib/axios';
import { useQuery } from 'react-query';

export type GroupUsers = {
	id: string;
	email: string;
	name: string;
	role: string;
};

const fetchGroupUsers = async ({ groupId }: { groupId: string }) => {
	const { data } = await axios.get<GroupUsers[]>(`/group/${groupId}/users`);
	return data;
};

export const useGetGroupUsers = ({ groupId }: { groupId: any }) => {
	const queryKey = ['groupUsers', groupId];
	const { data: response, ...rest } = useQuery(queryKey, () => fetchGroupUsers({ groupId }), {
		enabled: !!groupId,
	});
	return {
		users: response || [],
		...rest,
	};
};
