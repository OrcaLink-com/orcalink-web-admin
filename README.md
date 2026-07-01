# orca-link-admin

Painel Administrativo do OrcaLink (React + Vite, **web**). Roda na porta **5175**.

## Pré-requisitos
- Node 20+ e o backend `api/` rodando (CORS liberado para 5175).

## Setup
```bash
cp .env.example .env          # (Windows: copy .env.example .env)
npm install
npm run dev                   # http://localhost:5175
```

## Acesso
- Login por **OTP** restrito a `ADMIN`/`SUPER_ADMIN`. O seed cria `admin@orcalink.com.br`.

## Telas
- **Dashboard** — métricas (clientes, prestadores, orçamentos por status, propostas).
- **Prestadores** — gerar convite, filtrar por status, aprovar/rejeitar, **editar comissão**.
- **Categorias** — listar, criar, ativar/desativar.

## Tipos da API
```bash
npm run gen:api   # gera src/lib/api-schema.d.ts a partir de ../api/openapi.json
```
