# protheus/services.py - INCLUINDO MOVIMENTAÇÕES PARA MÉDIA MENSAL

from django.db import connection
import logging

logger = logging.getLogger(__name__)


class ProtheusService:
    
    @staticmethod
    def get_stock_summary(filial=None, armazem=None):
        """
        Consulta estoque com informações completas de filial e armazém
        """
        with connection.cursor() as cursor:
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
        with connection.cursor() as cursor:
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
        with connection.cursor() as cursor:
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
            columns = [col[0].lower() for col in cursor.description if col[0].lower() != 'rn']
            
            results = []
            for row in cursor.fetchall():
                row_data = row[:-1]
                results.append(dict(zip(columns, row_data)))
            
            return results
    
    @staticmethod
    def get_filiais_disponiveis():
        """
        Busca filiais disponíveis
        """
        with connection.cursor() as cursor:
            sql = """
                SELECT DISTINCT B1_FILIAL as filial
                FROM SB1010
                WHERE D_E_L_E_T_ = ' '
                AND B1_FILIAL IS NOT NULL
                AND TRIM(B1_FILIAL) != ''
                ORDER BY B1_FILIAL
            """
            
            cursor.execute(sql)
            return [row[0] for row in cursor.fetchall()]
    
    @staticmethod
    def get_armazens_disponiveis(filial=None):
        """
        Busca armazéns disponíveis da SD3 (movimentações) - locais com atividade
        """
        with connection.cursor() as cursor:
            sql = """
                SELECT DISTINCT D3_LOCAL as local
                FROM SD3010
                WHERE D_E_L_E_T_ = ' '
                AND D3_LOCAL IS NOT NULL
                AND TRIM(D3_LOCAL) != ''
                AND D3_EMISSAO >= ADD_MONTHS(SYSDATE, -12)  -- Últimos 12 meses
            """
            
            params = []
            if filial:
                sql += " AND D3_FILIAL = %s"
                params.append(filial)
            
            sql += " ORDER BY D3_LOCAL"
            
            cursor.execute(sql, params)
            armazens = [row[0] for row in cursor.fetchall()]
            
            logger.info(f"SD3 - Encontrados {len(armazens)} armazéns com movimentação: {armazens}")
            return armazens