import { Fragment } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { useParams } from 'react-router-dom';
import { useGetPage } from '@/features/new-page';
import { PanelHandle } from '@/components/Panel';
import { NewSmartTable } from './NewSmartTable';

export const StackedTables = () => {
	const { pageId } = useParams();

	const { tables } = useGetPage(pageId);

	return (
		<PanelGroup autoSaveId="tables-panel" direction="vertical">
			{tables.map((table: any, index: any) => (
				<Fragment key={table.id}>
					<Panel>
						<NewSmartTable tableId={table.id} />
					</Panel>
					{index !== tables.length - 1 ? (
						<PanelHandle
							boxShadow="0 -1px 2px rgba(0,0,0,0.1)"
							direction="horizontal"
						/>
					) : null}
				</Fragment>
			))}
		</PanelGroup>
	);
};
