from server.crud.base import CRUDBase
from server.models import App


class CRUDApp(CRUDBase[App, App, App]):
    pass


app = CRUDApp(App)
