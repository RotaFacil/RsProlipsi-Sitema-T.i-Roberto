# SIGME – Especificação do Motor de Regras (Rule Engine)

Este documento descreve a modelagem de eventos, cálculos, algoritmos e pontos de auditoria para implementar o Sistema SIGME com parâmetros editáveis via painel administrativo.

## 1) Entidades, Eventos e Logs

- Usuário (Consultor): `id`, `sponsor_id` (patrocinador L1), `ativo_no_mes` (bool), datas de ativação.
- Ativação: evento que valida participação no mês. Atributos: `id`, `user_id`, `periodo`, `valor`, `valida` (bool), `created_at`.
- Fila Universal (Queue): armazena ativações válidas, FIFO. Cada item gera uma posição ao ser consumido para preencher a matriz.
- Matriz/Bloco (3×2): estrutura em árvore (BFS) com um topo, 3 posições no 1º nível e 6 no 2º. Logs: `MatrixBlock`, `MatrixFill`, `Cycle`.
- Ciclo: evento que fecha o bloco 3×2 do topo e dispara pagamentos (Self, L1, L2, L3) e reentrada do topo no final da fila.
- Carreira (PINs): agregação mensal de ciclos L0–L3 por usuário. Logs: `CareerProgress`.
- TOP SIGME: agregação mensal de ciclos L0–L3 e ranqueamento. Logs: `TopSigmePeriod`, `TopSigmeRank`.
- DROP: vendas por faixa com acúmulo de unidades. Logs: `DropSale`, `DropPayout`.
- Pagamentos (Payout): lançamentos no extrato do consultor: `type` ∈ {MATRIX_SELF, L1, L2, L3, TOP_SIGME, DROP}.
- Auditoria: todos os cálculos devem gerar `event_id` idempotente e payloads persistidos para reprocessamento.

## 2) Fila Universal, Derramamento e Preenchimento da Matriz

Algoritmo (visão geral):
1. Ao validar uma ativação, enfileirar `queue.push({user_id, activation_id})`.
2. Enquanto existir bloco com vagas abertas, consumir itens da fila via BFS para preencher nível 1 e, depois, nível 2.
3. Derramamento: a origem da ativação é global; não prioriza patrocínio. A posição livre recebe o próximo item da fila (justiça global).
4. Ao completar 3 posições de nível 1 e 6 de nível 2 do topo do bloco, registrar `Cycle(top_user_id, base, ts)`.

Representação da estrutura:
- Cada `MatrixBlock` possui `top_user_id`, ponteiros para `n1[3]` e `n2[6]`, e estado `open_slots`.
- Implementação em BFS: lista de nós com metadados de nível e posição; preenchimento em ordem de visita.

## 3) Compressão Dinâmica e Reentrada

Quando o topo cicla:
1. Registrar pagamentos conforme seção 4 (payouts) e regras de retroatividade.
2. Reentrada automática: enfileirar `{user_id = topo, reason = "reentry", cycle_id}` no final da fila.
3. Compressão: remover o topo e promover filhos para cima (mantendo a forma 3×2). Estratégia segura:
   - Criar novo bloco cujo topo torna-se o próximo nó elegível (p.ex., primeiro do nível 1) e realocar seus descendentes num BFS estável.
   - Alternativamente, encerrar o bloco e iniciar um novo bloco a partir do próximo item da fila (mais simples), preservando justiça global.

Nota: A compressão pode ser implementada como “fechamento e novo bloco” para simplificar, desde que a justiça e a fila global sejam preservadas.

## 4) Pagamentos de Ciclo (Matriz)

Base: `B = config.matrix.cycle_base`.
Percentuais: `self`, `l1`, `l2`, `l3` de `config.matrix.payouts`.

Regras:
- `SELF`: Paga ao topo no evento de ciclo se `topo` está ativo no mês. Caso não esteja ativo, perde definitivamente (sem retroatividade na matriz pessoal).
- `L1/L2/L3`: Paga ao patrocinador de cada nível se ele estiver ativo até o fechamento do mês (retroatividade mensal). Caso ative antes do fechamento, recebe os valores acumulados do mês; caso contrário, perde.
- Arredondamento: `half_up` 2 casas decimais.

Idempotência:
- `Cycle` possui `cycle_id` único. Cada `Payout` referencia `cycle_id` + `type`. Reprocessamentos não duplicam lançamentos.

## 5) Plano de Carreira (PINs)

Contagem:
- `Ciclos(L0)` = ciclos do próprio usuário (topos que ciclaram com ele como topo) no período.
- `Ciclos(L1..L3)` = ciclos de sua rede até o 3º nível no período.
- Total de ciclos para PIN = soma L0+L1+L2+L3.

Qualificação e pagamento:
- Requer `ativo_no_mes = true`.
- Retroatividade apenas até o fechamento do mês.
- Se atingir múltiplos PINs no mês, paga a soma dos bônus dos PINs atingidos.

## 6) TOP SIGME (Ranking)

Apuração mensal:
- `CiclosRank = L0 + L1 + L2 + L3` por usuário no período.
- Ordenar por `CiclosRank` decrescente; empates por: (1) maior `L0`, (2) maior `last_cycle_ts`, (3) menor `cycle_window`, (4) sorteio auditável.

Pool e distribuição:
- `pool = total_distribuivel_matriz * config.top_sigme.pool_percent`.
- Distribuição por posição conforme `config.top_sigme.distribution` (soma = 0.09 por padrão). Gerar `Payout` com label `TOP_SIGME`.

Elegibilidade:
- Deve estar ativo no mês do fechamento; caso contrário, valor é redistribuído às posições subsequentes proporcionalmente.

## 7) DROP (Vendas)

Faixas:
- Determinadas por `config.drop.tiers` com percentuais progressivos.

Regras:
- Requer usuário ativo no mês; sem atividade, não recebe.
- Unidades vendidas alimentam contadores de Carreira e, se habilitado, a Matriz (pontos/unidades → conversão/ativação conforme política).

Pagamento:
- Consolidado mensalmente no extrato. Aplicar arredondamento `half_up` 2 casas.

## 8) Retroatividade e Fechamento

- Matriz pessoal (SELF): sem retroatividade.
- Rede (L1–L3) e Carreira: retroatividade apenas até fechamento mensal.
- TOP SIGME e DROP: requerem atividade no mês de apuração.
- Fechamento: último dia do mês 23:59 (fuso configurável). Pagamentos TOP em D+2 úteis (configurável).

## 9) API e Painel Admin (visão geral)

Endpoints (ver `api/openapi.yaml`):
- `GET /admin/rules` e `PUT /admin/rules` para ler/atualizar `config` (com auditoria e aviso de mudança).
- `POST /events/activation`, `POST /events/drop-sale` para entrada de eventos.
- `GET /reports/top-sigme`, `GET /reports/career`, `GET /reports/matrix` para relatórios.
- `GET /users/{id}/extract` para extrato de pagamentos.

## 10) Idempotência e Auditoria

- Todos os eventos devem carregar `event_id` único. Processamentos registram `processed_at`, `producer`, `payload_hash`.
- Payouts referenciam `source_event_id` e `cycle_id` quando aplicável.
- Reprocessamentos ignoram eventos já confirmados (idempotência forte com checagem de hash).

## 11) Exemplos de Cálculo (sanidade)

- Base `B=180`. SELF=60%→108; L1=10%→18; L2=5%→9; L3=5%→9. Somatório 80% de `B` (o restante é margem operacional/empresa conforme política interna).
- DROP: 3.000 unidades × 60 × 32% = 57.600,00.
- TOP SIGME: Pool=300.000×9%→27.000; 1º recebe 2%→6.000.

