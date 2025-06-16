from rest_framework import serializers


class StockSummarySerializer(serializers.Serializer):
    code = serializers.CharField()
    description = serializers.CharField()
    balance = serializers.FloatField()


class SalesSumarySerializer(serializers.Serializer):
    code = serializers.CharField()
    description = serializers.CharField()
    quantity = serializers.FloatField()
    value = serializers.FloatField()


class StockMovementSerializer(serializers.Serializer):
    code = serializers.CharField()
    movement_type = serializers.CharField()
    date = serializers.DateField()
    quantity = serializers.FloatField()
    fiscal_code = serializers.CharField()
    document = serializers.CharField()
    location = serializers.CharField()
