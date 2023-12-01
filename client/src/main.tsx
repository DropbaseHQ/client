import React from 'react';
import ReactDOM from 'react-dom/client';
import { PostHogProvider } from 'posthog-js/react';

const options = {
	api_host: import.meta.env.VITE_REACT_APP_PUBLIC_POSTHOG_HOST,
};

import { Dashboard } from './Dashboard';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<PostHogProvider
			apiKey={import.meta.env.VITE_REACT_APP_PUBLIC_POSTHOG_KEY}
			options={options}
		>
			<Dashboard />
		</PostHogProvider>
	</React.StrictMode>,
);
