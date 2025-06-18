from rest_framework import serializers

from protheus.mixins import StripCharFieldsMixin

from protheus.models import ProtheusSB1, ProtheusSB2, ProtheusSD3


class ProtheusSB1Serializer(StripCharFieldsMixin, serializers.ModelSerializer):
    """
    Serializador para os dados da tabela SB1 (Produtos).
    """

    class Meta:
        model = ProtheusSB1
        fields = '__all__'


class ProtheusSB2Serializer(StripCharFieldsMixin, serializers.ModelSerializer):
    """
    Serializador para os dados da tabela SB2 (Saldos em Estoque).
    """

    class Meta:
        model = ProtheusSB2
        fields = '__all__'


class ProtheusSD3Serializer(StripCharFieldsMixin, serializers.ModelSerializer):
    """
    Serializador para os dados da tabela SD3 (Movimentações de Estoque).
    """

    class Meta:
        model = ProtheusSD3
        fields = '__all__'
