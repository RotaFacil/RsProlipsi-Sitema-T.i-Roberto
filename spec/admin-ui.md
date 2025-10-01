# Painel Administrativo – SIGME (Regras Editáveis)

Objetivo: Permitir edição segura dos parâmetros do sistema, com auditoria, versionamento e pré-visualização de impacto.

## Seções Principais

- Regras da Matriz
  - Valor mínimo de ativação
  - Base do ciclo (B)
  - Percentuais de payout (SELF/L1/L2/L3)
  - Derramamento (on/off), Compressão (modo)
  - Reentrada (automática)

- Plano de Carreira (PINs)
  - Tabela de PINs (nome, ciclos, bônus)
  - Política de retroatividade mensal

- TOP SIGME
  - Percentual do pool
  - Distribuição por posição (top 10)
  - Critérios de desempate
  - Janela de fechamento, fuso

- DROP
  - Faixas de unidades e percentuais de lucro
  - Integração de unidades com Carreira e Matriz
  - Política de retroatividade

- Sistema
  - Fuso horário padrão
  - Janela de fechamento mensal
  - Dias de aviso para mudança de regras
  - Auditoria (on/off)

## Fluxo de Edição

1) Administrador altera valores em formulários com validação (ex.: soma de percentuais, limites de faixas, datas).
2) Preview de impacto (simulação com dados do mês corrente quando aplicável).
3) Salvar proposta → cria nova versão de configuração (rascunho).
4) Publicar versão → aplica imediatamente ou agenda para o próximo ciclo (conforme política), gerando aviso de 30 dias quando exigido.
5) Auditoria: toda mudança gera registro com `admin_id`, `diff`, `data/hora`, `comentário` e `ticket` opcional.

## Validações Obrigatórias

- `matrix.payouts.self + l1 + l2 + l3 <= 1.0`.
- `top_sigme.distribution` soma igual a `top_sigme.pool_percent`.
- Faixas `drop.tiers` não sobrepostas e cobrindo do zero ao infinito.
- PINs com `cycles` e `bonus` positivos e ordenados por `cycles`.
- `close_window` coerente com timezone.

## Controles de Acesso

- Perfis: `viewer`, `editor`, `publisher`, `auditor`.
- Somente `publisher` pode publicar versões; todos os actions auditados.

## Logs e Versionamento

- Tabela de versões de config com hash e carimbo de tempo.
- Rollback para versão anterior com auditoria.

## Integrações

- Webhooks para notificar microserviços de regras quando uma configuração é publicada.
- Flag de “modo de manutenção” para congelar publicações durante fechamento mensal.

