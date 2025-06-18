# 📦 API Protheus – Integração com Estoque, Produtos e Movimentações

Este módulo `protheus` integra dados diretamente do sistema ERP **Protheus** via banco Oracle, expondo consultas de **produtos**, **estoque** e **movimentações** através de uma API RESTful robusta e com suporte a paginação e filtros dinâmicos.

---

## 🚀 Funcionalidades

- 🔍 Consultar **produtos cadastrados** no Protheus (SB1).
- 📦 Consultar **saldo de estoque atual** por produto e local (SB2).
- 🔁 Listar **movimentações de estoque** (entradas, saídas, ajustes – SD3).
- 📄 Respostas limpas com campos `CHAR` tratados automaticamente (sem espaços extras).
- 🔎 Filtros dinâmicos nos endpoints (`?campo=valor`).
- 📚 Padrão DRF com `ModelSerializer`, `ListAPIView`, paginação e ordenação preparados.

---

## 🔗 Endpoints Disponíveis

### 1. 📦 Resumo de Estoque (SB2)

- **URL:** `/api/v1/stocks/`
- **Método:** `GET`
- **Descrição:** Retorna o saldo atual em estoque dos produtos.
- **Suporta paginação:** ✅
- **Suporta filtros dinâmicos:** ✅

#### Parâmetros de Filtro

| Parâmetro    | Tipo    | Exemplo     | Descrição                      |
|--------------|---------|-------------|--------------------------------|
| `page`       | int     | `1`         | Página atual                   |
| `page_size`  | int     | `50`        | Quantidade por página          |
| `B2_FILIAL`  | str     | `01`        | Filial                         |
| `B2_LOCAL`   | str     | `01`        | Local/Depósito                 |

#### Exemplo de Resposta

```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "B2_FILIAL": "01",
      "B2_COD": "MOD305002",
      "B2_LOCAL": "01",
      "B2_QATU": 100.0,
      "B2_RESERVA": 10.0,
      "B2_QPEDVEN": 5.0
    }
  ]
}
```

---

### 2. 📊 Produtos (SB1)

- **URL:** `/api/v1/products/`
- **Método:** `GET`
- **Descrição:** Lista os produtos cadastrados no sistema.
- **Suporta paginação:** ✅
- **Suporta filtros dinâmicos:** ✅

#### Parâmetros de Filtro

| Parâmetro    | Tipo    | Exemplo      | Descrição                       |
|--------------|---------|--------------|---------------------------------|
| `B1_COD`     | str     | `MOD305002`  | Código do produto               |
| `B1_FILIAL`  | str     | `01`         | Filial                          |
| `B1_TIPO`    | str     | `PA`         | Tipo de produto                 |

#### Exemplo de Resposta

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "B1_FILIAL": "01",
      "B1_COD": "MOD305002",
      "B1_DESC": "MÃO DE OBRA MONTAGEM FINAL",
      "B1_TIPO": "PA",
      "B1_UM": "UN",
      "B1_GRUPO": "01"
    }
  ]
}
```

---

### 3. 🔁 Movimentações de Estoque (SD3)

- **URL:** `/api/v1/stocks_moviment/`
- **Método:** `GET`
- **Descrição:** Lista as movimentações de estoque (entradas, saídas, ajustes, etc.).
- **Suporta paginação:** ✅
- **Suporta filtros dinâmicos:** ✅

#### Parâmetros de Filtro

| Parâmetro    | Tipo    | Exemplo      | Descrição                          |
|--------------|---------|--------------|------------------------------------|
| `D3_COD`     | str     | `MOD305002`  | Código do produto                  |
| `D3_LOCAL`   | str     | `01`         | Local/depósito                     |
| `D3_DOC`     | str     | `NF123456`   | Número do documento fiscal         |

#### Exemplo de Resposta

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "D3_COD": "MOD305002",
      "D3_TM": "RE1",
      "D3_EMISSAO": "2024-03-18",
      "D3_QUANT": 12.0,
      "D3_CF": "5102",
      "D3_DOC": "NF098123",
      "D3_LOCAL": "01"
    }
  ]
}
```

---

### 🔎 Filtros Dinâmicos

- Suportam parâmetros como `?campo=valor` diretamente na URL.
- Todos os campos listados em `filterset_fields` das views estão disponíveis para filtragem automática.
- Filtros combinados são permitidos e ajudam a refinar os resultados sem necessidade de lógica adicional no frontend.
- Os campos do tipo `CharField` são tratados automaticamente com `.strip()` para evitar problemas com espaços em branco vindos do Protheus.

#### ✅ Exemplos práticos de uso

##### 📦 Estoque (`/api/v1/stocks/`)

- Filtrar por filial:
  ```http
  GET /api/v1/stocks/?B2_FILIAL=01
  ```

- Filtrar por filial e local:
  ```http
  GET /api/v1/stocks/?B2_FILIAL=01&B2_LOCAL=02
  ```

##### 📊 Produtos (`/api/v1/products/`)

- Buscar um produto pelo código:
  ```http
  GET /api/v1/products/?B1_COD=MOD305002
  ```

- Listar todos os produtos de uma filial específica:
  ```http
  GET /api/v1/products/?B1_FILIAL=01
  ```

- Combinação de filtros:
  ```http
  GET /api/v1/products/?B1_FILIAL=01&B1_TIPO=PA
  ```

##### 🔁 Movimentações (`/api/v1/stocks_moviment/`)

- Filtrar por produto:
  ```http
  GET /api/v1/stocks_moviment/?D3_COD=MOD305002
  ```

- Filtrar por local e documento:
  ```http
  GET /api/v1/stocks_moviment/?D3_LOCAL=01&D3_DOC=NF123456
  ```

---
