import {
	Button,
	ButtonGroup,
	PopoverBody,
	PopoverCloseButton,
	PopoverContent,
	PopoverFooter,
	PopoverHeader,
	useDisclosure,
} from '@chakra-ui/react';
import { useAtomValue } from 'jotai';

import { Zap } from 'react-feather';
import { useParams } from 'react-router-dom';
import { useCallback, useMemo, useRef } from 'react';

import { useToast } from '@/lib/chakra-ui';

import { getErrorMessage } from '@/utils';

import { useConvertSmartTable, useGetTable } from '@/features/app-builder/hooks';
import { pageStateContextAtom } from '@/features/app-state';

export const useConvertPopover = (tableName: any) => {
	const toast = useToast();

	const { isOpen, onOpen, onClose } = useDisclosure();

	const { table } = useGetTable(tableName || '');
	const tableRef = useRef<any>();
	tableRef.current = table;

	const { appName, pageName } = useParams();

	const pageStateContext = useAtomValue(pageStateContextAtom);

	const pageRef = useRef<any>(pageStateContext);
	pageRef.current = pageStateContext;

	const convertMutation = useConvertSmartTable({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'SmartTable converted',
			});
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to convert table',
				description: getErrorMessage(error),
			});
		},
		table: table?.name,
	});

	const handleConvert = useCallback(() => {
		convertMutation.mutate({
			table: tableRef.current,
			state: pageRef?.current?.state,
			appName,
			pageName,
		});
	}, [convertMutation, appName, pageName]);

	const renderPopoverContent = useCallback(() => {
		return (
			<PopoverContent zIndex="popover" mt="-2">
				<PopoverHeader fontWeight="semibold" fontSize="md">
					Convert to Smart Table
				</PopoverHeader>

				<PopoverCloseButton size="xs" />
				<PopoverBody fontSize="sm">
					Convert to smart table to enable filter, sorts and editing cells
				</PopoverBody>
				<PopoverFooter display="flex" justifyContent="flex-end">
					<ButtonGroup size="sm">
						<Button
							isLoading={convertMutation.isLoading}
							onClick={handleConvert}
							colorScheme="gray"
							variant="outline"
							leftIcon={<Zap size="14" />}
						>
							Convert to Smart Table
						</Button>
					</ButtonGroup>
				</PopoverFooter>
			</PopoverContent>
		);
	}, [handleConvert, convertMutation.isLoading]);

	return useMemo(
		() => ({
			renderPopoverContent,
			isOpen,
			onOpen,
			onClose,
		}),
		[renderPopoverContent, isOpen, onOpen, onClose],
	);
};
