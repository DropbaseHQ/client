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
					<Panel defaultSize={40}>
						<NewSmartTable tableId={table.id} />
					</Panel>
					{index !== tables.length - 1 ? <PanelHandle direction="horizontal" /> : null}
				</Fragment>
			))}
		</PanelGroup>
	);
};
