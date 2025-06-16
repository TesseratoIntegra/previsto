from django.db.backends.oracle.base import DatabaseWrapper


def patch_oracle_version_check():
    def _skip_check(self):
        pass

    DatabaseWrapper.check_database_version_supported = _skip_check
