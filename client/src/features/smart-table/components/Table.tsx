import { useParams } from 'react-router-dom';
import { Skeleton } from '@chakra-ui/react';

import { useTableData } from '../hooks/useTableData';

export const Table = () => {
	const { appId } = useParams();
	const { isLoading, rows, columns } = useTableData(appId);

	if (isLoading) {
		return <Skeleton isLoaded={isLoading} w="full" h="md" />;
	}

	return (
		<pre>
			{JSON.stringify(
				{
					rows,
					columns,
				},
				null,
				4,
			)}
		</pre>
	);
};
