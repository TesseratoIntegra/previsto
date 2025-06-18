from rest_framework import serializers


class StripCharFieldsMixin:
    """
    Mixin que aplica .strip() em todos os campos CharField do serializer na saída.
    """

    def to_representation(self, instance):
        data = super().to_representation(instance)

        for field_name, value in data.items():
            field = self.fields.get(field_name)

            if isinstance(field, serializers.CharField) and isinstance(value, str):
                data[field_name] = value.strip()

        return data
