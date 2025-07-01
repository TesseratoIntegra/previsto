# 📋 Dashboard Estoque Backend - Documentação Completa

## 🎯 Visão Geral

Sistema backend Django REST API para integração completa com o ERP **Protheus Oracle**, fornecendo dados de estoque, movimentações, vendas e liberações através de endpoints RESTful otimizados.

### 🏗️ Arquitetura

- **Framework:** Django 5.2.3 + Django REST Framework 3.16.0
- **Banco de Dados:** Oracle (Protheus) + SQLite (Django)
- **Integração:** Conexão direta com tabelas Protheus via oracledb
- **Padrão:** MVS (Model-View-Service) com database routing

---

## 🚀 Funcionalidades Principais

### ✅ Módulos Implementados:
- 📦 **Estoque (SB1/SB2)** - Produtos e saldos atuais
- 🔄 **Movimentações (SD3)** - Histórico de entradas/saídas
- 📈 **Vendas (SC5/SC6)** - Pedidos e faturamento
- 🚚 **Liberações (SC9)** - Status de entregas e bloqueios

### ✅ Características Técnicas:
- **Paginação customizada** com metadados completos
- **Filtros dinâmicos** por filial, local, período
- **Status calculados** em tempo real
- **Queries otimizadas** para performance Oracle
- **Tratamento robusto** de erros e timeouts

---

## 🔗 API Endpoints Disponíveis

### 📦 1. Estoque (SB1/SB2)

#### `GET /api/v1/stocks/`
**Descrição:** Dados de estoque atual com informações de produto

**Parâmetros:**
- `filial` (str, opcional) - Código da filial (ex: "01")
- `armazem` (str, opcional) - Código do armazém (ex: "01") 
- `page` (int, opcional) - Número da página (padrão: 1)
- `page_size` (int, opcional) - Itens por página (padrão: 50, max: 1000)

**Resposta:**
```json
{
  "count": 2500,
  "next": "http://api/v1/stocks/?page=2",
  "previous": null,
  "total_pages": 50,
  "current_page": 1,
  "page_size": 50,
  "results": [
    {
      "code": "PROD001",
      "description": "PRODUTO EXEMPLO",
      "balance": 150.0,
      "filial": "01",
      "local": "01"
    }
  ]
}
```

**Fonte de Dados:** SB1010 (produtos) + SB2010 (saldos)

---

### 🔄 2. Movimentações (SD3)

#### `GET /api/v1/stocks_moviment/`
**Descrição:** Histórico de movimentações de estoque

**Parâmetros:**
- `filial` (str, opcional) - Código da filial
- `local` (str, opcional) - Código do armazém
- `page` (int, opcional) - Paginação
- `page_size` (int, opcional) - Itens por página

**Resposta:**
```json
{
  "count": 10000,
  "results": [
    {
      "code": "PROD001",
      "movement_type": "501",
      "date": "2024-12-15",
      "quantity": 25.0,
      "fiscal_code": "5102",
      "document": "000001234",
      "location": "01",
      "filial": "01"
    }
  ]
}
```

**Fonte de Dados:** SD3010 (movimentações) + SB1010 (produtos)

---

### 📈 3. Vendas (SC5/SC6)

#### `GET /api/v1/sales/`
**Descrição:** Dados de vendas combinados com movimentações de saída

**Parâmetros:**
- `meses` (int, opcional) - Período de análise em meses (padrão: 4)
- `filial` (str, opcional) - Código da filial
- `armazem` (str, opcional) - Código do armazém

**Resposta:**
```json
{
  "results": [
    {
      "code": "PROD001",
      "description": "PRODUTO EXEMPLO",
      "quantity": 100.0,
      "value": 2500.00,
      "filial": "01",
      "local": "01"
    }
  ]
}
```

**Fonte de Dados:** SC5010 (pedidos) + SC6010 (itens) + SD3010 (movimentações)

---

# 📊 Dashboard Estoque Frontend

Frontend React para visualização de dados de estoque do sistema Protheus.

## 🚀 Tecnologias

- **React 18** - Framework principal
- **SCSS** - Estilização modular
- **Axios** - Requisições HTTP
- **CSS Grid/Flexbox** - Layout responsivo

## 📁 Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── common/          # Componentes reutilizáveis
│   ├── StockTable/      # Tabela de estoque
│   └── Layout/          # Layout principal
├── services/            # Serviços de API
├── hooks/               # Custom hooks
├── utils/               # Utilitários
└── styles/              # Estilos globais
```

## 🛠️ Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Iniciar desenvolvimento
npm start
```

## 🔧 Configuração

Configure as variáveis no arquivo `.env`:

```env
REACT_APP_API_BASE_URL=http://127.0.0.1:8000/api/v1
REACT_APP_API_TIMEOUT=30000
```

## 📊 Funcionalidades

- ✅ **Visualização completa** dos dados SB2 (Saldos em Estoque)
- ✅ **Paginação** com controle de itens por página
- ✅ **Filtros** por filial e armazém
- ✅ **Status calculados** em tempo real
- ✅ **Design responsivo** para mobile e desktop
- ✅ **Loading states** e tratamento de erros

## 🎨 Componentes Principais

### StockTable
Componente principal que gerencia a tabela de estoque com:
- Carregamento de dados
- Filtros e paginação
- Estados de loading e erro

### StockRow
Linha da tabela apresentando todos os campos SB2:
- Dados básicos (filial, código, descrição)
- Quantidades (atual, reservada, pedidos)
- Status calculados (disponível, % reservado)

### StockFilters
Filtros para refinamento dos dados:
- Filtro por filial
- Filtro por armazém
- Seleção de itens por página

## 🔄 Integração com Backend

O frontend consome a API Django REST em:
- `GET /api/v1/stocks/` - Dados de estoque paginados
- Filtros: `filial`, `armazem`, `page`, `page_size`

## 📱 Responsividade

- **Mobile First** - Design otimizado para dispositivos móveis
- **Breakpoints** - sm (640px), md (768px), lg (1024px), xl (1280px)
- **Tabela responsiva** - Scroll horizontal em telas pequenas

## 🎯 Scripts Disponíveis

- `npm start` - Inicia servidor de desenvolvimento
- `npm build` - Gera build de produção
- `npm test` - Executa testes
- `npm run eject` - Ejeta configuração (irreversível)

## 🔍 Campos Exibidos

### SB2 (Saldos em Estoque):
- **B2_FILIAL** - Filial
- **B2_COD** - Código do Produto
- **B2_LOCAL** - Local/Armazém
- **B2_QATU** - Quantidade Atual
- **B2_RESERVA** - Quantidade Reservada
- **B2_QPEDVEN** - Quantidade em Pedido de Venda

### SB1 (Produtos) - Dados Relacionados:
- **B1_DESC** - Descrição do Produto
- **B1_TIPO** - Tipo do Produto
- **B1_UM** - Unidade de Medida
- **B1_GRUPO** - Grupo do Produto

### Campos Calculados:
- **Saldo Disponível** - B2_QATU - B2_RESERVA
- **% Reservado** - (B2_RESERVA / B2_QATU) * 100
- **Status** - Baseado nos saldos disponíveis

## 🚀 Deploy

Para produção, configure:

```env
REACT_APP_API_BASE_URL=https://sua-api-producao.com/api/v1
```

E execute:

```bash
npm run build
```

### 🚚 4. Liberações/Entregas (SC9) - **NOVO**

#### `GET /api/v1/deliveries/`
**Descrição:** Liberações de pedidos com status completo

**Parâmetros:**
- `filial` (str, opcional) - Código da filial
- `local` (str, opcional) - Código do armazém
- `days` (int, opcional) - Últimos N dias (padrão: 30)
- `page` (int, opcional) - Paginação
- `page_size` (int, opcional) - Itens por página

**Resposta:**
```json
{
  "count": 150,
  "results": [
    {
      "pedido": "123456",
      "item": "01",
      "sequencia": "001",
      "produto": "PROD001",
      "descricao": "PRODUTO EXEMPLO",
      "quantidade_liberada": 10.0,
      "preco_venda": 25.50,
      "valor_total": 255.00,
      "data_liberacao": "2024-12-15",
      "local": "01",
      "lote": "L001",
      "data_validade": "2025-06-15",
      "ordem_separacao": "OS001",
      "nota_fiscal": "000123",
      "serie_nf": "1",
      "status_liberacao": "FATURADO",
      "bloqueio_estoque": "",
      "bloqueio_credito": "",
      "filial": "01"
    }
  ]
}
```

#### `GET /api/v1/deliveries/status/`
**Descrição:** Resumo quantitativo por status de liberação

**Parâmetros:**
- `filial` (str, opcional) - Código da filial
- `days` (int, opcional) - Período em dias (padrão: 7)

**Resposta:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "status": "FATURADO",
      "quantidade": 45,
      "valor_total": 12500.00
    },
    {
      "status": "LIBERADO",
      "quantidade": 23,
      "valor_total": 5800.00
    },
    {
      "status": "BLOQ_ESTOQUE",
      "quantidade": 8,
      "valor_total": 2100.00
    }
  ]
}
```

#### `GET /api/v1/deliveries/pending/`
**Descrição:** Liberações prontas para faturamento (sem bloqueios)

**Parâmetros:**
- `filial` (str, opcional) - Código da filial
- `local` (str, opcional) - Código do armazém

**Resposta:**
```json
{
  "count": 25,
  "results": [
    {
      "filial": "01",
      "pedido": "123456",
      "produto": "PROD001",
      "descricao": "PRODUTO EXEMPLO",
      "local": "01",
      "total_liberado": 50.0,
      "valor_total": 1275.00,
      "primeira_liberacao": "2024-12-10",
      "ultima_liberacao": "2024-12-15",
      "total_itens": 3
    }
  ]
}
```

**Fonte de Dados:** SC9010 (liberações) + SB1010 (produtos)

---

## 📊 Status de Liberação (SC9)

### 🎯 Status Calculados Dinamicamente:

| Status | Descrição | Condição SQL |
|--------|-----------|--------------|
| **FATURADO** | Já possui nota fiscal | `C9_NFISCAL != ' '` |
| **LIBERADO** | Pronto para faturar | `C9_OK = 'S'` e sem bloqueios |
| **BLOQ_ESTOQUE** | Bloqueado por estoque | `C9_BLEST != '  '` |
| **BLOQ_CREDITO** | Bloqueado por crédito | `C9_BLCRED != '  '` |
| **PENDENTE** | Em análise | Demais casos |

### 🔍 Campos Principais SC9:

#### Identificação:
- `C9_FILIAL` - Filial
- `C9_PEDIDO` - Número do pedido
- `C9_ITEM` - Item do pedido
- `C9_SEQUEN` - Sequência da liberação
- `C9_PRODUTO` - Código do produto

#### Quantidades e Valores:
- `C9_QTDLIB` - Quantidade liberada
- `C9_PRCVEN` - Preço de venda unitário
- `C9_DATALIB` - Data da liberação

#### Controle e Rastreamento:
- `C9_LOCAL` - Local/armazém
- `C9_LOTECTL` - Lote
- `C9_DTVALID` - Data de validade
- `C9_ORDSEP` - Ordem de separação
- `C9_NFISCAL` - Nota fiscal gerada
- `C9_SERIENF` - Série da nota fiscal

#### Status e Bloqueios:
- `C9_BLEST` - Bloqueio de estoque
- `C9_BLCRED` - Bloqueio de crédito
- `C9_OK` - Liberação confirmada

---

## 🛠️ Estrutura Técnica

### 📁 Estrutura de Arquivos:

```
dashboard-estoque-backend/
├── core/
│   ├── settings.py           # Configurações Django + Oracle
│   ├── urls.py              # URLs principais
│   ├── db_router.py         # Roteamento de banco de dados
│   └── monkey_patch_oracle.py # Patch para compatibilidade Oracle
├── protheus/
│   ├── models.py            # Models das tabelas Protheus
│   ├── services.py          # Lógica de negócio e queries SQL
│   ├── views.py             # Views da API REST
│   ├── serializers.py       # Serialização de dados
│   ├── urls.py              # URLs do app protheus
│   ├── filters.py           # Filtros personalizados
│   └── migrations/          # Migrações Django
├── manage.py
├── requirements.txt
└── .gitignore
```

### 🗄️ Configuração de Banco de Dados:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    },
    'protheus': {
        'ENGINE': 'django.db.backends.oracle',
        'NAME': '192.168.0.12:1521/ORCL',
        'USER': 'P11PROD',
        'PASSWORD': 'P11PROD',
    },
}

DATABASE_ROUTERS = ['protheus.db_router.ProtheusRouter']
```

### 🔄 Database Router:

```python
class ProtheusRouter:
    def db_for_read(self, model, **hints):
        if model._meta.app_label == 'protheus':
            return 'protheus'
        return None
    
    def db_for_write(self, model, **hints):
        if model._meta.app_label == 'protheus':
            return 'protheus'
        return None
```

---

## 📋 Models Implementados

### 🏷️ ProtheusSB1 (Produtos):
```python
class ProtheusSB1(models.Model):
    B1_FILIAL = models.CharField(max_length=2)
    B1_COD = models.CharField(max_length=15, primary_key=True)
    B1_DESC = models.CharField(max_length=100)
    B1_TIPO = models.CharField(max_length=2)
    B1_UM = models.CharField(max_length=2)
    B1_GRUPO = models.CharField(max_length=4)
    
    class Meta:
        managed = False
        db_table = 'SB1010'
```

### 📦 ProtheusSB2 (Saldos):
```python
class ProtheusSB2(models.Model):
    B2_FILIAL = models.CharField(max_length=2)
    B2_COD = models.CharField(max_length=15, primary_key=True)
    B2_LOCAL = models.CharField(max_length=2)
    B2_QATU = models.FloatField()
    B2_RESERVA = models.FloatField()
    B2_QPEDVEN = models.FloatField()
    
    class Meta:
        managed = False
        db_table = 'SB2010'
```

### 🔄 ProtheusSD3 (Movimentações):
```python
class ProtheusSD3(models.Model):
    D3_FILIAL = models.CharField(max_length=2)
    D3_COD = models.CharField(max_length=15, primary_key=True)
    D3_TM = models.CharField(max_length=2)
    D3_EMISSAO = models.DateField()
    D3_QUANT = models.FloatField()
    D3_CF = models.CharField(max_length=10)
    D3_DOC = models.CharField(max_length=9)
    D3_LOCAL = models.CharField(max_length=2)
    
    class Meta:
        managed = False
        db_table = 'SD3010'
```

### 🚚 ProtheusSC9 (Liberações) - **NOVO**:
```python
class ProtheusSC9(models.Model):
    C9_FILIAL = models.CharField(max_length=2)
    C9_PEDIDO = models.CharField(max_length=6)
    C9_ITEM = models.CharField(max_length=2)
    C9_SEQUEN = models.CharField(max_length=3)
    C9_PRODUTO = models.CharField(max_length=15)
    C9_QTDLIB = models.FloatField()
    C9_PRCVEN = models.FloatField()
    C9_DATALIB = models.DateField(null=True, blank=True)
    C9_LOCAL = models.CharField(max_length=2)
    C9_LOTECTL = models.CharField(max_length=10, blank=True, null=True)
    C9_DTVALID = models.DateField(null=True, blank=True)
    C9_ORDSEP = models.CharField(max_length=6, blank=True, null=True)
    C9_BLEST = models.CharField(max_length=2, blank=True, null=True)
    C9_BLCRED = models.CharField(max_length=2, blank=True, null=True)
    C9_OK = models.CharField(max_length=2, blank=True, null=True)
    C9_NFISCAL = models.CharField(max_length=9, blank=True, null=True)
    C9_SERIENF = models.CharField(max_length=3, blank=True, null=True)
    
    class Meta:
        managed = False
        db_table = 'SC9010'
    
    @property
    def status_liberacao(self):
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
```

---

## ⚙️ Services e Queries

### 🔍 Exemplo de Query Otimizada (SC9):

```sql
SELECT 
    SC9.C9_FILIAL as filial,
    SC9.C9_PEDIDO as pedido,
    SC9.C9_PRODUTO as produto,
    SB1.B1_DESC as descricao,
    SC9.C9_QTDLIB as quantidade_liberada,
    SC9.C9_PRCVEN as preco_venda,
    (SC9.C9_QTDLIB * SC9.C9_PRCVEN) as valor_total,
    SC9.C9_DATALIB as data_liberacao,
    SC9.C9_NFISCAL as nota_fiscal,
    
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
AND SC9.C9_DATALIB >= SYSDATE - :days
ORDER BY SC9.C9_DATALIB DESC
```

### 🎯 Características das Queries:
- **JOINs otimizados** entre tabelas relacionadas
- **Filtros de performance** (D_E_L_E_T_ = ' ')
- **Cálculos em SQL** para melhor performance
- **Paginação eficiente** com ROW_NUMBER() / LIMIT
- **Tratamento de NULL** com COALESCE/CASE

---

## 🔧 Configuração e Deploy

### 📦 Dependências (requirements.txt):
```txt
Django==5.2.3
djangorestframework==3.16.0
django-cors-headers==4.7.0
django-filter==25.1
oracledb==3.1.1
pandas==2.3.0
openpyxl==3.1.5
python-dateutil==2.9.0.post0
pytz==2025.2
```

### 🚀 Comandos de Instalação:
```bash
# Instalar dependências
pip install -r requirements.txt

# Aplicar migrações
python manage.py migrate

# Executar servidor
python manage.py runserver
```

### 🔐 Configurações de Segurança:
```python
# Para produção, usar variáveis de ambiente:
DATABASES = {
    'protheus': {
        'ENGINE': 'django.db.backends.oracle',
        'NAME': os.environ.get('ORACLE_DSN'),
        'USER': os.environ.get('ORACLE_USER'),
        'PASSWORD': os.environ.get('ORACLE_PASSWORD'),
    },
}

# CORS para produção:
CORS_ALLOWED_ORIGINS = [
    "https://seu-frontend.com",
]
```

---

## 📈 Performance e Otimizações

### ⚡ Otimizações Implementadas:
- **Conexão direta Oracle** sem ORM pesado
- **Queries SQL nativas** otimizadas
- **Paginação eficiente** com LIMIT/OFFSET
- **Índices implícitos** nas chaves primárias
- **Filtros por período** para reduzir dataset
- **CORS otimizado** para requests cross-origin

### 📊 Métricas Esperadas:
- **Estoque:** ~2.500 produtos, resposta < 1s
- **Movimentações:** ~10.000 registros/mês, resposta < 2s
- **Liberações SC9:** ~500 registros/dia, resposta < 1s
- **Paginação:** 50-1000 itens/página otimizada

---

## 🔍 Filtros e Parâmetros

### 🎛️ Filtros Disponíveis:

| Endpoint | Parâmetros | Exemplo |
|----------|------------|---------|
| `/stocks/` | `filial`, `armazem`, `page`, `page_size` | `?filial=01&armazem=01` |
| `/stocks_moviment/` | `filial`, `local`, `page`, `page_size` | `?filial=01&page_size=100` |
| `/sales/` | `meses`, `filial`, `armazem` | `?meses=6&filial=01` |
| `/deliveries/` | `filial`, `local`, `days`, `page`, `page_size` | `?days=15&filial=01` |
| `/deliveries/status/` | `filial`, `days` | `?days=7&filial=01` |
| `/deliveries/pending/` | `filial`, `local` | `?filial=01&local=01` |

### 🔎 Filtros Especiais:
- **Período temporal:** `days`, `meses` para análises específicas
- **Localização:** `filial`, `local`, `armazem` para segmentação
- **Paginação:** `page`, `page_size` para performance
- **Status dinâmicos:** Calculados automaticamente

---

## 🚨 Tratamento de Erros

### ❌ Códigos de Erro:

| Código | Descrição | Solução |
|--------|-----------|---------|
| **500** | Erro de conexão Oracle | Verificar credenciais e rede |
| **404** | Endpoint não encontrado | Verificar URL da API |
| **400** | Parâmetros inválidos | Verificar formato dos filtros |
| **408** | Timeout na query | Reduzir período ou adicionar filtros |

### 🛠️ Logs e Debug:
```python
# Logs estruturados para debug:
logger.info(f"Query estoque: {sql}")
logger.info(f"Estoque: {len(results)} registros")

# Tratamento robusto:
try:
    cursor.execute(sql, params)
    return results
except Exception as e:
    logger.error(f"Erro na query: {e}")
    return []
```

---

## 🎯 Casos de Uso

### 📊 Dashboard de Gestão:
```bash
# Resumo de estoque
GET /api/v1/stocks/?page_size=1000

# Status das liberações últimos 7 dias
GET /api/v1/deliveries/status/?days=7

# Liberações pendentes por filial
GET /api/v1/deliveries/pending/?filial=01
```

### 📈 Relatórios Analíticos:
```bash
# Vendas últimos 6 meses
GET /api/v1/sales/?meses=6

# Movimentações por período
GET /api/v1/stocks_moviment/?page_size=1000

# Liberações com filtros específicos
GET /api/v1/deliveries/?filial=01&days=30&page_size=500
```

### 🔍 Consultas Específicas:
```bash
# Produtos específicos
GET /api/v1/stocks/?B2_COD=PROD001

# Liberações por pedido
GET /api/v1/deliveries/?pedido=123456

# Status consolidado
GET /api/v1/deliveries/status/?filial=01&days=30
```

---

## 🆕 Changelog - Implementação SC9

### ✨ Novas Funcionalidades:
- **Model ProtheusSC9** completo para tabela SC9010
- **3 Novos Endpoints** de liberações com filtros avançados
- **Status dinâmicos** calculados em tempo real
- **Queries otimizadas** para performance Oracle
- **Serializers dedicados** para formatação de dados

### 🔧 Melhorias Técnicas:
- **Conexão Oracle corrigida** (`connections['protheus']`)
- **Database routing** otimizado para múltiplas conexões
- **Tratamento de erros** robusto e estruturado
- **Paginação customizada** com metadados completos
- **Logging estruturado** para debug e monitoramento

### 🗑️ Remoções:
- **App uploads** removido (funcionalidade não utilizada)
- **Views comentadas** limpas do código
- **Dependências desnecessárias** removidas

---

## 🏁 Conclusão

O **Dashboard Estoque Backend** oferece uma **API REST completa e otimizada** para integração com o ERP Protheus, fornecendo dados em tempo real de:

- ✅ **Estoque atual** com produtos e saldos
- ✅ **Movimentações históricas** de entrada/saída  
- ✅ **Vendas e faturamento** consolidados
- ✅ **Liberações e entregas** com status dinâmicos

### 🎯 Características Destacadas:
- **Performance otimizada** com queries SQL nativas
- **Flexibilidade total** com filtros dinâmicos
- **Escalabilidade** através de paginação eficiente
- **Confiabilidade** com tratamento robusto de erros
- **Segurança** via database routing e validações

**Sistema pronto para produção, totalmente documentado e versionado no Git.** 🚀
