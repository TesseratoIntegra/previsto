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

class ProtheusSC9(models.Model):
    """
    Modelo para mapear a tabela SC9 (Liberações/Entregas) do Protheus.
    Controla as liberações de pedidos para faturamento e entrega.
    """
    C9_FILIAL = models.CharField(max_length=2, verbose_name='Filial')
    C9_PEDIDO = models.CharField(max_length=6, verbose_name='Número do Pedido')
    C9_ITEM = models.CharField(max_length=2, verbose_name='Item do Pedido')
    C9_SEQUEN = models.CharField(max_length=3, verbose_name='Sequência')
    C9_PRODUTO = models.CharField(max_length=15, verbose_name='Código do Produto')
    C9_QTDLIB = models.FloatField(verbose_name='Quantidade Liberada')
    C9_PRCVEN = models.FloatField(verbose_name='Preço de Venda')
    C9_DATALIB = models.DateField(verbose_name='Data de Liberação', null=True, blank=True)
    C9_LOCAL = models.CharField(max_length=2, verbose_name='Local/Armazém')
    C9_LOTECTL = models.CharField(max_length=10, verbose_name='Lote', blank=True, null=True)
    C9_NUMLOTE = models.CharField(max_length=6, verbose_name='Sub-Lote', blank=True, null=True)
    C9_DTVALID = models.DateField(verbose_name='Data de Validade', null=True, blank=True)
    C9_POTENCI = models.FloatField(verbose_name='Potência', default=0)
    C9_QTDLIB2 = models.FloatField(verbose_name='Quantidade na 2ª UM', default=0)
    C9_AGREG = models.CharField(max_length=1, verbose_name='Agregado', blank=True, null=True)
    C9_SERVIC = models.CharField(max_length=3, verbose_name='Código do Serviço', blank=True, null=True)
    C9_ORDSEP = models.CharField(max_length=6, verbose_name='Ordem de Separação', blank=True, null=True)
    
    # Campos de Bloqueio/Status
    C9_BLEST = models.CharField(max_length=2, verbose_name='Bloqueio de Estoque', blank=True, null=True)
    C9_BLCRED = models.CharField(max_length=2, verbose_name='Bloqueio de Crédito', blank=True, null=True)
    C9_OK = models.CharField(max_length=2, verbose_name='Liberação OK', blank=True, null=True)
    C9_NFISCAL = models.CharField(max_length=9, verbose_name='Nota Fiscal', blank=True, null=True)
    C9_SERIENF = models.CharField(max_length=3, verbose_name='Série NF', blank=True, null=True)
    
    # Campo de deleção
    D_E_L_E_T = models.CharField(max_length=1, db_column='D_E_L_E_T_', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'SC9010'
        app_label = 'protheus'
        verbose_name = 'Liberação/Entrega'
        verbose_name_plural = 'Liberações/Entregas'
        unique_together = ('C9_FILIAL', 'C9_PEDIDO', 'C9_ITEM', 'C9_SEQUEN')

    def __str__(self):
        return f'{self.C9_FILIAL} - {self.C9_PEDIDO}/{self.C9_ITEM} - {self.C9_PRODUTO}'

    @property
    def status_liberacao(self):
        """Retorna o status da liberação baseado nos campos de bloqueio"""
        if self.C9_NFISCAL and self.C9_NFISCAL.strip():
            return 'FATURADO'
        elif self.C9_BLEST and self.C9_BLEST.strip():
            return 'BLOQ_ESTOQUE'
        elif self.C9_BLCRED and self.C9_BLCRED.strip():
            return 'BLOQ_CREDITO'
        elif self.C9_OK and self.C9_OK.strip() == 'S':
            return 'LIBERADO'
        else:
            return 'PENDENTE'