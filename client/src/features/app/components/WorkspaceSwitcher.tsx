import {
	Button,
	Popover,
	PopoverTrigger,
	PopoverContent,
	PopoverBody,
	PopoverArrow,
	HStack,
	Flex,
	Text,
	Tag,
} from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { Monitor, Check } from 'react-feather';
import { useWorkspaces, workspaceAtom } from '@/features/workspaces';

const WorkspaceCard = ({ workspace }: any) => {
	const [currentWorkspace, updateWorkspace] = useAtom(workspaceAtom);
	const handleSwitchWorkspace = () => {
		updateWorkspace(workspace);
	};

	return (
		<Button
			variant="ghost"
			w="full"
			justifyContent="flex-start"
			textAlign="left"
			onClick={handleSwitchWorkspace}
		>
			<Flex alignItems="center" justifyContent="space-between" w="full">
				<HStack spacing="4">
					<Monitor size="24" />
					<Text fontSize="md">{workspace?.name}</Text>
					<Tag size="sm" textTransform="capitalize">
						{workspace?.role_name}
					</Tag>
				</HStack>

				{currentWorkspace?.id === workspace?.id && <Check size="16" />}
			</Flex>
		</Button>
	);
};
export const WorkspaceSwitcher = ({ trigger }: any) => {
	const { workspaces } = useWorkspaces();
	return (
		<Popover placement="right">
			<PopoverTrigger>{trigger}</PopoverTrigger>
			<PopoverContent>
				<PopoverArrow />
				<PopoverBody>
					{workspaces?.map((workspace: any) => (
						<WorkspaceCard key={workspace?.name} workspace={workspace} />
					))}
				</PopoverBody>
			</PopoverContent>
		</Popover>
	);
};
