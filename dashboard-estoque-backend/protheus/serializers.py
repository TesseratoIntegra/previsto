from rest_framework import serializers

from protheus.mixins import StripCharFieldsMixin

from protheus.models import ProtheusSB1, ProtheusSB2, ProtheusSD3


class ProtheusSB1Serializer(StripCharFieldsMixin, serializers.ModelSerializer):
    """
    Serializador para os dados da tabela SB1 (products).
    """

    class Meta:
        model = ProtheusSB1
        fields = '__all__'


class ProtheusSB2Serializer(StripCharFieldsMixin, serializers.ModelSerializer):
    """
    Serializador para os dados da tabela SB2 (Saldos em Estoque).
    """
    B1_DESC = serializers.SerializerMethodField()

    class Meta:
        model = ProtheusSB2
        fields = ['B2_FILIAL', 'B2_COD', 'B1_DESC',
                  'B2_LOCAL', 'B2_QATU', 'B2_RESERVA', 'B2_QPEDVEN'
                ]

    def get_B1_DESC(self, obj):
        product = ProtheusSB1.objects.filter(B1_COD=obj.B2_COD, B1_FILIAL=obj.B2_FILIAL).first()
        return product.B1_DESC if product else None


class ProtheusSD3Serializer(StripCharFieldsMixin, serializers.ModelSerializer):
    """
    Serializador para os dados da tabela SD3 (Movimentações de Estoque).
    """

    class Meta:
        model = ProtheusSD3
        fields = '__all__'
