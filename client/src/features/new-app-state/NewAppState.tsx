import { useParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { Box, Skeleton } from '@chakra-ui/react';

import { useAppState } from './hooks';
import { ObjectRenderer } from '@/components/ObjectRenderer';
import { newSelectedRow, newUserInput } from '@/features/new-app-state';

export const NewAppState = () => {
	const { pageId } = useParams();
	const {
		isLoading,
		state: { tables, user_input: serverInputs, ...data },
	} = useAppState(pageId || '');

	const [selectedRowData, setRowData] = useAtom(newSelectedRow);
	const [userInput, setUserInput] = useAtom(newUserInput) as any;

	useEffect(() => {
		setRowData(tables as any);
	}, [tables, setRowData]);

	useEffect(() => {
		setUserInput(serverInputs as any);
	}, [serverInputs, setUserInput]);

	if (isLoading) {
		return <Skeleton />;
	}

	return (
		<Box p="2" bg="white" h="full" overflowY="auto">
			<ObjectRenderer
				obj={{
					user_input: userInput,
					tables: selectedRowData || {},
					...data,
				}}
			/>
		</Box>
	);
};
