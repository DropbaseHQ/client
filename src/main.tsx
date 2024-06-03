import ReactDOM from 'react-dom/client';
import { DashboardContainer } from './DashboardContainer';
import { WorkerDashboardRoutes } from './routes/WorkerDashboardRoutes';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<DashboardContainer>
		<WorkerDashboardRoutes />
	</DashboardContainer>,
);
