-- Users & Sponsorship
CREATE TABLE IF NOT EXISTS users (
  id                BIGINT PRIMARY KEY,
  sponsor_id        BIGINT NULL REFERENCES users(id),
  created_at        TIMESTAMP NOT NULL DEFAULT now(),
  active_until      DATE NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'active'
);

-- Activations
CREATE TABLE IF NOT EXISTS activations (
  id                BIGSERIAL PRIMARY KEY,
  user_id           BIGINT NOT NULL REFERENCES users(id),
  period_month      DATE NOT NULL,
  amount            NUMERIC(12,2) NOT NULL,
  valid             BOOLEAN NOT NULL,
  created_at        TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (user_id, period_month)
);

-- Matrix queue (placeholder, not used yet)
CREATE TABLE IF NOT EXISTS matrix_queue (
  id                BIGSERIAL PRIMARY KEY,
  activation_id     BIGINT NOT NULL REFERENCES activations(id),
  user_id           BIGINT NOT NULL REFERENCES users(id),
  enqueued_at       TIMESTAMP NOT NULL DEFAULT now(),
  status            VARCHAR(20) NOT NULL DEFAULT 'waiting'
);

-- Matrix blocks
CREATE TABLE IF NOT EXISTS matrix_blocks (
  id                BIGSERIAL PRIMARY KEY,
  top_user_id       BIGINT NOT NULL REFERENCES users(id),
  opened_at         TIMESTAMP NOT NULL DEFAULT now(),
  closed_at         TIMESTAMP NULL,
  state             VARCHAR(20) NOT NULL DEFAULT 'open'
);

-- Matrix positions
CREATE TABLE IF NOT EXISTS matrix_positions (
  id                BIGSERIAL PRIMARY KEY,
  block_id          BIGINT NOT NULL REFERENCES matrix_blocks(id),
  user_id           BIGINT NOT NULL REFERENCES users(id),
  level             SMALLINT NOT NULL,
  slot_index        SMALLINT NOT NULL,
  filled_at         TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (block_id, level, slot_index)
);

-- Cycles (matrix)
CREATE TABLE IF NOT EXISTS cycles (
  id                BIGSERIAL PRIMARY KEY,
  block_id          BIGINT NOT NULL REFERENCES matrix_blocks(id),
  top_user_id       BIGINT NOT NULL REFERENCES users(id),
  period_month      DATE NOT NULL,
  base_amount       NUMERIC(12,2) NOT NULL,
  created_at        TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (block_id)
);

-- Payouts extract
CREATE TABLE IF NOT EXISTS payouts (
  id                BIGSERIAL PRIMARY KEY,
  user_id           BIGINT NOT NULL REFERENCES users(id),
  type              VARCHAR(30) NOT NULL,
  amount            NUMERIC(12,2) NOT NULL,
  label             VARCHAR(50) NULL,
  source_cycle_id   BIGINT NULL REFERENCES cycles(id),
  source_event_id   VARCHAR(64) NULL,
  period_month      DATE NOT NULL,
  created_at        TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payouts_user_month ON payouts(user_id, period_month);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payouts_unique_event ON payouts(source_event_id, type);

-- Career progress (SIGME classic)
CREATE TABLE IF NOT EXISTS career_progress (
  id                BIGSERIAL PRIMARY KEY,
  user_id           BIGINT NOT NULL REFERENCES users(id),
  period_month      DATE NOT NULL,
  cycles_l0         INTEGER NOT NULL DEFAULT 0,
  cycles_l1         INTEGER NOT NULL DEFAULT 0,
  cycles_l2         INTEGER NOT NULL DEFAULT 0,
  cycles_l3         INTEGER NOT NULL DEFAULT 0,
  pin_achieved      VARCHAR(50) NULL,
  pin_bonus_amount  NUMERIC(12,2) NULL,
  updated_at        TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (user_id, period_month)
);

-- TOP SIGME
CREATE TABLE IF NOT EXISTS top_sigme_period (
  id                BIGSERIAL PRIMARY KEY,
  period_month      DATE NOT NULL UNIQUE,
  pool_total        NUMERIC(14,2) NOT NULL,
  distribution_json JSON NOT NULL,
  created_at        TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS top_sigme_rank (
  id                BIGSERIAL PRIMARY KEY,
  period_id         BIGINT NOT NULL REFERENCES top_sigme_period(id),
  user_id           BIGINT NOT NULL REFERENCES users(id),
  cycles_l0         INTEGER NOT NULL,
  cycles_l1         INTEGER NOT NULL,
  cycles_l2         INTEGER NOT NULL,
  cycles_l3         INTEGER NOT NULL,
  rank_position     INTEGER NOT NULL,
  payout_amount     NUMERIC(12,2) NOT NULL,
  created_at        TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (period_id, rank_position),
  UNIQUE (period_id, user_id)
);

-- DROP
CREATE TABLE IF NOT EXISTS drop_sales (
  id                BIGSERIAL PRIMARY KEY,
  user_id           BIGINT NOT NULL REFERENCES users(id),
  period_month      DATE NOT NULL,
  units             INTEGER NOT NULL,
  unit_price        NUMERIC(12,2) NOT NULL,
  tier_percent      NUMERIC(6,4) NOT NULL,
  payout_amount     NUMERIC(12,2) NOT NULL,
  created_at        TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_drop_sales_user_month ON drop_sales(user_id, period_month);

-- Event logs
CREATE TABLE IF NOT EXISTS event_logs (
  id                BIGSERIAL PRIMARY KEY,
  event_id          VARCHAR(64) NOT NULL UNIQUE,
  event_type        VARCHAR(50) NOT NULL,
  payload_json      JSON NOT NULL,
  payload_hash      VARCHAR(64) NOT NULL,
  processed_at      TIMESTAMP NOT NULL DEFAULT now(),
  producer          VARCHAR(50) NULL
);

-- MARTE (quarterly career)
CREATE TABLE IF NOT EXISTS marte_network_cycles (
  id                BIGSERIAL PRIMARY KEY,
  event_id          VARCHAR(64) NOT NULL UNIQUE,
  origin_user_id    BIGINT NOT NULL REFERENCES users(id),
  occurred_at       TIMESTAMP NOT NULL,
  base_amount       NUMERIC(12,2) NOT NULL,
  created_at        TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marte_month_progress (
  id                BIGSERIAL PRIMARY KEY,
  user_id           BIGINT NOT NULL REFERENCES users(id),
  period_month      DATE NOT NULL,
  cycles_l1         INTEGER NOT NULL DEFAULT 0,
  cycles_l2         INTEGER NOT NULL DEFAULT 0,
  cycles_l3         INTEGER NOT NULL DEFAULT 0,
  per_cycle_reward  NUMERIC(12,2) NOT NULL DEFAULT 2.70,
  updated_at        TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (user_id, period_month)
);

CREATE TABLE IF NOT EXISTS marte_quarter_progress (
  id                BIGSERIAL PRIMARY KEY,
  user_id           BIGINT NOT NULL REFERENCES users(id),
  period_quarter    VARCHAR(7) NOT NULL,
  cycles_total      INTEGER NOT NULL DEFAULT 0,
  pin_name          VARCHAR(50) NULL,
  updated_at        TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (user_id, period_quarter)
);

