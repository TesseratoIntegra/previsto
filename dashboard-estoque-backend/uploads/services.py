# import pandas as pd
# import numpy as np


# class DataProcessorService:
#     """
#     Serviço para processar dados de estoque e vendas
#     """
    
#     @staticmethod
#     def process_data(estoque_data, vendas_data, meses_analise=4, cobertura_ideal=2):
#         """
#         Processa dados de estoque e vendas
        
#         Args:
#             estoque_data: Dados de estoque
#             vendas_data: Dados de vendas
#             meses_analise: Quantidade de meses para análise
#             cobertura_ideal: Cobertura ideal de estoque em meses
#         """
#         # Normaliza dados de estoque
#         estoque_normalizado = {}
#         for item in estoque_data:
#             codigo = item.get('codigo')
#             if codigo:
#                 estoque_normalizado[codigo] = {
#                     'codigo': codigo,
#                     'descricao': item.get('descricao', ''),
#                     'saldo': float(item.get('saldo', 0))
#                 }
        
#         # Agrega vendas por código de produto
#         vendas_agregadas = {}
#         for item in vendas_data:
#             codigo = item.get('codigo')
#             if codigo:
#                 if codigo not in vendas_agregadas:
#                     vendas_agregadas[codigo] = {
#                         'codigo': codigo,
#                         'descricao': item.get('descricao', ''),
#                         'quantidade': 0,
#                         'valor': 0
#                     }
                
#                 vendas_agregadas[codigo]['quantidade'] += float(item.get('quantidade', 0))
#                 vendas_agregadas[codigo]['valor'] += float(item.get('valor', 0))
        
#         # Calcular métricas e combinar dados
#         combined = []
        
#         # Calcular valor total de vendas para PDV
#         valor_total_vendas = sum(venda['valor'] for venda in vendas_agregadas.values())
        
#         # Processar dados de vendas
#         for codigo, venda in vendas_agregadas.items():
#             estoque_info = estoque_normalizado.get(codigo, {
#                 'codigo': codigo,
#                 'descricao': venda['descricao'],
#                 'saldo': 0
#             })
            
#             venda_total = venda['quantidade']
#             valor_total = venda['valor']
#             media_mensal = venda_total / meses_analise
#             estoque = estoque_info['saldo']
#             pdv = (valor_total / valor_total_vendas) * 100 if valor_total_vendas > 0 else 0
#             cobertura = estoque / media_mensal if media_mensal > 0 else 0
#             estoque_ideal = np.ceil(media_mensal * cobertura_ideal)
#             sugestao_abastecimento = max(0, estoque_ideal - estoque)
            
#             # Determinar status do estoque
#             if cobertura < 1:
#                 status = 'CRÍTICO'
#             elif cobertura < 2:
#                 status = 'BAIXO'
#             elif cobertura > 3:
#                 status = 'EXCESSO'
#             else:
#                 status = 'ADEQUADO'
            
#             # Determinar prioridade de abastecimento
#             if status == 'CRÍTICO':
#                 prioridade = 'ALTA'
#             elif status == 'BAIXO':
#                 prioridade = 'MÉDIA'
#             else:
#                 prioridade = 'BAIXA'
            
#             combined.append({
#                 'codigo': codigo,
#                 'produto': estoque_info['descricao'],
#                 'vendaTotal': venda_total,
#                 'valorTotal': valor_total,
#                 'mediaMensal': media_mensal,
#                 'estoque': estoque,
#                 'pdv': pdv,
#                 'cobertura': cobertura,
#                 'estoqueIdeal': estoque_ideal,
#                 'sugestaoAbastecimento': sugestao_abastecimento,
#                 'status': status,
#                 'prioridade': prioridade
#             })
        
#         # Adicionar produtos que estão no estoque mas não têm vendas
#         for codigo, estoque in estoque_normalizado.items():
#             if codigo not in vendas_agregadas:
#                 combined.append({
#                     'codigo': codigo,
#                     'produto': estoque['descricao'],
#                     'vendaTotal': 0,
#                     'valorTotal': 0,
#                     'mediaMensal': 0,
#                     'estoque': estoque['saldo'],
#                     'pdv': 0,
#                     'cobertura': float('inf') if estoque['saldo'] > 0 else 0,
#                     'estoqueIdeal': 0,
#                     'sugestaoAbastecimento': 0,
#                     'status': 'SEM VENDAS',
#                     'prioridade': 'BAIXA'
#                 })
        
#         return combined


# class FileProcessorService:
#     """
#     Serviço para processar arquivos de estoque e vendas
#     """
    
#     @staticmethod
#     def process_estoque_file(file):
#         """
#         Processa arquivo de estoque
        
#         Args:
#             file: Arquivo de estoque
#         """
#         try:
#             # Detecta o tipo de arquivo
#             if file.name.endswith('.csv'):
#                 # Tenta diferentes separadores e encodings
#                 try:
#                     df = pd.read_csv(file, sep=';', encoding='utf-8')
#                 except:
#                     try:
#                         df = pd.read_csv(file, sep=',', encoding='utf-8')
#                     except:
#                         try:
#                             df = pd.read_csv(file, sep=';', encoding='latin1')
#                         except:
#                             df = pd.read_csv(file, sep=',', encoding='latin1')
#             elif file.name.endswith('.xlsx'):
#                 df = pd.read_excel(file)
#             else:
#                 raise ValueError("Formato de arquivo não suportado")
            
#             # Procura por cabeçalhos em diferentes linhas
#             for i in range(10):  # Verifica as primeiras 10 linhas
#                 if i > 0:
#                     df = pd.read_excel(file, header=i) if file.name.endswith('.xlsx') else pd.read_csv(file, header=i)
                
#                 # Verifica se as colunas parecem ser de estoque
#                 columns = [col.lower() for col in df.columns]
#                 if any('produto' in col for col in columns) or any('cod' in col for col in columns):
#                     if any('saldo' in col for col in columns) or any('estoque' in col for col in columns):
#                         break
            
#             # Normaliza os dados
#             result = []
#             for _, row in df.iterrows():
#                 item = {}
                
#                 # Procura por colunas relevantes
#                 for col in df.columns:
#                     col_lower = col.lower()
                    
#                     # Código do produto
#                     if 'produto' in col_lower or 'cod' in col_lower:
#                         item['codigo'] = str(row[col])
                    
#                     # Descrição
#                     if 'descr' in col_lower or 'nome' in col_lower or 'produtop' in col_lower:
#                         item['descricao'] = str(row[col])
                    
#                     # Saldo/Estoque
#                     if 'saldo' in col_lower or 'estoque' in col_lower:
#                         item['saldo'] = float(row[col]) if pd.notna(row[col]) else 0
                
#                 # Se não encontrou código ou descrição, tenta usar a posição das colunas
#                 if 'codigo' not in item and len(df.columns) > 0:
#                     item['codigo'] = str(row[df.columns[0]])
                
#                 if 'descricao' not in item and len(df.columns) > 2:
#                     item['descricao'] = str(row[df.columns[2]])
                
#                 if 'saldo' not in item and len(df.columns) > 4:
#                     item['saldo'] = float(row[df.columns[4]]) if pd.notna(row[df.columns[4]]) else 0
                
#                 # Adiciona apenas se tiver código
#                 if 'codigo' in item and item['codigo'] and str(item['codigo']).lower() != 'nan':
#                     result.append(item)
            
#             return result
        
#         except Exception as e:
#             raise ValueError(f"Erro ao processar arquivo de estoque: {str(e)}")
    
#     @staticmethod
#     def process_vendas_file(file):
#         """
#         Processa arquivo de vendas
        
#         Args:
#             file: Arquivo de vendas
#         """
#         try:
#             # Detecta o tipo de arquivo
#             if file.name.endswith('.csv'):
#                 # Tenta diferentes separadores e encodings
#                 try:
#                     df = pd.read_csv(file, sep=';', encoding='utf-8')
#                 except:
#                     try:
#                         df = pd.read_csv(file, sep=',', encoding='utf-8')
#                     except:
#                         try:
#                             df = pd.read_csv(file, sep=';', encoding='latin1')
#                         except:
#                             df = pd.read_csv(file, sep=',', encoding='latin1')
#             elif file.name.endswith('.xlsx'):
#                 df = pd.read_excel(file)
#             else:
#                 raise ValueError("Formato de arquivo não suportado")
            
#             # Procura por cabeçalhos em diferentes linhas
#             for i in range(10):  # Verifica as primeiras 10 linhas
#                 if i > 0:
#                     df = pd.read_excel(file, header=i) if file.name.endswith('.xlsx') else pd.read_csv(file, header=i)
                
#                 # Verifica se as colunas parecem ser de vendas
#                 columns = [col.lower() for col in df.columns]
#                 if any('cod' in col for col in columns) or any('produto' in col for col in columns):
#                     if any('quant' in col for col in columns) or any('valor' in col for col in columns):
#                         break
            
#             # Normaliza os dados
#             result = []
#             for _, row in df.iterrows():
#                 item = {}
                
#                 # Procura por colunas relevantes
#                 for col in df.columns:
#                     col_lower = col.lower()
                    
#                     # Código do produto
#                     if 'codpro' in col_lower or 'codigo' in col_lower:
#                         item['codigo'] = str(row[col])
                    
#                     # Descrição
#                     if 'descrpro' in col_lower or 'descricao' in col_lower:
#                         item['descricao'] = str(row[col])
                    
#                     # Quantidade
#                     if 'quant' in col_lower:
#                         item['quantidade'] = float(row[col]) if pd.notna(row[col]) else 0
                    
#                     # Valor
#                     if 'valor' in col_lower or 'vlrtotal' in col_lower:
#                         item['valor'] = float(row[col]) if pd.notna(row[col]) else 0
                
#                 # Se não encontrou código ou descrição, tenta usar a posição das colunas
#                 if 'codigo' not in item and len(df.columns) > 0:
#                     item['codigo'] = str(row[df.columns[0]])
                
#                 if 'descricao' not in item and len(df.columns) > 1:
#                     item['descricao'] = str(row[df.columns[1]])
                
#                 if 'quantidade' not in item and len(df.columns) > 2:
#                     item['quantidade'] = float(row[df.columns[2]]) if pd.notna(row[df.columns[2]]) else 0
                
#                 if 'valor' not in item and len(df.columns) > 3:
#                     item['valor'] = float(row[df.columns[3]]) if pd.notna(row[df.columns[3]]) else 0
                
#                 # Adiciona apenas se tiver código
#                 if 'codigo' in item and item['codigo'] and str(item['codigo']).lower() != 'nan':
#                     result.append(item)
            
#             return result
        
#         except Exception as e:
#             raise ValueError(f"Erro ao processar arquivo de vendas: {str(e)}")
