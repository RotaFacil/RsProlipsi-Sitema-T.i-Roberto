PRD — Sistema SIGME + RS Shop (Dropshipping vinculado)

1. Visão Geral
- SIGME: motor de matriz global (3×2) com derramamento, compressão dinâmica e reentrada.
- Conexão com Plano de Carreira (PINs), Ranking Top SIGME e Bônus DROP.
- RS Shop: loja dos consultores integrada; vendas alimentam unidades e relatórios.

2. Entidades Principais
- User, Ativação, Cycle (SIGME), DropSale, PinCareer, TopSigmeRank, Pack.

3. Regras de Negócio (resumo)
- Ativação mínima R$ 60/mês; retroatividade limitada conforme manual.
- Matriz 3×2 com B=180: Self/L1/L2/L3 conforme regras do SIGME.
- Plano de Carreira (SIGME) e Plano de Marte (trimestral) como módulos distintos.
- Ranking Top SIGME: pool 9%, distribuição top 10, desempate configurável.
- DROP: 25%–38% por faixas, unidade por venda; alimenta matriz e PINs quando habilitado.

4. Integração com RS Shop
- Loja básica para consultor ativo; catálogo oficial e estoque central.
- Venda → lucro DROP, unidades para matriz/carreira, atualização de relatórios.
- Checkout com R.S.PAY; split para consultor e taxas RSPI.

5. Telas (wireframe textual)
- Consultor: Dashboard, Loja, Matriz, Carreira (SIGME/Marte), Top SIGME, Relatórios.
- Administrador: Configurações, Rede Global, Controle de PINs, Ranking, Estoque Drop, Auditoria.

6. APIs e Eventos
- Rotas principais: /activation, /cycle (SIGME), /dropsale, /pins, /ranking, /pack.
- Webhooks: payment.confirmed, sale.confirmed, cycle.closed, ranking.closed.

7. Relatórios
- Consultor: vendas, lucro, ciclos, PINs, ranking.
- Admin: receita, comissões, Top SIGME, estoque Drop.
- Auditoria: logs de eventos (MatrixBlock, Cycle, CareerProgress, TopSigmePeriod, DropSale).

8. Roadmap
- Fase 1 (0–3m): ativação, matriz básica, vendas Drop integradas.
- Fase 2 (3–6m): Carreira (SIGME/Marte), Ranking Top SIGME, Packs.
- Fase 3 (6–12m): Publicidade interna, destaques RS Shop, dashboards.
- Fase 4 (12–18m): Integrações externas, gamificação, app mobile.

