from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser


from .models import ArquivoUpload
from .serializers import (
    EstoqueSerializer,
    VendasSerializer,
    ProcessadosSerializer
)
from protheus.services import ProtheusService
from uploads.services import DataProcessorService, FileProcessorService


class EstoqueAPIView(APIView):
    """
    API para buscar dados de estoque
    """
    
    def get(self, request):
        """
        Busca dados de estoque do Protheus ou do último arquivo processado
        """
        try:
            # Tenta buscar do Protheus primeiro
            try:
                estoque_data = ProtheusService.get_estoque_data()
            except Exception as e:
                # Se não conseguir conectar ao Protheus, busca do último arquivo processado
                estoque_data = []
            
            # Se não encontrou dados no Protheus, busca do último arquivo processado
            if not estoque_data:
                ultimo_arquivo = ArquivoUpload.objects.filter(
                    tipo='estoque',
                    processado=True
                ).order_by('-data_upload').first()
                
                if ultimo_arquivo:
                    estoque_data = FileProcessorService.process_estoque_file(ultimo_arquivo.arquivo)
                else:
                    # Se não encontrou arquivo, retorna lista vazia
                    return Response([])
            
            # Serializa os dados
            serializer = EstoqueSerializer(estoque_data, many=True)
            return Response(serializer.data)
        
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VendasAPIView(APIView):
    """
    API para buscar dados de vendas
    """
    
    def get(self, request):
        """
        Busca dados de vendas do Protheus ou do último arquivo processado
        """
        try:
            # Tenta buscar do Protheus primeiro
            try:
                vendas_data = ProtheusService.get_vendas_data()
            except Exception as e:
                # Se não conseguir conectar ao Protheus, busca do último arquivo processado
                vendas_data = []
            
            # Se não encontrou dados no Protheus, busca do último arquivo processado
            if not vendas_data:
                ultimo_arquivo = ArquivoUpload.objects.filter(
                    tipo='vendas',
                    processado=True
                ).order_by('-data_upload').first()
                
                if ultimo_arquivo:
                    vendas_data = FileProcessorService.process_vendas_file(ultimo_arquivo.arquivo)
                else:
                    # Se não encontrou arquivo, retorna lista vazia
                    return Response([])
            
            # Serializa os dados
            serializer = VendasSerializer(vendas_data, many=True)
            return Response(serializer.data)
        
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProcessadosAPIView(APIView):
    """
    API para buscar dados processados
    """
    
    def get(self, request):
        """
        Busca dados processados
        """
        try:
            # Busca dados de estoque e vendas
            try:
                # Tenta buscar do Protheus primeiro
                estoque_data = ProtheusService.get_estoque_data()
                vendas_data = ProtheusService.get_vendas_data()
            except Exception as e:
                # Se não conseguir conectar ao Protheus, retorna dados vazios
                estoque_data = []
                vendas_data = []
            
            # Se não encontrou dados no Protheus, busca dos últimos arquivos processados
            if not estoque_data:
                ultimo_arquivo_estoque = ArquivoUpload.objects.filter(
                    tipo='estoque',
                    processado=True
                ).order_by('-data_upload').first()
                
                if ultimo_arquivo_estoque:
                    estoque_data = FileProcessorService.process_estoque_file(ultimo_arquivo_estoque.arquivo)
            
            if not vendas_data:
                ultimo_arquivo_vendas = ArquivoUpload.objects.filter(
                    tipo='vendas',
                    processado=True
                ).order_by('-data_upload').first()
                
                if ultimo_arquivo_vendas:
                    vendas_data = FileProcessorService.process_vendas_file(ultimo_arquivo_vendas.arquivo)
            
            # Se não encontrou dados, retorna lista vazia
            if not estoque_data and not vendas_data:
                return Response([])
            
            # Processa os dados
            processados_data = DataProcessorService.process_data(estoque_data, vendas_data)
            
            # Serializa os dados
            serializer = ProcessadosSerializer(processados_data, many=True)
            return Response(serializer.data)
        
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UploadEstoqueAPIView(APIView):
    """
    API para upload de arquivo de estoque
    """
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request):
        """
        Recebe upload de arquivo de estoque
        """
        try:
            file = request.FILES.get('file')
            if not file:
                return Response(
                    {'error': 'Nenhum arquivo enviado'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Salva o arquivo
            arquivo = ArquivoUpload(
                arquivo=file,
                tipo='estoque'
            )
            arquivo.save()
            
            # Processa o arquivo
            estoque_data = FileProcessorService.process_estoque_file(arquivo.arquivo)
            
            # Marca como processado
            arquivo.processado = True
            arquivo.save()
            
            return Response({
                'message': 'Arquivo de estoque processado com sucesso',
                'count': len(estoque_data)
            })
        
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UploadVendasAPIView(APIView):
    """
    API para upload de arquivo de vendas
    """
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request):
        """
        Recebe upload de arquivo de vendas
        """
        try:
            file = request.FILES.get('file')
            if not file:
                return Response(
                    {'error': 'Nenhum arquivo enviado'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Salva o arquivo
            arquivo = ArquivoUpload(
                arquivo=file,
                tipo='vendas'
            )
            arquivo.save()
            
            # Processa o arquivo
            vendas_data = FileProcessorService.process_vendas_file(arquivo.arquivo)
            
            # Marca como processado
            arquivo.processado = True
            arquivo.save()
            
            return Response({
                'message': 'Arquivo de vendas processado com sucesso',
                'count': len(vendas_data)
            })
        
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

