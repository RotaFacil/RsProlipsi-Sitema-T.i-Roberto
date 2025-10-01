CRD – Painel do Administrador (RSPrólipsi)

1. Visão Geral
- Central de gestão do ecossistema RSPrólipsi.
- Controle de consultores, SIGME (matriz), Plano de Carreira (Marte), RS SHOP, DROP, APIs, comunicação, relatórios, segurança.
- Define permissões de acesso e parâmetros globais.

2. Módulos do Painel
2.1 Consultores
- Listagem com filtros (ativos, inativos, PIN, ciclos, rede).
- Dados cadastrais e de negócio (diretos, L1–L3, ciclos, PIN atual, histórico de ativação).
- Financeiro (extrato, bônus, saques).
- Edição total pelo admin; permissões por campo para o consultor (view/edit/read-only).

2.2 Configurações Gerais
- Valor de ativação, percentuais de bônus, regras de pool, timezone, idiomas e moedas.
- Templates de notificações e integrações (pagamentos, logística, APIs).

2.3 Sistema SIGME (Matrizes & Bônus)
- Fila única, derramamento, compressão, reentrada, retroatividade.
- Percentuais (Self/L1/L2/L3), Pool do Top SIGME e distribuição.
- Monitoramento em tempo real e relatórios antifraude.

2.4 Plano de Carreira (Marte)
- Tabela oficial de PINs, apuração trimestral, percentuais L1/L2/L3 e pagamento pro-rata por ciclo.
- Relatórios mensais e trimestrais; ajustes manuais auditáveis.

2.5 RS SHOP (E-commerce + CD)
- Produtos, estoque, pedidos, entregas, preços/promoções, lojas dos consultores, relatórios de vendas.

2.6 DROP (Dropshipping)
- Faixas de lucro, catálogo, relatórios de vendas/unidades, auditoria de integração com matriz e PINs.

2.7 APIs & Integrações
- API pública, webhooks (ativação, ciclo, venda, saque), chatbot, gateways e logística.

2.8 Comunicação & Automação
- Chatbot, mensagens automáticas (ativação, ciclo, PIN, pedidos), comunicados e agenda de disparos.

2.9 Relatórios & BI
- Consultores, financeiro, PINs, RS SHOP, exportação (CSV/PDF/Excel), dashboards e KPIs.

2.10 Segurança & Auditoria
- Logs de acesso, auditoria de alterações, antifraude (multi-conta, auto-compras, cadastros falsos), backups.

3. Fluxo Operacional
- Login com 2FA → escolha do módulo → operação (edição, configuração, relatório).
- Todas as alterações registradas em logs de auditoria.

4. Critérios de Aceite
- Tempo de carregamento: < 3 s por tela.
- Edição de consultores exige registro prévio em log de auditoria.
- Notificações em tempo real.
- Exportações CSV/PDF/Excel.
- Disponibilidade mínima: 99,5%.

5. Permissões e Auditoria
- Perfis: viewer, editor, publisher, auditor.
- Versionamento de regras com diffs e rollback auditado.

