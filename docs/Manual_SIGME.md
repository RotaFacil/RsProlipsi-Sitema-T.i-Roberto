# Manual de Regras – Sistema SIGME

Este manual apresenta de forma detalhada as regras de funcionamento do Sistema SIGME. Ele deve ser usado como documento oficial para operação, comunicação e implementação dos bônus (Matriz 3×2, Plano de Carreira, Top SIGME e DROP). Todos os parâmetros listados em “Parâmetros Configuráveis” podem ser administrados no painel administrativo.

## 1. Visão Geral
O Sistema SIGME opera através de uma matriz universal com derramamento e compressão dinâmica. Cada ativação válida gera uma posição na matriz global (fila única), garantindo distribuição justa e contínua.

## 2. Termos e Definições
- Ativação: Consumo mensal de no mínimo R$ 60,00. Sem ativação, o consultor não participa dos bônus no mês.
- Ciclo: Conclusão de uma matriz 3×2 (3 no 1º nível + 6 no 2º nível).
- Fila/Matriz Universal: Fila única global onde cada ativação ocupa a próxima vaga disponível.
- Derramamento: Preenchimento automático de vagas livres provenientes de toda a empresa.
- Compressão Dinâmica: Reorganização automática da matriz ao ciclar um topo.
- Reentrada (Reciclagem): Após ciclar, o consultor reentra automaticamente no final da fila.
- L1 / L2 / L3: Gerações de rede de patrocínio (diretos, indiretos de 2º nível e de 3º nível).

## 3. Elegibilidade
- O consultor deve estar ativo no mês com consumo mínimo de R$ 60,00.
- Sem ativação, o consultor não recebe bônus da sua matriz pessoal (sem retroatividade na matriz pessoal).
- A ativação garante participação imediata nas matrizes e nos bônus de rede (L1, L2, L3), observando a regra de retroatividade mensal.

## 4. Mecânica Operacional
- Cada ativação válida gera uma entrada na fila global.
- A matriz fecha com 3 ativações no 1º nível e 6 no 2º nível (formato 3×2).
- Quando o consultor cicla, o bônus é pago imediatamente e ele reentra no final da fila.
- O sistema aplica derramamento e compressão dinâmica para manter a matriz sempre preenchida e justa.

## 5. Distribuição Financeira do Ciclo
Base de cálculo: B = R$ 180,00 (configurável). Percentuais padrão:

| Componente           | % sobre B | Valor (R$) |
|----------------------|-----------|------------|
| Bônus de Ciclo (Self)| 60%       | 108,00     |
| Bônus de Rede L1     | 10%       | 18,00      |
| Bônus de Rede L2     | 5%        | 9,00       |
| Bônus de Rede L3     | 5%        | 9,00       |

Observações:
- O pagamento ocorre no evento de ciclo (fechamento do 3×2).
- A aplicação de retroatividade respeita as regras da seção 7.

## 6. Exemplos Práticos
Exemplo 1 – Entrada simultânea de 10 ativações:
- O topo com 6 vagas abertas completa imediatamente.
- O bônus de ciclo é pago ao topo; L1, L2 e L3 recebem seus percentuais.
- O topo reentra no final da fila e as ativações restantes seguem preenchendo as próximas vagas.

Exemplo 2 – Meu direto ciclou:
- Eu recebo 10% de B (R$ 18,00).
- Se for indireto de 2º nível, recebo 5% (R$ 9,00).
- Se for indireto de 3º nível, também recebo 5% (R$ 9,00).

## 7. Retroatividade e Fechamento
- Matriz pessoal: Não há retroatividade. Se o consultor não estava ativo no momento do ciclo, perde o bônus.
- Rede (L1, L2, L3): Retroatividade apenas dentro do mês. Se ativar antes do fechamento mensal, recebe os bônus gerados por sua rede. Se não ativar até o fechamento, perde definitivamente.
- Fechamento mensal: Último dia do mês às 23:59 no fuso de Brasília (UTC−03), salvo configuração administrativa.

## 8. Restrições e Ética
- É proibida a criação de múltiplas contas para manipular a fila.
- Fraudes e automações maliciosas resultam em bloqueio e perda de bônus.
- Todas as regras são auditáveis pela administração.

## 9. Parâmetros Configuráveis
- Valor mínimo de ativação (padrão: R$ 60,00)
- Base de ciclo (padrão: R$ 180,00)
- Percentuais: 60/10/5/5 (ajustáveis pela administração)
- Reentrada: automática, sem retroatividade na matriz pessoal
- Janela e fuso de fechamento mensal
- Políticas de auditoria, fraude e desempate

---

# Manual de Regras – Plano de Carreira SIGME

## 1. Visão Geral
O Plano de Carreira SIGME é o programa que premia consultores conforme a produção de ciclos em sua rede até o 3º nível. Cada ciclo representa um movimento válido de ativação (R$ 60,00) ou venda pelo sistema DROP (quando aplicável e parametrizado).

## 2. Condições de Qualificação
- O consultor deve estar ativo (R$ 60,00/mês) para ter direito aos PINs.
- Ciclos são contados de:
  - Matriz pessoal (L0)
  - Primeira geração (L1)
  - Segunda geração (L2)
  - Terceira geração (L3)
- Se o consultor não estiver ativo → não recebe, mesmo que sua rede tenha produzido.
- Se ativar-se antes do fechamento mensal → recebe todos os PINs atingidos naquele mês.
- Sem retroatividade após o fechamento.

## 3. Estrutura de PINs (padrão)
| PIN             | Ciclos | Bônus (R$) | Total Produtos | Total Venda (R$) | Total Líquido (R$) |
|-----------------|--------|------------|----------------|------------------|--------------------|
| Bronze          | 5      | 45,00      | 45             | 2.700,00         | 2.745,00           |
| Prata           | 10     | 90,00      | 90             | 5.400,00         | 5.490,00           |
| Ouro            | 20     | 180,00     | 180            | 43.200,00        | 43.380,00          |
| Rubi            | 35     | 315,00     | 315            | 18.900,00        | 19.215,00          |
| Safira          | 84     | 756,00     | 756            | 45.360,00        | 46.116,00          |
| Esmeralda       | 210    | 1.890,00   | 1.890          | 113.400,00       | 115.290,00         |
| Diamante        | 490    | 4.410,00   | 4.410          | 264.600,00       | 269.010,00         |
| Duplo Diamante  | 1.050  | 9.450,00   | 9.450          | 567.000,00       | 576.450,00         |
| Triplo Diamante | 2.100  | 18.900,00  | 18.900         | 1.134.000,00     | 1.152.900,00       |
| Diamante Red    | 5.250  | 47.250,00  | 47.250         | 2.835.000,00     | 2.882.250,00       |
| Diamante Blue   | 10.500 | 94.500,00  | 94.500         | 5.670.000,00     | 5.764.500,00       |
| Diamante Black  | 21.000 | 189.000,00 | 189.000        | 11.340.000,00    | 11.529.000,00      |

Observações:
- O pagamento dos PINs é feito mensalmente ao final do ciclo (fechamento do mês).
- Os resultados podem ser exibidos também em formato trimestral, para mostrar evolução acumulada.
- Se o consultor atingir mais de um PIN no mesmo mês, recebe o valor acumulado de todos os PINs atingidos.

## 4. Retroatividade
- Retroatividade válida apenas até o fechamento mensal.
- Ativação após o fechamento não dá direito aos PINs produzidos pela rede no mês anterior.

## 5. Observações
- PINs são auditáveis pela administração.
- O plano é integrado ao sistema DROP; cada unidade vendida pode gerar pontos/unidades que acumulam para atingir PINs (parametrizável).
- O consultor deve manter-se ativo para continuar acumulando progressão de PINs.

---

# Manual de Regras — Top SIGME (Ranking Global por Ciclos)

## 1. Objetivo
Reconhecer e premiar, mensalmente, os consultores com maior contribuição em ciclos (próprios e de sua equipe L1–L3), reforçando atividade, duplicação e consistência.

## 2. Definições
- Ciclo (SIGME): Fechamento de um bloco 3×2 que gera distribuição de bônus. Conta para o consultor que ciclou (L0) e também para seu L1, L2 e L3 no Plano de Carreira/Ranking.
- Período de Apuração: Mês calendário, do dia 1 ao último dia do mês, horário de Brasília (UTC−03), salvo configuração.
- Atividade Mensal: Ativação de R$ 60 no mês de apuração. Sem atividade, não há direito ao prêmio.
- Pool Top SIGME: Percentual reservado do faturamento de matriz no mês: 9% do total distribuível de matriz (padrão).

## 3. Elegibilidade
- Estar ATIVO no mês (R$ 60).
- Ter pelo menos 1 ciclo próprio (recomendado, mas não obrigatório).
- Estar em conformidade com políticas de ética e antifraude.
- Não estar sob investigação de manipulação de rede ou vendas simuladas.

## 4. Critério de Classificação
A posição no ranking considera a quantidade de ciclos produzidos no período, pela soma ponderada:

```
CiclosRank = Ciclos(L0) + Ciclos(L1) + Ciclos(L2) + Ciclos(L3)
```

Desempate:
1) Maior Ciclos(L0)
2) Maior data/hora do último ciclo do mês
3) Menor tempo total entre o primeiro e o último ciclo do mês
4) Sorteio auditável

## 5. Distribuição do Pool (9% — padrão)
| Posição | % do Pool | Observação     |
|---------|-----------|----------------|
| 1º      | 2,0%      | Líder do mês   |
| 2º      | 1,5%      |                |
| 3º      | 1,2%      |                |
| 4º      | 1,0%      |                |
| 5º      | 0,8%      |                |
| 6º      | 0,7%      |                |
| 7º      | 0,6%      |                |
| 8º      | 0,5%      |                |
| 9º      | 0,4%      |                |
| 10º     | 0,3%      |                |

Exemplo: Pool = R$ 500.000 → 1º lugar recebe R$ 10.000 (2,0%).

## 6. Fechamento e Pagamento
- Fechamento: último dia do mês às 23:59 (horário de Brasília), parametrizável.
- Pagamento: creditado até D+2 úteis com o lançamento “TOP_SIGME”.
- É obrigatório estar ATIVO no mês do fechamento para receber. Sem atividade, o valor é redistribuído proporcionalmente entre as posições subsequentes.

## 7. Rounding e Auditoria
- Valores são arredondados para duas casas decimais (meio para cima).
- Cálculos idempotentes e auditáveis via logs de evento: MatrixBlock, Cycle, CareerProgress, TopSigmePeriod, TopSigmeRank.

## 8. Compliance e Penalidades
- Proibido inflar ciclos com contas falsas, auto-compras em massa sem consumo real ou cadastros fictícios.
- Indícios de fraude suspendem pagamento até conclusão da auditoria.
- Comprovada a fraude, o consultor é desclassificado do mês; pode perder bonificações e sofrer bloqueio de conta.

## 9. Parâmetros Configuráveis (Admin)
- Percentual do Pool (padrão 9%).
- Distribuição por posição (padrão 2;1,5;1,2;1;0,8;0,7;0,6;0,5;0,4;0,3).
- Janela de fechamento do mês e fuso horário.
- Regras de desempate adicionais e limites de qualificação.

## 10. Exemplos Rápidos
- Ex.1: Consultor A somou 320 ciclos (L0=40, L1=120, L2=100, L3=60) e ficou em 1º. Pool=R$ 300.000 → prêmio R$ 6.000.
- Ex.2: Empate em 2º lugar com 200 ciclos. A tem L0=30 e B tem L0=25 → A fica em 2º, B em 3º.

---

# Manual de Regras – Bônus DROP (Dropshipping)

## 1. Conceito
O Bônus DROP é a bonificação paga ao consultor pelas vendas diretas de produtos via sistema de dropshipping. Este bônus garante margem de lucro imediata ao consultor e gera unidades que também alimentam a Matriz SIGME e o Plano de Carreira, conforme parametrização.

## 2. Elegibilidade
- Qualquer consultor ativo (R$ 60,00/mês) pode vender pelo sistema DROP.
- Cada venda gera unidade de produto + percentual de lucro conforme a tabela de faixas.
- O consultor não ativo perde o direito de receber os lucros de venda no sistema.

## 3. Estrutura de Percentuais (padrão)
| Faixa de Vendas Mensais (Unidades) | Percentual de Lucro |
|------------------------------------|---------------------|
| 0 a 100                            | 25%                 |
| 101 a 1.000                        | 27%                 |
| 1.001 a 5.000                      | 32%                 |
| 5.001 a 10.000                     | 35%                 |
| Acima de 10.000                    | 38%                 |

## 4. Cálculo do Lucro (exemplos)
- Ex.1: 80 unidades de R$ 60,00 → 80 × 60 × 25% = R$ 1.200,00 de lucro.
- Ex.2: 3.000 unidades → 3.000 × 60 × 32% = R$ 57.600,00 de lucro.

## 5. Acúmulo em Unidades
- Cada unidade vendida = 1 ponto/unidade no sistema.
- Essas unidades alimentam automaticamente:
  - Plano de Carreira (contagem para PINs)
  - Matriz SIGME (ativações e derramamento global), se habilitado

## 6. Pagamento
- O bônus de vendas DROP é pago mensalmente e consolidado no extrato do consultor.
- O consultor acompanha no Painel → Relatórios de Vendas suas vendas e a faixa percentual atingida.

## 7. Observações
- Não há retroatividade: se o consultor não estava ativo no mês, mesmo com vendas, não recebe.
- As margens percentuais são fixadas pela administração, podendo ser reajustadas com aviso prévio de 30 dias.
- O DROP integra o mesmo estoque da empresa (ex.: Shopify/CD), garantindo rastreabilidade de pedidos e entregas.

---

Este manual é a referência oficial para consultores e desenvolvedores. Parâmetros são editáveis no painel administrativo e todas as alterações são auditadas.

