from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated

from protheus.services import ProtheusService
from protheus.serializers import (
    StockSummarySerializer,
    StockMovementSerializer,
    SalesSumarySerializer,
    DeliverySummarySerializer,
)


class StandardPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 1000

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'page_size': self.get_page_size(self.request),
            'results': data
        })


class StockView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            filial_filter = request.query_params.get('filial', '')
            armazem_filter = request.query_params.get('armazem', '')
            
            print(f"📦 StockView - Filtros: filial={filial_filter}, armazem={armazem_filter}")
            
            # Buscar dados com filtros aplicados
            raw_data = ProtheusService.get_stock_summary(
                filial=filial_filter if filial_filter else None,
                armazem=armazem_filter if armazem_filter else None
            )

            data = []
            for item in raw_data:
                try:
                    formatted_item = {
                        "code": str(item.get("code", "")),
                        "description": str(item.get("description", "")),
                        "balance": float(item.get("balance", 0)),
                        "filial": str(item.get("filial", "")),
                        "local": str(item.get("local", "")),
                    }
                    data.append(formatted_item)
                    
                except (ValueError, TypeError) as e:
                    print(f"❌ Erro ao processar item de estoque: {e}")
                    continue

            print(f"✅ StockView - {len(data)} itens processados")

            # Aplicar paginação
            paginator = StandardPagination()
            paginated_data = paginator.paginate_queryset(data, request)
            serializer = StockSummarySerializer(paginated_data, many=True)

            return paginator.get_paginated_response(serializer.data)
            
        except Exception as e:
            print(f"❌ Erro na StockView: {e}")
            return Response({
                'error': f'Erro ao buscar dados de estoque: {str(e)}',
                'count': 0,
                'next': None,
                'previous': None,
                'total_pages': 0,
                'current_page': 1,
                'page_size': 50,
                'results': []
            }, status=500)


class SalesView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            months = int(request.query_params.get("meses", 4))
            filial_filter = request.query_params.get('filial', '')
            armazem_filter = request.query_params.get('armazem', '')
            
            print(f"📊 SalesView - Meses: {months}, Filial: {filial_filter}, Armazém: {armazem_filter}")
            
            # Buscar vendas + movimentações combinadas
            raw_data = ProtheusService.get_sales_and_movements_summary(
                months=months,
                filial=filial_filter if filial_filter else None,
                armazem=armazem_filter if armazem_filter else None
            )

            # Consolidar dados por produto (agrupar vendas + movimentações)
            consolidated_data = {}
            
            for item in raw_data:
                try:
                    code = str(item.get("code", ""))
                    filial = str(item.get("filial", ""))
                    local = str(item.get("local", ""))
                    
                    # Criar chave única por produto + filial + armazém
                    key = f"{code}_{filial}_{local}"
                    
                    if key not in consolidated_data:
                        consolidated_data[key] = {
                            "code": code,
                            "description": str(item.get("description", "")),
                            "quantity": 0,
                            "value": 0,
                            "filial": filial,
                            "local": local,
                        }
                    
                    # Somar quantidades e valores (vendas + movimentações)
                    consolidated_data[key]["quantity"] += float(item.get("quantity", 0))
                    consolidated_data[key]["value"] += float(item.get("value", 0))
                    
                except (ValueError, TypeError) as e:
                    print(f"❌ Erro ao processar item de vendas: {e}")
                    continue

            # Converter para lista
            data = list(consolidated_data.values())
            
            print(f"✅ SalesView - {len(data)} itens consolidados")

            # Aplicar paginação
            paginator = StandardPagination()
            paginated_data = paginator.paginate_queryset(data, request)
            serializer = SalesSumarySerializer(paginated_data, many=True)

            return paginator.get_paginated_response(serializer.data)
            
        except Exception as e:
            print(f"❌ Erro na SalesView: {e}")
            return Response({
                'error': f'Erro ao buscar dados de vendas: {str(e)}',
                'count': 0,
                'next': None,
                'previous': None,
                'total_pages': 0,
                'current_page': 1,
                'page_size': 50,
                'results': []
            }, status=500)


class StockMovementView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 50))
            filial_filter = request.query_params.get('filial', '')
            armazem_filter = request.query_params.get('armazem', '')
            
            print(f"🔄 StockMovementView - Página: {page}, Filtros: filial={filial_filter}, armazem={armazem_filter}")
            
            raw_data = ProtheusService.get_stock_movements(
                page=page, 
                page_size=page_size,
                filial=filial_filter if filial_filter else None,
                armazem=armazem_filter if armazem_filter else None
            )

            data = []
            for item in raw_data:
                try:
                    formatted_item = {
                        "code": str(item.get("code", "")),
                        "movement_type": str(item.get("movement_type", "")),
                        "date": item.get("date"),
                        "quantity": float(item.get("quantity", 0)),
                        "fiscal_code": str(item.get("fiscal_code", "")),
                        "document": str(item.get("document", "")),
                        "location": str(item.get("location", "")),
                        "filial": str(item.get("filial", "")),
                    }
                    data.append(formatted_item)
                    
                except (ValueError, TypeError) as e:
                    print(f"❌ Erro ao processar item de movimentação: {e}")
                    continue

            print(f"✅ StockMovementView - {len(data)} itens processados")

            # Retorno conforme documentação
            return Response({
                "page": page,
                "page_size": page_size,
                "results": StockMovementSerializer(data, many=True).data
            })

        except Exception as e:
            print(f"❌ Erro na StockMovementView: {e}")
            return Response({
                'error': f'Erro ao buscar movimentações: {str(e)}',
                'page': 1,
                'page_size': 50,
                'results': []
            }, status=500)


class LocationsView(APIView):
    """
    Endpoint para buscar locations/armazéns disponíveis da SD3
    """
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            filial_filter = request.query_params.get('filial', '')
            
            print(f"🏪 LocationsView - Filial: {filial_filter}")
            
            # Buscar locations das movimentações
            raw_data = ProtheusService.get_locations_from_movements(
                filial=filial_filter if filial_filter else None
            )

            data = []
            for item in raw_data:
                try:
                    formatted_item = {
                        "location": str(item.get("location", "")),
                        "movement_count": int(item.get("movement_count", 0)),
                    }
                    data.append(formatted_item)
                    
                except (ValueError, TypeError) as e:
                    print(f"❌ Erro ao processar location: {e}")
                    continue

            print(f"✅ LocationsView - {len(data)} locations processados")

            return Response({
                "success": True,
                "locations": data,
                "count": len(data)
            })
            
        except Exception as e:
            print(f"❌ Erro na LocationsView: {e}")
            return Response({
                'error': f'Erro ao buscar locations: {str(e)}',
                'success': False,
                'locations': [],
                'count': 0
            }, status=500)
        
        
class DeliveryView(APIView):
    """
    API para buscar dados de liberações/entregas (SC9)
    """
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            filial_filter = request.query_params.get('filial', '')
            local_filter = request.query_params.get('local', '')
            days = int(request.query_params.get('days', 30))
            
            print(f"🚚 DeliveryView - Filtros: filial={filial_filter}, local={local_filter}, days={days}")
            
            # Buscar dados de liberações/entregas
            raw_data = ProtheusService.get_deliveries_summary(
                filial=filial_filter if filial_filter else None,
                local=local_filter if local_filter else None,
                days=days
            )

            data = []
            for item in raw_data:
                try:
                    formatted_item = {
                        "pedido": str(item.get("pedido", "")),
                        "item": str(item.get("item", "")),
                        "sequencia": str(item.get("sequencia", "")),
                        "produto": str(item.get("produto", "")),
                        "descricao": str(item.get("descricao", "")),
                        "quantidade_liberada": float(item.get("quantidade_liberada", 0)),
                        "preco_venda": float(item.get("preco_venda", 0)),
                        "valor_total": float(item.get("valor_total", 0)),
                        "data_liberacao": item.get("data_liberacao"),
                        "local": str(item.get("local", "")),
                        "lote": str(item.get("lote", "")),
                        "data_validade": item.get("data_validade"),
                        "ordem_separacao": str(item.get("ordem_separacao", "")),
                        "nota_fiscal": str(item.get("nota_fiscal", "")),
                        "serie_nf": str(item.get("serie_nf", "")),
                        "status_liberacao": str(item.get("status_liberacao", "")),
                        "bloqueio_estoque": str(item.get("bloqueio_estoque", "")),
                        "bloqueio_credito": str(item.get("bloqueio_credito", "")),
                        "filial": str(item.get("filial", "")),
                    }
                    data.append(formatted_item)
                    
                except (ValueError, TypeError) as e:
                    print(f"❌ Erro ao processar item de liberação: {e}")
                    continue

            print(f"✅ DeliveryView - {len(data)} itens processados")

            # Aplicar paginação
            paginator = StandardPagination()
            paginated_data = paginator.paginate_queryset(data, request)
            serializer = DeliverySummarySerializer(paginated_data, many=True)

            return paginator.get_paginated_response(serializer.data)
            
        except Exception as e:
            print(f"❌ Erro na DeliveryView: {e}")
            return Response({
                'error': f'Erro ao buscar dados de liberação: {str(e)}',
                'count': 0,
                'next': None,
                'previous': None,
                'total_pages': 0,
                'current_page': 1,
                'page_size': 50,
                'results': []
            }, status=500)


class DeliveryStatusView(APIView):
    """
    API para resumo de status das liberações
    """
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            filial_filter = request.query_params.get('filial', '')
            days = int(request.query_params.get('days', 7))
            
            print(f"📊 DeliveryStatusView - Filtros: filial={filial_filter}, days={days}")
            
            # Buscar resumo de status
            raw_data = ProtheusService.get_delivery_status_summary(
                filial=filial_filter if filial_filter else None,
                days=days
            )

            data = []
            for item in raw_data:
                try:
                    formatted_item = {
                        "status": str(item.get("status", "")),
                        "quantidade": int(item.get("quantidade", 0)),
                        "valor_total": float(item.get("valor_total", 0)),
                    }
                    data.append(formatted_item)
                    
                except (ValueError, TypeError) as e:
                    print(f"❌ Erro ao processar status de liberação: {e}")
                    continue

            print(f"✅ DeliveryStatusView - {len(data)} status processados")

            return Response({
                'success': True,
                'count': len(data),
                'data': data
            })
            
        except Exception as e:
            print(f"❌ Erro na DeliveryStatusView: {e}")
            return Response({
                'error': f'Erro ao buscar status de liberação: {str(e)}',
                'data': []
            }, status=500)


class PendingDeliveriesView(APIView):
    """
    API para liberações pendentes de faturamento
    """
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            filial_filter = request.query_params.get('filial', '')
            local_filter = request.query_params.get('local', '')
            
            print(f"⏳ PendingDeliveriesView - Filtros: filial={filial_filter}, local={local_filter}")
            
            # Buscar liberações pendentes
            raw_data = ProtheusService.get_pending_deliveries(
                filial=filial_filter if filial_filter else None,
                local=local_filter if local_filter else None
            )

            data = []
            for item in raw_data:
                try:
                    formatted_item = {
                        "filial": str(item.get("filial", "")),
                        "pedido": str(item.get("pedido", "")),
                        "produto": str(item.get("produto", "")),
                        "descricao": str(item.get("descricao", "")),
                        "local": str(item.get("local", "")),
                        "total_liberado": float(item.get("total_liberado", 0)),
                        "valor_total": float(item.get("valor_total", 0)),
                        "primeira_liberacao": item.get("primeira_liberacao"),
                        "ultima_liberacao": item.get("ultima_liberacao"),
                        "total_itens": int(item.get("total_itens", 0)),
                    }
                    data.append(formatted_item)
                    
                except (ValueError, TypeError) as e:
                    print(f"❌ Erro ao processar liberação pendente: {e}")
                    continue

            print(f"✅ PendingDeliveriesView - {len(data)} pendências processadas")

            # Aplicar paginação
            paginator = StandardPagination()
            paginated_data = paginator.paginate_queryset(data, request)

            return paginator.get_paginated_response(paginated_data)
            
        except Exception as e:
            print(f"❌ Erro na PendingDeliveriesView: {e}")
            return Response({
                'error': f'Erro ao buscar liberações pendentes: {str(e)}',
                'count': 0,
                'results': []
            }, status=500)