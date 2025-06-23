# from datetime import datetime, timedelta
# from typing import List, Dict, Optional

# from django.db import connections, utils


# class ProtheusService:
#     """
#     Serviço para consultar dados diretamente do banco Protheus usando SQL performático
#     e seguro com conexão gerenciada.
#     """

#     @staticmethod
#     def _execute_query(query: str, params: Optional[tuple] = None) -> List[Dict]:
#         """
#         Executa uma query SQL no banco Protheus com tratamento de erro.

#         Args:
#             query (str): Comando SQL a ser executado.
#             params (tuple, opcional): Parâmetros da query.

#         Returns:
#             List[Dict]: Lista de registros como dicionários.
#         """
#         try:
#             connections["protheus"].ensure_connection()
#             with connections["protheus"].cursor() as cursor:
#                 cursor.execute(query, params or [])
#                 columns = [col[0] for col in cursor.description]
#                 return [dict(zip(columns, row)) for row in cursor.fetchall()]
#         except utils.OperationalError:
#             # Aqui você pode logar o erro no futuro
#             return []

#     @classmethod
#     def get_stock_summary(cls) -> List[Dict]:
#         """
#         Retorna o resumo de estoque atual dos produtos (código, descrição e saldo).
#         """
#         query = """
#             SELECT 
#                 SB1.B1_COD AS codigo,
#                 SB1.B1_DESC AS descricao,
#                 SB2.B2_QATU AS saldo
#             FROM 
#                 SB1010 SB1
#                 JOIN SB2010 SB2 ON SB1.B1_COD = SB2.B2_COD AND SB1.B1_FILIAL = SB2.B2_FILIAL
#             WHERE 
#                 SB1.D_E_L_E_T_ = ' ' AND
#                 SB2.D_E_L_E_T_ = ' '
#         """
#         return cls._execute_query(query)
    
#     @classmethod
#     def get_stock_movements(cls, page: int = 1, page_size: int = 50) -> List[Dict]:
#         """
#         Retorna os lançamentos de movimentações de estoque (SD3) com paginação Oracle.
#         """
#         start = (page - 1) * page_size + 1
#         end = start + page_size - 1

#         query = f"""
#             SELECT * FROM (
#                 SELECT 
#                     D3_COD, D3_TM, D3_EMISSAO, D3_QUANT, D3_CF, D3_DOC, D3_LOCAL,
#                     ROWNUM AS rownum_alias
#                 FROM SD3010
#                 WHERE D_E_L_E_T_ = ' '
#             )
#             WHERE rownum_alias BETWEEN %s AND %s
#         """
#         return cls._execute_query(query, params=(start, end))

#     @classmethod
#     def get_sales_summary(cls, months: int = 4) -> List[Dict]:
#         """
#         Retorna o resumo de vendas dos últimos `months` meses com total por produto.

#         Args:
#             months (int): Quantidade de meses retroativos.

#         Returns:
#             List[Dict]: Lista de vendas agregadas por produto.
#         """
#         start_date = (datetime.now() - timedelta(days=30 * months)).strftime("%Y%m%d")

#         query = """
#             SELECT 
#                 SD2.D2_COD AS codigo,
#                 SB1.B1_DESC AS descricao,
#                 SUM(SD2.D2_QUANT) AS quantidade,
#                 SUM(SD2.D2_TOTAL) AS valor
#             FROM 
#                 SD2010 SD2
#                 JOIN SF2010 SF2 ON SD2.D2_DOC = SF2.F2_DOC AND SD2.D2_SERIE = SF2.F2_SERIE
#                 JOIN SB1010 SB1 ON SD2.D2_COD = SB1.B1_COD
#             WHERE 
#                 SD2.D_E_L_E_T_ = ' ' AND
#                 SF2.D_E_L_E_T_ = ' ' AND
#                 SB1.D_E_L_E_T_ = ' ' AND
#                 SF2.F2_EMISSAO >= %s
#             GROUP BY
#                 SD2.D2_COD, SB1.B1_DESC
#         """
#         return cls._execute_query(query, params=(start_date,))
