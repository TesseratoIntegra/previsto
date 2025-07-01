# protheus/services.py - INCLUINDO MOVIMENTAÇÕES PARA MÉDIA MENSAL

from django.db import connections
import logging

logger = logging.getLogger(__name__)


class ProtheusService:
    
    @staticmethod
    def get_stock_summary(filial=None, armazem=None):
        """
        Consulta estoque com informações completas de filial e armazém
        """
        with connections['protheus'].cursor() as cursor:
            sql = """
                SELECT 
                    SB1.B1_COD as code,
                    SB1.B1_DESC as description,
                    COALESCE(SB2.B2_QATU, 0) as balance,
                    SB1.B1_FILIAL as filial,
                    COALESCE(SB2.B2_LOCAL, '01') as local
                FROM SB1010 SB1
                LEFT JOIN SB2010 SB2 ON (
                    SB1.B1_FILIAL = SB2.B2_FILIAL 
                    AND SB1.B1_COD = SB2.B2_COD
                    AND SB2.D_E_L_E_T_ = ' '
                )
                WHERE SB1.D_E_L_E_T_ = ' '
                AND SB1.B1_MSBLQL != '1'
            """
            
            params = []
            
            if filial:
                sql += " AND SB1.B1_FILIAL = %s"
                params.append(filial)
            
            if armazem:
                sql += " AND SB2.B2_LOCAL = %s"
                params.append(armazem)
            
            sql += " ORDER BY SB1.B1_FILIAL, SB1.B1_COD"
            
            logger.info(f"Query estoque: {sql}")
            cursor.execute(sql, params)
            columns = [col[0].lower() for col in cursor.description]
            
            results = []
            for row in cursor.fetchall():
                results.append(dict(zip(columns, row)))
            
            logger.info(f"Estoque: {len(results)} registros")
            return results
    
    @staticmethod
    def get_sales_and_movements_summary(months=4, filial=None, armazem=None):
        """
        Busca vendas (SC5/SC6) + movimentações de saída (SD3) para cálculo da média mensal
        """
        with connections['protheus'].cursor() as cursor:
            # PARTE 1: Vendas dos pedidos (SC5/SC6)
            sql_vendas = """
                SELECT 
                    SC6.C6_PRODUTO as code,
                    SB1.B1_DESC as description,
                    SUM(SC6.C6_QTDVEN) as quantity,
                    SUM(SC6.C6_VALOR) as value,
                    SC6.C6_FILIAL as filial,
                    SC6.C6_LOCAL as local,
                    'VENDAS' as source_type
                FROM SC6010 SC6
                INNER JOIN SC5010 SC5 ON (
                    SC6.C6_FILIAL = SC5.C5_FILIAL 
                    AND SC6.C6_NUM = SC5.C5_NUM
                    AND SC5.D_E_L_E_T_ = ' '
                )
                INNER JOIN SB1010 SB1 ON (
                    SC6.C6_FILIAL = SB1.B1_FILIAL 
                    AND SC6.C6_PRODUTO = SB1.B1_COD
                    AND SB1.D_E_L_E_T_ = ' '
                )
                WHERE SC6.D_E_L_E_T_ = ' '
                AND SC6.C6_QTDVEN > 0
                AND SC5.C5_EMISSAO >= ADD_MONTHS(SYSDATE, -%s)
                AND SC5.C5_TIPO = 'N'
                AND SC5.C5_NOTA != ' '
            """
            
            params_vendas = [months]
            
            if filial:
                sql_vendas += " AND SC6.C6_FILIAL = %s"
                params_vendas.append(filial)
            
            if armazem:
                sql_vendas += " AND SC6.C6_LOCAL = %s"
                params_vendas.append(armazem)
            
            sql_vendas += """
                GROUP BY SC6.C6_PRODUTO, SB1.B1_DESC, SC6.C6_FILIAL, SC6.C6_LOCAL
                
                UNION ALL
                
            """
            
            # PARTE 2: Movimentações de saída (SD3)
            sql_movimentos = """
                SELECT 
                    SD3.D3_COD as code,
                    SB1.B1_DESC as description,
                    SUM(SD3.D3_QUANT) as quantity,
                    SUM(SD3.D3_CUSTO1 * SD3.D3_QUANT) as value,
                    SD3.D3_FILIAL as filial,
                    SD3.D3_LOCAL as local,
                    'MOVIMENTOS' as source_type
                FROM SD3010 SD3
                INNER JOIN SB1010 SB1 ON (
                    SD3.D3_FILIAL = SB1.B1_FILIAL 
                    AND SD3.D3_COD = SB1.B1_COD
                    AND SB1.D_E_L_E_T_ = ' '
                )
                WHERE SD3.D_E_L_E_T_ = ' '
                AND SD3.D3_EMISSAO >= ADD_MONTHS(SYSDATE, -%s)
                AND SD3.D3_TM IN ('501', '502', '503', '999')  -- Tipos de saída
                AND SD3.D3_QUANT > 0
            """
            
            params_movimentos = [months]
            
            if filial:
                sql_movimentos += " AND SD3.D3_FILIAL = %s"
                params_movimentos.append(filial)
            
            if armazem:
                sql_movimentos += " AND SD3.D3_LOCAL = %s"
                params_movimentos.append(armazem)
            
            sql_movimentos += """
                GROUP BY SD3.D3_COD, SB1.B1_DESC, SD3.D3_FILIAL, SD3.D3_LOCAL
                ORDER BY code, filial, local
            """
            
            # Combinar as duas queries
            sql_final = sql_vendas + sql_movimentos
            params_final = params_vendas + params_movimentos
            
            logger.info(f"Query vendas + movimentos: {sql_final}")
            cursor.execute(sql_final, params_final)
            columns = [col[0].lower() for col in cursor.description]
            
            results = []
            for row in cursor.fetchall():
                results.append(dict(zip(columns, row)))
            
            logger.info(f"Vendas + Movimentos: {len(results)} registros")
            return results
    
    @staticmethod
    def get_sales_summary(months=4, filial=None):
        """
        Método mantido para compatibilidade - agora chama o método combinado
        """
        return ProtheusService.get_sales_and_movements_summary(months, filial)
    
    @staticmethod
    def get_stock_movements(page=1, page_size=50, filial=None, armazem=None):
        """
        Movimentações de estoque para visualização (mantém original)
        """
        with connections['protheus'].cursor() as cursor:
            offset = (page - 1) * page_size
            
            sql = """
                SELECT * FROM (
                    SELECT 
                        SD3.D3_COD as code,
                        SD3.D3_TM as movement_type,
                        TO_CHAR(SD3.D3_EMISSAO, 'YYYY-MM-DD') as date,
                        SD3.D3_QUANT as quantity,
                        SD3.D3_CF as fiscal_code,
                        SD3.D3_DOC as document,
                        SD3.D3_LOCAL as location,
                        SD3.D3_FILIAL as filial,
                        ROW_NUMBER() OVER (ORDER BY SD3.D3_EMISSAO DESC) as rn
                    FROM SD3010 SD3
                    WHERE SD3.D_E_L_E_T_ = ' '
                    AND SD3.D3_EMISSAO >= ADD_MONTHS(SYSDATE, -6)
            """
            
            params = []
            
            if filial:
                sql += " AND SD3.D3_FILIAL = %s"
                params.append(filial)
            
            if armazem:
                sql += " AND SD3.D3_LOCAL = %s"
                params.append(armazem)
            
            sql += f") WHERE rn > {offset} AND rn <= {offset + page_size}"
            
            cursor.execute(sql, params)
            columns = [col[0].lower() for col in cursor.description]
            
            results = []
            for row in cursor.fetchall():
                results.append(dict(zip(columns, row)))
            
            return results

    @staticmethod
    def get_deliveries_summary(filial=None, local=None, days=30):
        """
        Busca liberações/entregas (SC9) com informações completas
        """
        with connections['protheus'].cursor() as cursor:
            sql = """
                SELECT 
                    SC9.C9_FILIAL as filial,
                    SC9.C9_PEDIDO as pedido,
                    SC9.C9_ITEM as item,
                    SC9.C9_SEQUEN as sequencia,
                    SC9.C9_PRODUTO as produto,
                    SB1.B1_DESC as descricao,
                    SC9.C9_QTDLIB as quantidade_liberada,
                    SC9.C9_PRCVEN as preco_venda,
                    (SC9.C9_QTDLIB * SC9.C9_PRCVEN) as valor_total,
                    SC9.C9_DATALIB as data_liberacao,
                    SC9.C9_LOCAL as local,
                    SC9.C9_LOTECTL as lote,
                    SC9.C9_DTVALID as data_validade,
                    SC9.C9_ORDSEP as ordem_separacao,
                    SC9.C9_NFISCAL as nota_fiscal,
                    SC9.C9_SERIENF as serie_nf,
                    SC9.C9_BLEST as bloqueio_estoque,
                    SC9.C9_BLCRED as bloqueio_credito,
                    SC9.C9_OK as liberacao_ok,
                    
                    -- STATUS CALCULADO
                    CASE 
                        WHEN SC9.C9_NFISCAL IS NOT NULL AND SC9.C9_NFISCAL != ' ' THEN 'FATURADO'
                        WHEN SC9.C9_BLEST IS NOT NULL AND SC9.C9_BLEST != '  ' THEN 'BLOQ_ESTOQUE'
                        WHEN SC9.C9_BLCRED IS NOT NULL AND SC9.C9_BLCRED != '  ' THEN 'BLOQ_CREDITO'
                        WHEN SC9.C9_OK = 'S' THEN 'LIBERADO'
                        ELSE 'PENDENTE'
                    END as status_liberacao
                    
                FROM SC9010 SC9
                LEFT JOIN SB1010 SB1 ON (
                    SC9.C9_FILIAL = SB1.B1_FILIAL 
                    AND SC9.C9_PRODUTO = SB1.B1_COD
                    AND SB1.D_E_L_E_T_ = ' '
                )
                WHERE SC9.D_E_L_E_T_ = ' '
                AND SC9.C9_QTDLIB > 0
            """
            
            params = []
            
            # Filtro por período (últimos N dias)
            if days:
                sql += " AND SC9.C9_DATALIB >= SYSDATE - %s"
                params.append(days)
            
            if filial:
                sql += " AND SC9.C9_FILIAL = %s"
                params.append(filial)
            
            if local:
                sql += " AND SC9.C9_LOCAL = %s"
                params.append(local)
            
            sql += " ORDER BY SC9.C9_DATALIB DESC, SC9.C9_PEDIDO, SC9.C9_ITEM"
            
            logger.info(f"Query liberações SC9: {sql}")
            cursor.execute(sql, params)
            columns = [col[0].lower() for col in cursor.description]
            
            results = []
            for row in cursor.fetchall():
                results.append(dict(zip(columns, row)))
            
            logger.info(f"Liberações SC9: {len(results)} registros")
            return results

    @staticmethod
    def get_delivery_status_summary(filial=None, days=7):
        """
        Resumo de status das liberações por período
        """
        with connections['protheus'].cursor() as cursor:
            sql = """
                SELECT 
                    CASE 
                        WHEN SC9.C9_NFISCAL IS NOT NULL AND SC9.C9_NFISCAL != ' ' THEN 'FATURADO'
                        WHEN SC9.C9_BLEST IS NOT NULL AND SC9.C9_BLEST != '  ' THEN 'BLOQ_ESTOQUE'
                        WHEN SC9.C9_BLCRED IS NOT NULL AND SC9.C9_BLCRED != '  ' THEN 'BLOQ_CREDITO'
                        WHEN SC9.C9_OK = 'S' THEN 'LIBERADO'
                        ELSE 'PENDENTE'
                    END as status,
                    COUNT(*) as quantidade,
                    SUM(SC9.C9_QTDLIB * SC9.C9_PRCVEN) as valor_total
                FROM SC9010 SC9
                WHERE SC9.D_E_L_E_T_ = ' '
                AND SC9.C9_QTDLIB > 0
                AND SC9.C9_DATALIB >= SYSDATE - %s
            """
            
            params = [days]
            
            if filial:
                sql += " AND SC9.C9_FILIAL = %s"
                params.append(filial)
            
            sql += """
                GROUP BY 
                    CASE 
                        WHEN SC9.C9_NFISCAL IS NOT NULL AND SC9.C9_NFISCAL != ' ' THEN 'FATURADO'
                        WHEN SC9.C9_BLEST IS NOT NULL AND SC9.C9_BLEST != '  ' THEN 'BLOQ_ESTOQUE'
                        WHEN SC9.C9_BLCRED IS NOT NULL AND SC9.C9_BLCRED != '  ' THEN 'BLOQ_CREDITO'
                        WHEN SC9.C9_OK = 'S' THEN 'LIBERADO'
                        ELSE 'PENDENTE'
                    END
                ORDER BY valor_total DESC
            """
            
            cursor.execute(sql, params)
            columns = [col[0].lower() for col in cursor.description]
            
            results = []
            for row in cursor.fetchall():
                results.append(dict(zip(columns, row)))
            
            return results

    @staticmethod
    def get_pending_deliveries(filial=None, local=None):
        """
        Busca liberações pendentes de faturamento
        """
        with connections['protheus'].cursor() as cursor:
            sql = """
                SELECT 
                    SC9.C9_FILIAL as filial,
                    SC9.C9_PEDIDO as pedido,
                    SC9.C9_PRODUTO as produto,
                    SB1.B1_DESC as descricao,
                    SC9.C9_LOCAL as local,
                    SUM(SC9.C9_QTDLIB) as total_liberado,
                    SUM(SC9.C9_QTDLIB * SC9.C9_PRCVEN) as valor_total,
                    MIN(SC9.C9_DATALIB) as primeira_liberacao,
                    MAX(SC9.C9_DATALIB) as ultima_liberacao,
                    COUNT(*) as total_itens
                FROM SC9010 SC9
                LEFT JOIN SB1010 SB1 ON (
                    SC9.C9_FILIAL = SB1.B1_FILIAL 
                    AND SC9.C9_PRODUTO = SB1.B1_COD
                    AND SB1.D_E_L_E_T_ = ' '
                )
                WHERE SC9.D_E_L_E_T_ = ' '
                AND SC9.C9_QTDLIB > 0
                AND (SC9.C9_NFISCAL IS NULL OR SC9.C9_NFISCAL = ' ')
                AND (SC9.C9_BLEST IS NULL OR SC9.C9_BLEST = '  ')
                AND (SC9.C9_BLCRED IS NULL OR SC9.C9_BLCRED = '  ')
            """
            
            params = []
            
            if filial:
                sql += " AND SC9.C9_FILIAL = %s"
                params.append(filial)
            
            if local:
                sql += " AND SC9.C9_LOCAL = %s"
                params.append(local)
            
            sql += """
                GROUP BY SC9.C9_FILIAL, SC9.C9_PEDIDO, SC9.C9_PRODUTO, 
                         SB1.B1_DESC, SC9.C9_LOCAL
                ORDER BY primeira_liberacao ASC
            """
            
            cursor.execute(sql, params)
            columns = [col[0].lower() for col in cursor.description]
            
            results = []
            for row in cursor.fetchall():
                results.append(dict(zip(columns, row)))
            
            return results