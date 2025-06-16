# 📦 API Protheus – Integração de Estoque, Vendas e Movimentações

Este módulo `protheus` integra dados diretamente do sistema ERP **Protheus** via banco Oracle, permitindo consultas de **estoque**, **vendas** e **movimentações de estoque**. Todos os endpoints estão disponíveis via API REST com suporte a paginação.

---

## 🚀 Funcionalidades

- 🔍 Consultar **saldo de estoque atual** por produto.
- 📈 Consultar **vendas agregadas** por produto nos últimos meses.
- 🔄 Listar **movimentações de estoque** (entradas, saídas, transferências etc.).
- 📄 Respostas padronizadas com paginação automática.

---

## 🔗 Endpoints Disponíveis

### 1. 📦 Resumo de Estoque

- **URL:** `/api/v1/stocks/`
- **Método:** `GET`
- **Descrição:** Retorna o saldo atual em estoque dos produtos.
- **Suporta paginação:** ✅

#### Parâmetros

| Parâmetro    | Tipo    | Padrão | Descrição                         |
|--------------|---------|--------|-----------------------------------|
| `page`       | int     | 1      | Número da página                  |
| `page_size`  | int     | 50     | Tamanho da página (máx: 1000)     |

#### Exemplo de Resposta

```json
{
  "count": 250,
  "next": "/api/v1/stocks/?page=2",
  "previous": null,
  "results": [
    {
      "code": "000001234",
      "description": "COMPRESSOR 10PÉS 110V",
      "balance": 42.0
    }
  ]
}
```

---

### 2. 📊 Resumo de Vendas

- **URL:** `/api/v1/sales/`
- **Método:** `GET`
- **Descrição:** Retorna o total de vendas (quantidade e valor) por produto.
- **Suporta paginação:** ✅

#### Parâmetros

| Parâmetro    | Tipo    | Padrão | Descrição                         |
|--------------|---------|--------|-----------------------------------|
| `meses`      | int     | 4      | Quantidade de meses a buscar      |
| `page`       | int     | 1      | Número da página                  |
| `page_size`  | int     | 50     | Tamanho da página (máx: 1000)     |

#### Exemplo de Resposta

```json
{
  "count": 180,
  "next": "/api/v1/sales/?page=2",
  "previous": null,
  "results": [
    {
      "code": "000001234",
      "description": "COMPRESSOR 10PÉS 110V",
      "quantity": 120,
      "value": 48500.25
    }
  ]
}
```

---

### 3. 🔁 Movimentações de Estoque (SD3)

- **URL:** `/api/v1/stocks_moviment/`
- **Método:** `GET`
- **Descrição:** Retorna os lançamentos de movimentações de estoque (entradas, saídas, ajustes etc.).
- **Suporta paginação SQL via ROWNUM:** ✅

#### Parâmetros

| Parâmetro    | Tipo    | Padrão | Descrição                         |
|--------------|---------|--------|-----------------------------------|
| `page`       | int     | 1      | Número da página                  |
| `page_size`  | int     | 50     | Tamanho da página (máx: 1000)     |

#### Exemplo de Resposta

```json
{
  "page": 1,
  "page_size": 50,
  "results": [
    {
      "code": "000001234",
      "movement_type": "RE1",
      "date": "2024-03-18",
      "quantity": 12.0,
      "fiscal_code": "5102",
      "document": "NF098123",
      "location": "01"
    }
  ]
}
```

---

## ⚙️ Estrutura Interna

### 🧱 Models

Modelos não gerenciados (`managed = False`) que refletem tabelas Oracle do Protheus:

- `ProtheusSB1` → Produtos
- `ProtheusSB2` → Saldos
- `ProtheusSF2` → Notas fiscais de saída
- `ProtheusSD2` → Itens de venda
- `ProtheusSD3` → Movimentações de estoque

### 🔍 Serviços

- `get_stock_summary()` – saldo atual de estoque
- `get_sales_summary(months)` – resumo de vendas
- `get_stock_movements(page, page_size)` – movimentações paginadas via SQL

### 📦 Serializers

- `StockSummarySerializer`
- `SalesSumarySerializer`
- `StockMovementSerializer`

### 🔐 Segurança

- Todas as views estão preparadas para uso com `IsAuthenticated`, basta descomentar.
