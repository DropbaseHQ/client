import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useGetPage } from '@/features/page';

export const WIDGET_PREVIEW_QUERY_KEY = 'widget/preview';

export const useGetWidgetPreview = (widgetName: string) => {
	const { appName, pageName } = useParams();

	const { widgets, ...rest } = useGetPage({ appName, pageName });

	const info = useMemo(() => {
		return (
			widgets.find((w: any) => w.name === widgetName) || {
				components: [],
				name: '',
			}
		);
	}, [widgets, widgetName]);

	return {
		...rest,
		...info,
	};
};
