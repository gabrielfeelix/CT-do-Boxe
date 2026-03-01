# 📋 Plano de Implementação - Sistema de Aulas e Planos CT-Boxe

## 🎯 Objetivos

1. **Categorização de aulas** (infantil/adulto/todos + grupo/individual)
2. **Aulas recorrentes** (repetem toda semana do ano)
3. **Exclusão inteligente** (só esta ou todas futuras)
4. **Planos com renovação automática** (4 planos totais)
5. **Lógica de cobrança recorrente** (Mercado Pago assinaturas)

---

## 📐 Arquitetura de Dados

### **Alterações na Tabela `aulas`**

```sql
ALTER TABLE aulas
ADD COLUMN categoria TEXT DEFAULT 'todos'
  CHECK (categoria IN ('infantil', 'adulto', 'todos'));

ALTER TABLE aulas
ADD COLUMN tipo_aula TEXT DEFAULT 'grupo'
  CHECK (tipo_aula IN ('grupo', 'individual'));

ALTER TABLE aulas
ADD COLUMN serie_id UUID DEFAULT NULL;

CREATE INDEX idx_aulas_serie ON aulas(serie_id);
```

### **Alterações na Tabela `planos`**

```sql
ALTER TABLE planos
ADD COLUMN recorrencia_automatica BOOLEAN DEFAULT false;

ALTER TABLE planos
ADD COLUMN tipo_acesso TEXT DEFAULT 'grupo'
  CHECK (tipo_acesso IN ('grupo', 'individual'));

ALTER TABLE planos
ADD COLUMN mercadopago_plan_id TEXT DEFAULT NULL;
```

### **Nova Tabela `series_aulas`**

```sql
CREATE TABLE series_aulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('infantil', 'adulto', 'todos')),
  tipo_aula TEXT NOT NULL CHECK (tipo_aula IN ('grupo', 'individual')),
  professor TEXT DEFAULT 'Argel Riboli',
  capacidade_maxima INTEGER DEFAULT 16,
  ativo BOOLEAN DEFAULT true,
  data_inicio DATE NOT NULL,
  data_fim DATE DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## ✅ Checklist Completo

Ver detalhes no arquivo original.

**Status:** AGUARDANDO TESTES DE MERCADO PAGO
