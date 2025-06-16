from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated

from protheus.services import ProtheusService
from protheus.serializers import (
    StockSummarySerializer,
    StockMovementSerializer,
    SalesSumarySerializer
)


class StandardPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 1000


class StockView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        raw_data = ProtheusService.get_stock_summary()

        data = [
            {
                "code": item.get("codigo") or item.get("CODIGO"),
                "description": item.get("descricao") or item.get("DESCRICAO"),
                "balance": float(item.get("saldo") or item.get("SALDO") or 0),
            }
            for item in raw_data
        ]

        paginator = StandardPagination()
        paginated_data = paginator.paginate_queryset(data, request)
        serializer = StockSummarySerializer(paginated_data, many=True)

        return paginator.get_paginated_response(serializer.data)


class StockMovementView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 50))

        raw_data = ProtheusService.get_stock_movements(page=page, page_size=page_size)

        data = [
            {
                "code": item.get("D3_COD"),
                "movement_type": item.get("D3_TM"),
                "date": item.get("D3_EMISSAO"),
                "quantity": float(item.get("D3_QUANT") or 0),
                "fiscal_code": item.get("D3_CF") or "",
                "document": item.get("D3_DOC") or "",
                "location": item.get("D3_LOCAL") or "",
            }
            for item in raw_data
        ]

        serializer = StockMovementSerializer(data, many=True)
        return Response({
            "page": page,
            "page_size": page_size,
            "results": serializer.data
        })


class SalesView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        months = int(request.query_params.get("meses", 4))
        raw_data = ProtheusService.get_sales_summary(months=months)

        data = [
            {
                "code": item.get("codigo") or item.get("CODIGO"),
                "description": item.get("descricao") or item.get("DESCRICAO"),
                "quantity": float(item.get("quantidade") or item.get("QUANTIDADE") or 0),
                "value": float(item.get("valor") or item.get("VALOR") or 0),
            }
            for item in raw_data
        ]

        paginator = StandardPagination()
        paginated_data = paginator.paginate_queryset(data, request)
        serializer = SalesSumarySerializer(paginated_data, many=True)

        return paginator.get_paginated_response(serializer.data)
