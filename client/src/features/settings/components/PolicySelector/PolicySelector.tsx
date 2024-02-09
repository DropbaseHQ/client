import { useEffect, useState } from 'react';
import { Select, Skeleton } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { useGetUserDetails, useUpdateUserPolicy } from '../../hooks/user';
import { useUpdateGroupPolicy, useGetGroup } from '../../hooks/group';
import { workspaceAtom } from '@/features/workspaces';

const PolicySelector = ({
	isLoaded,
	onChange,
	value,
}: {
	isLoaded: boolean;
	onChange: (e: any) => void;
	value: string;
}) => {
	return (
		<Skeleton isLoaded={isLoaded}>
			<Select onChange={onChange} value={value}>
				<option value="none">None</option>
				<option value="use">Use</option>
				<option value="edit">Edit</option>
				<option value="own">Own</option>
			</Select>
		</Skeleton>
	);
};

export const UserPolicySelector = ({ userId, appId }: { userId: string; appId: string }) => {
	const { id: workspaceId } = useAtomValue(workspaceAtom);
	const [option, setOption] = useState<string>('none');
	const updateUserPolicyMutation = useUpdateUserPolicy();
	const { permissions, isLoading: permissionsIsLoading } = useGetUserDetails({
		userId,
	});
	const policy = permissions?.find((item) => item.resource === appId);

	useEffect(() => {
		setOption(policy?.action || 'none');
	}, [policy]);

	const handleSelect = (e: any) => {
		setOption(e.target.value);
		updateUserPolicyMutation.mutate({
			workspaceId: workspaceId || '',
			userId,
			resource: appId,
			action: e.target.value,
		});
	};

	return (
		<PolicySelector isLoaded={!permissionsIsLoading} onChange={handleSelect} value={option} />
	);
};

export const GroupPolicySelector = ({ groupId, appId }: { groupId: string; appId: string }) => {
	const [option, setOption] = useState<string>('none');
	const updateGroupPolicyMutation = useUpdateGroupPolicy();
	const { permissions, isLoading } = useGetGroup({ groupId });
	const policy = permissions?.find((item) => item.resource === appId);

	useEffect(() => {
		setOption(policy?.action || 'none');
	}, [policy]);

	const handleSelect = (e: any) => {
		setOption(e.target.value);
		updateGroupPolicyMutation.mutate({
			groupId,
			resource: appId,
			action: e.target.value,
		});
	};
	return <PolicySelector isLoaded={!isLoading} onChange={handleSelect} value={option} />;
};
