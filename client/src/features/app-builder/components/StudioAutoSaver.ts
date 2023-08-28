import { useState, useEffect, useRef } from 'react';
import { useGetPage } from '@/features/app/hooks';
import { useParams } from 'react-router-dom';
import { useSaveStudio } from '../hooks/useSaveStudio';
import { useAtom } from 'jotai';
import { fetchersAtom, uiCodeAtom } from '../atoms/tableContextAtoms';

export const StudioAutoSaver = () => {
	const [fetchersChanged, setFetchersChanged] = useState(false);
	const [uiCodeChanged, setUiCodeChanged] = useState(false);

	const { pageId } = useParams();
	const { fetchers: savedFetchers, uiComponents, isSuccess } = useGetPage(pageId || '');

	const { saveFetchers, saveUICode } = useSaveStudio();

	const [fetchers] = useAtom(fetchersAtom);
	const [uiCode] = useAtom(uiCodeAtom);

	const timeoutIdRef = useRef<any>(null);
	const delay = 3000;

	const handleDataChange = () => {
		if (timeoutIdRef.current) {
			clearTimeout(timeoutIdRef.current);
		}
		timeoutIdRef.current = setTimeout(async () => {
			timeoutIdRef.current = null;
			if (fetchersChanged) {
				await saveFetchers();
				setFetchersChanged(false);
			}
			if (uiCodeChanged) {
				await saveUICode();
				setUiCodeChanged(false);
			}
		}, delay);
	};

	useEffect(() => {
		const currentUIComponent = uiComponents?.[0];

		const fetchersDidChange = () => {
			return savedFetchers.some((savedFetcher: any) => {
				if (savedFetcher.id in fetchers) {
					const matchingFetcherCode = fetchers[savedFetcher.id];
					if (matchingFetcherCode !== savedFetcher?.code) {
						return true;
					}
				}
			});
		};
		const uiCodeDidChange = uiCode !== currentUIComponent?.code;
		if (fetchersDidChange() && isSuccess) {
			setFetchersChanged(true);
			handleDataChange();
		}
		if (uiCodeDidChange && isSuccess) {
			setUiCodeChanged(true);
			handleDataChange();
		}
	}, [fetchers, savedFetchers, uiCode]);

	return null;
};
