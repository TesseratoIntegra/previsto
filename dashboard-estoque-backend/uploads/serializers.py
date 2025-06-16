from rest_framework import serializers
from uploads.models import ArquivoUpload, DadosProcessados


class ArquivoUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArquivoUpload
        fields = '__all__'


class DadosProcessadosSerializer(serializers.ModelSerializer):
    class Meta:
        model = DadosProcessados
        fields = '__all__'


class EstoqueSerializer(serializers.Serializer):
    """
    Serializer para dados de estoque formatados
    """
    codigo = serializers.CharField()
    descricao = serializers.CharField()
    saldo = serializers.FloatField()


class VendasSerializer(serializers.Serializer):
    """
    Serializer para dados de vendas formatados
    """
    codigo = serializers.CharField()
    descricao = serializers.CharField()
    quantidade = serializers.FloatField()
    valor = serializers.FloatField()


class ProcessadosSerializer(serializers.Serializer):
    """
    Serializer para dados processados formatados
    """
    codigo = serializers.CharField()
    produto = serializers.CharField()
    vendaTotal = serializers.FloatField()
    valorTotal = serializers.FloatField()
    mediaMensal = serializers.FloatField()
    estoque = serializers.FloatField()
    pdv = serializers.FloatField()
    cobertura = serializers.FloatField()
    estoqueIdeal = serializers.FloatField()
    sugestaoAbastecimento = serializers.FloatField()
    status = serializers.CharField()
    prioridade = serializers.CharField()
