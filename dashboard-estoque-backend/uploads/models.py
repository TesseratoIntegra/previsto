# from django.db import models


# class ArquivoUpload(models.Model):
#     """
#     Modelo para armazenar arquivos enviados pelo usuário
#     """
#     TIPO_CHOICES = (
#         ('estoque', 'Estoque'),
#         ('vendas', 'Vendas'),
#     )

#     arquivo = models.FileField(upload_to='uploads/')
#     tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
#     data_upload = models.DateTimeField(auto_now_add=True)
#     processado = models.BooleanField(default=False)

#     def __str__(self):
#         return f"{self.get_tipo_display()} - {self.data_upload.strftime('%d/%m/%Y %H:%M')}"


# class DadosProcessados(models.Model):
#     """
#     Modelo para armazenar dados processados
#     """
#     codigo = models.CharField(max_length=50)
#     produto = models.CharField(max_length=255)
#     venda_total = models.FloatField(default=0)
#     valor_total = models.FloatField(default=0)
#     media_mensal = models.FloatField(default=0)
#     estoque = models.FloatField(default=0)
#     pdv = models.FloatField(default=0)
#     cobertura = models.FloatField(default=0)
#     estoque_ideal = models.FloatField(default=0)
#     sugestao_abastecimento = models.FloatField(default=0)
#     status = models.CharField(max_length=20)
#     prioridade = models.CharField(max_length=10)
#     data_processamento = models.DateTimeField(auto_now_add=True)
    
#     def __str__(self):
#         return f"{self.codigo} - {self.produto}"
    
#     class Meta:
#         verbose_name = "Dado Processado"
#         verbose_name_plural = "Dados Processados"
#         ordering = ['-data_processamento', 'codigo']
