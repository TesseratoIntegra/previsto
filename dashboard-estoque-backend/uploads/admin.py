from django.contrib import admin
from .models import ArquivoUpload, DadosProcessados

@admin.register(ArquivoUpload)
class ArquivoUploadAdmin(admin.ModelAdmin):
    list_display = ('tipo', 'data_upload', 'processado')
    list_filter = ('tipo', 'processado', 'data_upload')
    search_fields = ('arquivo',)
    date_hierarchy = 'data_upload'


@admin.register(DadosProcessados)
class DadosProcessadosAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'produto', 'estoque', 'media_mensal', 'cobertura', 'status', 'prioridade')
    list_filter = ('status', 'prioridade', 'data_processamento')
    search_fields = ('codigo', 'produto')
    date_hierarchy = 'data_processamento'

