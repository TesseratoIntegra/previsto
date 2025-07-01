from rest_framework import serializers



class StockSummarySerializer(serializers.Serializer):
    code = serializers.CharField()
    description = serializers.CharField()
    balance = serializers.FloatField()
    filial = serializers.CharField(required=False, allow_blank=True)
    local = serializers.CharField(required=False, allow_blank=True)


class SalesSumarySerializer(serializers.Serializer):
    code = serializers.CharField()
    description = serializers.CharField()
    quantity = serializers.FloatField()
    value = serializers.FloatField()
    filial = serializers.CharField(required=False, allow_blank=True)
    local = serializers.CharField(required=False, allow_blank=True)  # Adicionado local


class StockMovementSerializer(serializers.Serializer):
    code = serializers.CharField()
    movement_type = serializers.CharField()
    date = serializers.DateField()
    quantity = serializers.FloatField()
    fiscal_code = serializers.CharField()
    document = serializers.CharField()
    location = serializers.CharField()
    filial = serializers.CharField(required=False, allow_blank=True)


class DeliverySummarySerializer(serializers.Serializer):
    """
    Serializer para dados de liberação/entrega (SC9)
    """
    pedido = serializers.CharField()
    item = serializers.CharField()
    sequencia = serializers.CharField()
    produto = serializers.CharField()
    descricao = serializers.CharField(required=False, allow_blank=True)
    quantidade_liberada = serializers.FloatField()
    preco_venda = serializers.FloatField()
    valor_total = serializers.FloatField()
    data_liberacao = serializers.DateField(required=False, allow_null=True)
    local = serializers.CharField()
    lote = serializers.CharField(required=False, allow_blank=True)
    data_validade = serializers.DateField(required=False, allow_null=True)
    ordem_separacao = serializers.CharField(required=False, allow_blank=True)
    nota_fiscal = serializers.CharField(required=False, allow_blank=True)
    serie_nf = serializers.CharField(required=False, allow_blank=True)
    status_liberacao = serializers.CharField()
    bloqueio_estoque = serializers.CharField(required=False, allow_blank=True)
    bloqueio_credito = serializers.CharField(required=False, allow_blank=True)
    filial = serializers.CharField(required=False, allow_blank=True)