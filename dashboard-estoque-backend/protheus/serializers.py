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