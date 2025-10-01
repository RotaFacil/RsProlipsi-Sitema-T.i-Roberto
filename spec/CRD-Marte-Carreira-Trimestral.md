CRD – Plano de Marketing (Marte) – Carreira Trimestral

1. Visão Geral
- Natureza: apuração trimestral; pagamento mensal (pro-rata por ciclo).
- Vinculação: rede própria do consultor (L1, L2, L3) — não usa matriz global.
- Acompanhamento: progressão mensal; PIN final consolidado no fechamento do trimestre.

2. Regras de Qualificação
- Ativação mínima: R$ 60,00 mensais (necessária para receber no mês).
- Direto obrigatório: pelo menos 1 direto que tenha consumido R$ 60,00 ao menos uma vez (condição permanente após cumprida).
- Rede válida: somente ciclos da rede L1, L2 e L3 do consultor.
- Atividade mensal: se não estiver ativo em um mês, não recebe os bônus daquele mês (sem retroatividade).

3. Mecânica de Ciclos
- Cada ciclo é gerado pela rede L1–L3 (eventos de ciclo da rede).
- Pagamento é imediato: ao concluir um ciclo, credita o bônus correspondente no extrato (SLA: até 5 minutos).
- Acúmulo trimestral: todos os ciclos do trimestre contam para o PIN final (status/título). Não há pagamento extra no fechamento; pagamentos são pro-rata ao longo do trimestre.
- Notificações e painel em tempo real: cada ciclo gera atualização de progressão.

4. Regras de Distribuição (Rede L1–L3)
- Base do ciclo (configurável): B (padrão R$ 180,00).
- Percentuais: L1 5%, L2 3%, L3 2% (configuráveis).
- Pagamento automático a cada ciclo concluído da rede.
- Consolidação mensal exibida no extrato do consultor.

5. Estrutura de PINs (Plano de Marte)
- PIN representa acúmulo de ciclos no trimestre; o consultor recebe mensalmente conforme os ciclos ocorrem.
- No fechamento trimestral, define-se o PIN máximo atingido e exibe-se no relatório.
- Política de pagamento: pro-rata por ciclo com valor por ciclo padrão de R$ 2,70, de forma que o total recebido ao atingir um PIN seja compatível com a tabela oficial.

Tabela Oficial de PINs (trimestre)
- Bronze: 5 ciclos → R$ 13,50
- Prata: 15 ciclos → R$ 40,50
- Ouro: 70 ciclos → R$ 189,00
- Safira: 150 ciclos → R$ 405,00
- Esmeralda: 300 ciclos → R$ 810,00
- Topázio: 500 ciclos → R$ 1.350,00
- Rubi: 750 ciclos → R$ 2.025,00
- Diamante: 1.500 ciclos → R$ 4.050,00
- Diamante Duplo: 3.000 ciclos → R$ 18.450,00
- Diamante Triplo: 5.000 ciclos → R$ 36.450,00
- Diamante Red: 15.000 ciclos → R$ 105.300,00
- Diamante Blue: 25.000 ciclos → R$ 67.500,00
- Diamante Black: 50.000 ciclos → R$ 135.000,00
- Total de premiação acumulada de referência: R$ 260.064,04 (somatório informativo).

Observações:
- Atingir múltiplos patamares no trimestre apenas atualiza o “PIN máximo”; o pagamento já ocorreu progressivamente ao longo dos ciclos.
- Se desejar política alternativa (pagar valor incremental por patamar), parametrizar em config.

6. Fluxo Operacional
1) Consultor ativa-se (R$ 60,00) e cumpre o “direto obrigatório” (uma vez na vida).
2) Cada ciclo concluído pela rede L1–L3 gera bônus imediato (L1 5%, L2 3%, L3 2%).
3) Pagamentos mensais são acumulados automaticamente no extrato.
4) Ao final do trimestre: o sistema soma ciclos, determina PIN máximo e atualiza status no painel/relatórios (sem pagamentos adicionais por padrão).

7. Relatórios
- Consultor: ciclos L1/L2/L3, bônus por mês, progressão trimestral e PIN final.
- Administrador: consolidado de PINs por consultor, distribuição trimestral, auditoria de ativação e rede.

8. Critérios de Aceite
- Bônus por ciclo no extrato em até 5 minutos após o evento.
- Recebimento condicionado à atividade mensal do consultor.
- PIN trimestral fechado e exibido até D+2 do trimestre.

9. Parâmetros Configuráveis (Admin)
- `marte.enabled`: habilitar/desabilitar plano.
- `marte.cycle_base_brl`: base B do ciclo (padrão 180).
- `marte.network_payouts`: { l1: 0.05, l2: 0.03, l3: 0.02 }.
- `marte.per_cycle_reward_brl`: R$ 2,70 (pro-rata por ciclo).
- `marte.pins`: lista de patamares com {name, cycles_required, reward_total_brl}.
- `marte.required_one_direct_ever_active`: true.
- `marte.active_required_for_monthly_payouts`: true.
- Janelas de trimestre e timezone.

10. Eventos e SLA
- `marte.network_cycle`: evento de ciclo da rede com `event_id`, `origin_user_id`, `occurred_at`.
- Idempotência: eventos com `event_id` único; reprocessamentos não duplicam lançamentos.
- SLA: processamento e crédito em até 5 minutos.

