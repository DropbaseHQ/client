import ReactDOM from 'react-dom/client';
import { DashboardContainer } from './DashboardContainer';
import { FreeDashboardRoutes } from './routes/FreeDashboardRoutes';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<DashboardContainer>
		<FreeDashboardRoutes />
	</DashboardContainer>,
);
