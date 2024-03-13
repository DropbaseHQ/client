import {
	Accordion,
	AccordionButton,
	AccordionItem,
	AccordionPanel,
	Box,
	IconButton,
	Tooltip,
} from '@chakra-ui/react';
import { RotateCw } from 'react-feather';
import { useAtomValue } from 'jotai';
import { AppState, useInitializePageState } from '@/features/app-state';
import { pageAtom } from '@/features/page';
import { FilesExplorer } from '../FilesExplorer';
import { NewFile } from '../FilesExplorer/NewFile';

const AccordionTitle = ({ children }: any) => {
	return (
		<Box flexShrink="0" fontSize="sm" fontWeight="semibold">
			{children}
		</Box>
	);
};

export const BuilderSidebar = () => {
	const { pageName, appName } = useAtomValue(pageAtom);
	const { isRefetching, refetch } = useInitializePageState(appName || '', pageName || '');

	return (
		<Accordion h="full" overflowY="auto" allowMultiple>
			<AccordionItem borderTopWidth="0">
				{({ isExpanded }) => (
					<>
						<AccordionButton
							borderBottomWidth={isExpanded ? '1px' : '0'}
							px="2"
							flex="1"
						>
							<AccordionTitle>Files</AccordionTitle>
							<NewFile variant="outline" size="2xs" ml="auto" colorScheme="gray" />
						</AccordionButton>
						<AccordionPanel p={2}>
							<FilesExplorer />
						</AccordionPanel>
					</>
				)}
			</AccordionItem>
			<AccordionItem>
				<AccordionButton px="2" flex="1">
					<AccordionTitle>State & Context</AccordionTitle>
					<Tooltip label="Re-sync state & context data">
						<IconButton
							flexShrink="0"
							ml="auto"
							aria-label="Re-sync state & context data"
							size="2xs"
							colorScheme="gray"
							icon={<RotateCw size="12" />}
							variant="outline"
							isLoading={isRefetching}
							onClick={(e) => {
								e.stopPropagation();
								refetch();
							}}
						/>
					</Tooltip>
				</AccordionButton>
				<AccordionPanel borderTopWidth="1px" p="1">
					<AppState />
				</AccordionPanel>
			</AccordionItem>
		</Accordion>
	);
};
