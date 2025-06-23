from django_filters import rest_framework as filters

from protheus.models import ProtheusSD3, ProtheusSB1, ProtheusSB2


class StockMovementFilter(filters.FilterSet):
    """
    Filtros personalizados para os campos da tabela ProtheusSD3 (movimentações de estoque).

    Todos os filtros aplicam .strip() e lookup com 'startswith', garantindo compatibilidade
    com colunas do tipo CHAR no Oracle, que possuem preenchimento por espaços à direita.
    """

    D3_COD = filters.CharFilter(method='filter_cod')
    D3_DOC = filters.CharFilter(method='filter_doc')
    D3_LOCAL = filters.CharFilter(method='filter_local')
    D3_TM = filters.CharFilter(method='filter_tm')

    def filter_cod(self, queryset, name, value):
        return queryset.filter(**{f"{name}__startswith": value.strip()})

    def filter_doc(self, queryset, name, value):
        return queryset.filter(**{f"{name}__startswith": value.strip()})

    def filter_local(self, queryset, name, value):
        return queryset.filter(**{f"{name}__startswith": value.strip()})

    def filter_tm(self, queryset, name, value):
        return queryset.filter(**{f"{name}__startswith": value.strip()})

    class Meta:
        model = ProtheusSD3
        fields = ['D3_COD', 'D3_DOC', 'D3_LOCAL', 'D3_TM']


class ProductFilter(filters.FilterSet):
    """
    Filtros personalizados para os campos da tabela ProtheusSB1 (produtos cadastrados).
    
    Todos os filtros aplicam .strip() e lookup com 'startswith', garantindo compatibilidade
    com colunas do tipo CHAR no Oracle, que possuem preenchimento por espaços à direita.
    """

    B1_COD = filters.CharFilter(method='filter_cod')
    B1_FILIAL = filters.CharFilter(method='filter_filial')
    B1_TIPO = filters.CharFilter(method='filter_tipo')

    def filter_cod(self, queryset, name, value):
        return queryset.filter(**{f"{name}__startswith": value.strip()})

    def filter_filial(self, queryset, name, value):
        return queryset.filter(**{f"{name}__startswith": value.strip()})

    def filter_tipo(self, queryset, name, value):
        return queryset.filter(**{f"{name}__startswith": value.strip()})

    class Meta:
        model = ProtheusSB1
        fields = ['B1_COD', 'B1_FILIAL', 'B1_TIPO']


class StockFilter(filters.FilterSet):
    """
    Filtros personalizados para os campos da tabela ProtheusSB2 (saldos em estoque).

    Todos os filtros aplicam .strip() e lookup com 'startswith', garantindo compatibilidade
    com colunas do tipo CHAR no Oracle, que possuem preenchimento por espaços à direita.
    """

    B2_FILIAL = filters.CharFilter(method='filter_filial')
    B2_COD = filters.CharFilter(method='filter_cod')
    B2_LOCAL = filters.CharFilter(method='filter_local')

    def filter_filial(self, queryset, name, value):
        return queryset.filter(**{f"{name}__startswith": value.strip()})

    def filter_cod(self, queryset, name, value):
        return queryset.filter(**{f"{name}__startswith": value.strip()})

    def filter_local(self, queryset, name, value):
        return queryset.filter(**{f"{name}__startswith": value.strip()})

    class Meta:
        model = ProtheusSB2
        fields = ['B2_FILIAL', 'B2_COD', 'B2_LOCAL']
