from server.crud.base import CRUDBase
from server.models import Page


class CRUDPage(CRUDBase[Page, Page, Page]):
    pass


page = CRUDPage(Page)
