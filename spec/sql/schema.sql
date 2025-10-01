-- SIGME – Esquema SQL mínimo para implementação

-- Usuários e Patrocínio
CREATE TABLE users (
  id                BIGINT PRIMARY KEY,
  sponsor_id        BIGINT NULL REFERENCES users(id),
  created_at        TIMESTAMP NOT NULL,
  active_until      DATE NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'active'
);

-- Ativações mensais
CREATE TABLE activations (
  id                BIGINT PRIMARY KEY,
  user_id           BIGINT NOT NULL REFERENCES users(id),
  period_month      DATE NOT NULL, -- usar 1º dia do mês como chave
  amount            NUMERIC(12,2) NOT NULL,
  valid             BOOLEAN NOT NULL,
  created_at        TIMESTAMP NOT NULL,
  UNIQUE (user_id, period_month)
);

-- Fila global de posicionamento (FIFO)
CREATE TABLE matrix_queue (
  id                BIGINT PRIMARY KEY,
  activation_id     BIGINT NOT NULL REFERENCES activations(id),
  user_id           BIGINT NOT NULL REFERENCES users(id),
  enqueued_at       TIMESTAMP NOT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'waiting' -- waiting|consumed|cancelled
);

-- Blocos de matriz 3×2
CREATE TABLE matrix_blocks (
  id                BIGINT PRIMARY KEY,
  top_user_id       BIGINT NOT NULL REFERENCES users(id),
  opened_at         TIMESTAMP NOT NULL,
  closed_at         TIMESTAMP NULL,
  state             VARCHAR(20) NOT NULL DEFAULT 'open' -- open|closed
);

-- Posições dentro do bloco (nível 1 e 2)
CREATE TABLE matrix_positions (
  id                BIGINT PRIMARY KEY,
  block_id          BIGINT NOT NULL REFERENCES matrix_blocks(id),
  user_id           BIGINT NOT NULL REFERENCES users(id),
  level             SMALLINT NOT NULL, -- 1 ou 2
  slot_index        SMALLINT NOT NULL, -- 0..2 para nível 1; 0..5 para nível 2
  filled_at         TIMESTAMP NOT NULL,
  UNIQUE (block_id, level, slot_index)
);

-- Ciclos (fechamento do bloco do topo)
CREATE TABLE cycles (
  id                BIGINT PRIMARY KEY,
  block_id          BIGINT NOT NULL REFERENCES matrix_blocks(id),
  top_user_id       BIGINT NOT NULL REFERENCES users(id),
  period_month      DATE NOT NULL,
  base_amount       NUMERIC(12,2) NOT NULL,
  created_at        TIMESTAMP NOT NULL,
  UNIQUE (block_id)
);

CREATE TABLE payouts (
  id                BIGINT PRIMARY KEY,
  user_id           BIGINT NOT NULL REFERENCES users(id),
  type              VARCHAR(30) NOT NULL, -- MATRIX_SELF|L1|L2|L3|TOP_SIGME|DROP|MARTE_L1|MARTE_L2|MARTE_L3|MARTE_PER_CYCLE
  amount            NUMERIC(12,2) NOT NULL,
  label             VARCHAR(50) NULL, -- ex.: TOP_SIGME
  source_cycle_id   BIGINT NULL REFERENCES cycles(id),
  source_event_id   VARCHAR(64) NULL, -- idempotência
  period_month      DATE NOT NULL,
  created_at        TIMESTAMP NOT NULL
);

-- Progresso de carreira (agregado mensal)
CREATE TABLE career_progress (
  id                BIGINT PRIMARY KEY,
  user_id           BIGINT NOT NULL REFERENCES users(id),
  period_month      DATE NOT NULL,
  cycles_l0         INTEGER NOT NULL DEFAULT 0,
  cycles_l1         INTEGER NOT NULL DEFAULT 0,
  cycles_l2         INTEGER NOT NULL DEFAULT 0,
  cycles_l3         INTEGER NOT NULL DEFAULT 0,
  pin_achieved      VARCHAR(50) NULL,
  pin_bonus_amount  NUMERIC(12,2) NULL,
  updated_at        TIMESTAMP NOT NULL,
  UNIQUE (user_id, period_month)
);

-- TOP SIGME período e ranking
CREATE TABLE top_sigme_period (
  id                BIGINT PRIMARY KEY,
  period_month      DATE NOT NULL UNIQUE,
  pool_total        NUMERIC(14,2) NOT NULL,
  distribution_json JSONB NOT NULL,
  created_at        TIMESTAMP NOT NULL
);

CREATE TABLE top_sigme_rank (
  id                BIGINT PRIMARY KEY,
  period_id         BIGINT NOT NULL REFERENCES top_sigme_period(id),
  user_id           BIGINT NOT NULL REFERENCES users(id),
  cycles_l0         INTEGER NOT NULL,
  cycles_l1         INTEGER NOT NULL,
  cycles_l2         INTEGER NOT NULL,
  cycles_l3         INTEGER NOT NULL,
  rank_position     INTEGER NOT NULL,
  payout_amount     NUMERIC(12,2) NOT NULL,
  created_at        TIMESTAMP NOT NULL,
  UNIQUE (period_id, rank_position),
  UNIQUE (period_id, user_id)
);

-- Vendas DROP e pagamentos
CREATE TABLE drop_sales (
  id                BIGINT PRIMARY KEY,
  user_id           BIGINT NOT NULL REFERENCES users(id),
  period_month      DATE NOT NULL,
  units             INTEGER NOT NULL,
  unit_price        NUMERIC(12,2) NOT NULL,
  tier_percent      NUMERIC(6,4) NOT NULL,
  payout_amount     NUMERIC(12,2) NOT NULL,
  created_at        TIMESTAMP NOT NULL
);

-- Auditoria de eventos
CREATE TABLE event_logs (
  id                BIGINT PRIMARY KEY,
  event_id          VARCHAR(64) NOT NULL UNIQUE,
  event_type        VARCHAR(50) NOT NULL,
  payload_json      JSONB NOT NULL,
  payload_hash      VARCHAR(64) NOT NULL,
  processed_at      TIMESTAMP NOT NULL,
  producer          VARCHAR(50) NULL
);

-- =============================
-- MARTE (Carreira Trimestral)
-- =============================

-- Eventos de ciclo da rede (L1/L2/L3) – origem em um consultor da árvore
CREATE TABLE marte_network_cycles (
  id                BIGINT PRIMARY KEY,
  event_id          VARCHAR(64) NOT NULL UNIQUE,
  origin_user_id    BIGINT NOT NULL REFERENCES users(id),
  occurred_at       TIMESTAMP NOT NULL,
  base_amount       NUMERIC(12,2) NOT NULL,
  created_at        TIMESTAMP NOT NULL
);

-- Agregados mensais (para pro-rata e extratos)
CREATE TABLE marte_month_progress (
  id                BIGINT PRIMARY KEY,
  user_id           BIGINT NOT NULL REFERENCES users(id),
  period_month      DATE NOT NULL,
  cycles_l1         INTEGER NOT NULL DEFAULT 0,
  cycles_l2         INTEGER NOT NULL DEFAULT 0,
  cycles_l3         INTEGER NOT NULL DEFAULT 0,
  per_cycle_reward  NUMERIC(12,2) NOT NULL DEFAULT 2.70,
  updated_at        TIMESTAMP NOT NULL,
  UNIQUE (user_id, period_month)
);

-- Agregados trimestrais (PIN final)
CREATE TABLE marte_quarter_progress (
  id                BIGINT PRIMARY KEY,
  user_id           BIGINT NOT NULL REFERENCES users(id),
  period_quarter    VARCHAR(7) NOT NULL, -- formato: YYYY-Qn
  cycles_total      INTEGER NOT NULL DEFAULT 0,
  pin_name          VARCHAR(50) NULL,
  updated_at        TIMESTAMP NOT NULL,
  UNIQUE (user_id, period_quarter)
);

