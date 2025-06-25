from django.db import models


class ProtheusSB1(models.Model):
    """
    Modelo para mapear a tabela SB1 (Produtos) do Protheus
    """
    B1_FILIAL = models.CharField(max_length=2, verbose_name='Filial')
    B1_COD = models.CharField(max_length=15, primary_key=True, verbose_name='Código do Produto')
    B1_DESC = models.CharField(max_length=100, verbose_name='Descrição do Produto')
    B1_TIPO = models.CharField(max_length=2, verbose_name='Tipo do Produto')
    B1_UM = models.CharField(max_length=2, verbose_name='Unidade de Medida')
    B1_GRUPO = models.CharField(max_length=4, verbose_name='Grupo do Produto')

    class Meta:
        managed = False
        db_table = 'SB1010'
        app_label = 'protheus'
        verbose_name = 'Produto'
        verbose_name_plural = 'Produtos'
        unique_together = ('B1_FILIAL', 'B1_COD')

    def __str__(self):
        return f'{self.B1_FILIAL} - {self.B1_COD} ({self.B1_TIPO})'


class ProtheusSB2(models.Model):
    """
    Modelo para mapear a tabela SB2 (Saldos em Estoque) do Protheus
    """
    B2_FILIAL = models.CharField(max_length=2, verbose_name='Filial')
    B2_COD = models.CharField(max_length=15, primary_key=True, verbose_name='Código do Produto')
    B2_LOCAL = models.CharField(max_length=2, verbose_name='Local')
    B2_QATU = models.FloatField(verbose_name='Quantidade Atual em Estoque')
    B2_RESERVA = models.FloatField(verbose_name='Quantidade Reservada')
    B2_QPEDVEN = models.FloatField(verbose_name='Quantidade em Pedido de Venda')
    D_E_L_E_T = models.CharField(max_length=1, db_column='D_E_L_E_T_', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'SB2010'
        app_label = 'protheus'
        verbose_name = 'Saldo em Estoque'
        verbose_name_plural = 'Saldos em Estoque'
        unique_together = ('B2_FILIAL', 'B2_COD', 'B2_LOCAL')

    def __str__(self):
        return f'{self.B2_FILIAL} - {self.B2_COD} ({self.B2_LOCAL})'


class ProtheusSD3(models.Model):
    """
    Modelo para mapear a tabela SD3 (Movimentações de Estoque) do Protheus.
    Armazena lançamentos de entradas, saídas, ajustes, transferências, etc.
    """
    D3_FILIAL = models.CharField(max_length=2, verbose_name='Filial')
    D3_COD = models.CharField(max_length=15, primary_key=True, verbose_name='Código do produto')
    D3_TM = models.CharField(max_length=2, verbose_name='Tipo de movimento')
    D3_EMISSAO = models.DateField(verbose_name='Data da movimentação')
    D3_QUANT = models.FloatField(verbose_name='Quantidade movimentada')
    D3_CF = models.CharField(max_length=10, verbose_name='Código fiscal')
    D3_DOC = models.CharField(max_length=9, verbose_name='Documento')
    D3_LOCAL = models.CharField(max_length=2, verbose_name='Local (depósito)')
    D_E_L_E_T = models.CharField(max_length=1, db_column='D_E_L_E_T_', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'SD3010'
        app_label = 'protheus'
        verbose_name = 'Movimentação de Estoque'
        verbose_name_plural = 'Movimentações de Estoque'

    def __str__(self):
        return f'{self.D3_DOC} - {self.D3_COD} ({self.D3_TM})'
