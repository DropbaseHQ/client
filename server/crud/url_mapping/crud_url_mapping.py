from server.crud.base import CRUDBase
from server.models import URLMapping
from server.schemas import CreateURLMapping, UpdateURLMapping


class CRUDUrlMapping(CRUDBase[URLMapping, CreateURLMapping, UpdateURLMapping]):
    pass


url_mapping = CRUDUrlMapping(URLMapping)
