from datetime import date

from dateutil.relativedelta import relativedelta

from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination

from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import OuterRef, Exists

from protheus.models import ProtheusSB1, ProtheusSB2, ProtheusSD3
from protheus.serializers import ProtheusSB1Serializer, ProtheusSB2Serializer, ProtheusSD3Serializer
from protheus.filters import StockMovementFilter, ProductFilter, StockFilter


class StandardPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 1000


class StockView(ListAPIView):
    """
    Lista os saldos de estoque (SB2).
    """
    queryset = ProtheusSB2.objects.all()
    serializer_class = ProtheusSB2Serializer
    pagination_class = StandardPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = StockFilter
    # permission_classes = [IsAuthenticated]


class StockMovementView(ListAPIView):
    """
    Lista as movimentações de estoque (SD3), ordenadas por data decrescente.
    """
    queryset = ProtheusSD3.objects.all()
    serializer_class = ProtheusSD3Serializer
    pagination_class = StandardPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = StockMovementFilter
    # permission_classes = [IsAuthenticated]

    def get_queryset(self):
        today = date.today()
        four_months_ago = today - relativedelta(months=1)
        queryset = ProtheusSD3.objects.filter(D3_EMISSAO__gte=four_months_ago)

        return self.filter_queryset(queryset).order_by('-D3_EMISSAO')


class ProductView(ListAPIView):
    """
    Lista os produtos cadastrados (SB1).
    """
    queryset = ProtheusSB1.objects.all()
    serializer_class = ProtheusSB1Serializer
    pagination_class = StandardPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = ProductFilter
    # permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ProtheusSB1.objects.all()
        queryset = self.filter_queryset(queryset)

        has_movement_param = self.request.query_params.get('has_movement')
        if has_movement_param is not None:
            movement_exists = Exists(
                ProtheusSD3.objects.filter(D3_COD=OuterRef('B1_COD'))
            )
            queryset = queryset.annotate(has_movement=movement_exists)

            if has_movement_param.lower() == 'true':
                queryset = queryset.filter(has_movement=True)
            elif has_movement_param.lower() == 'false':
                queryset = queryset.filter(has_movement=False)

        return queryset
