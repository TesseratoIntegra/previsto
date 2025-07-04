class ProtheusRouter:
    """
    Um roteador de banco de dados para garantir que apenas as models da app 'protheus'
    usem o banco de dados Oracle.
    """

    def db_for_read(self, model, **hints):
        if model._meta.app_label == 'protheus':
            return 'protheus'
        return None

    def db_for_write(self, model, **hints):
        if model._meta.app_label == 'protheus':
            return 'protheus'
        return None

    def allow_relation(self, obj1, obj2, **hints):
        if obj1._meta.app_label == 'protheus' or obj2._meta.app_label == 'protheus':
            return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label == 'protheus':
            return db == 'protheus'
        return db == 'default'
