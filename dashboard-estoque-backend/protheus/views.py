from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated

from protheus.models import ProtheusSB1, ProtheusSB2, ProtheusSD3

from protheus.serializers import ProtheusSB1Serializer, ProtheusSB2Serializer, ProtheusSD3Serializer



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
    filterset_fields = ['B2_FILIAL', 'B2_LOCAL']
    # permission_classes = [IsAuthenticated]


class StockMovementView(ListAPIView):
    """
    Lista as movimentações de estoque (SD3), ordenadas por data decrescente.
    """
    queryset = ProtheusSD3.objects.all()
    serializer_class = ProtheusSD3Serializer
    pagination_class = StandardPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['D3_COD', 'D3_DOC', 'D3_LOCAL']
    # permission_classes = [IsAuthenticated]


class ProductView(ListAPIView):
    """
    Lista os produtos cadastrados (SB1).
    """
    queryset = ProtheusSB1.objects.all()
    serializer_class = ProtheusSB1Serializer
    pagination_class = StandardPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['B1_COD', 'B1_FILIAL', 'B1_TIPO']
    # permission_classes = [IsAuthenticated]
