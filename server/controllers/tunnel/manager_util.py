import functools


def clean_stale(func):
    # Decorator on methods of classes that implement
    # _should_clean(self) and _clean(self)
    @functools.wraps(func)
    def wrapped(self, *args, **kwargs):
        if self._should_clean():
            self.logger.info(
                f"Initiating clean (last clean at {self.get_last_clean()})."
            )
            self._clean()
        return func(self, *args, **kwargs)
    return wrapped
