from datetime import date, timedelta

from dateutil.relativedelta import relativedelta

from rest_framework.generics import ListAPIView

from django_filters.rest_framework import DjangoFilterBackend

from protheus.models import ProtheusSB1, ProtheusSB2, ProtheusSD3
from protheus.serializers import ProtheusSB1Serializer, ProtheusSB2Serializer, ProtheusSD3Serializer
from protheus.filters import StockMovementFilter, ProductFilter, StockFilter
from protheus.pagination import StandardPagination


class StockView(ListAPIView):
    """
    Lista os saldos de estoque (SB2).
    """
    queryset = ProtheusSB2.objects.all()
    serializer_class = ProtheusSB2Serializer
    pagination_class = StandardPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = StockFilter

    def get_queryset(self):
        queryset = ProtheusSB2.objects.exclude(D_E_L_E_T='*')
        return self.filter_queryset(queryset)


class StockMovementView(ListAPIView):
    """
    Lista as movimentações de estoque (SD3), ordenadas por data decrescente.
    """
    queryset = ProtheusSD3.objects.all()
    serializer_class = ProtheusSD3Serializer
    pagination_class = StandardPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = StockMovementFilter

    def get_queryset(self):
        today = date.today()
        three_days_ago = today - timedelta(days=2)  # Inclui hoje, ontem e anteontem

        queryset = ProtheusSD3.objects.filter(
            D3_EMISSAO__range=(three_days_ago, today)
        ).exclude(
            **{'D_E_L_E_T': '*'}
        )

        return self.filter_queryset(queryset).order_by('-D3_EMISSAO')

    # def get_queryset(self):
    #     today = date.today()
    #     four_months_ago = today - relativedelta(months=1)
    #     queryset = ProtheusSD3.objects.filter(
    #         D3_EMISSAO__gte=four_months_ago
    #     ).exclude(
    #         **{'D_E_L_E_T': '*'}
    #     )

    #     return self.filter_queryset(queryset).order_by('-D3_EMISSAO')


class ProductView(ListAPIView):
    """
    Lista os produtos cadastrados (SB1).
    """
    queryset = ProtheusSB1.objects.all()
    serializer_class = ProtheusSB1Serializer
    pagination_class = StandardPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = ProductFilter
