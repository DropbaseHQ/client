from sqlalchemy.orm import Session

from server.crud.base import CRUDBase
from server.models import WorkerStatus
from server.schemas.worker_status import CreateWorkerStatus, UpdateWorkerStatus


class CRUDWorkerStatus(CRUDBase[WorkerStatus, CreateWorkerStatus, UpdateWorkerStatus]):
    pass


worker_status = CRUDWorkerStatus(WorkerStatus)
