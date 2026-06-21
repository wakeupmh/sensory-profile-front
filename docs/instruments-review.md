# Revisão dos instrumentos — alinhamento de normas

Este documento registra a revisão feita nos instrumentos disponíveis no app e as decisões tomadas para alinhar conteúdo, classificações e nomes.

## Eixos avaliados

1. **Origem do conteúdo** — os itens são originais ou derivados de instrumento proprietário?
2. **Validade clínica** — as faixas de classificação têm base normativa publicada?
3. **Nomes e rótulos** — usam terminologia neutra e descritiva?

## Decisões aplicadas

### `crianca-3-14` — Triagem Sensorial — Criança (3 a 14 anos)

| Item                          | Antes                                                      | Agora                                                             |
| ----------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------- |
| Itens (84)                    | Herdados; estrutura próxima de instrumento proprietário em PT-BR | Reescritos do zero, em PT-BR, com base no framework público dos 4 quadrantes de Dunn (Busca/Evitação/Sensibilidade/Registro). IDs e seções preservados para compatibilidade com dados já gravados |
| Faixas de classificação       | 5 níveis com pontos de corte absolutos por seção (parecem derivar de tabela normativa proprietária) | 3 faixas proporcionais por % do score máximo: Típico (≤40%) / Atípico leve (≤70%) / Atípico marcado |
| Nome do instrumento           | "Perfil Sensorial — Criança…"                              | "Triagem Sensorial — Criança…"                                    |
| Curva normal no relatório     | Renderizada                                                | Oculta (`hasNormalCurve: false`); o sumário em tabela permanece   |
| Disclaimer                    | Ausente                                                    | Presente no topo do relatório                                     |

### `crianca-pequena` — Triagem Sensorial — Criança Pequena (7 a 36 meses)

| Item                          | Status                                                                                         |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| Itens (48)                    | Originais desde a criação — comportamentos genéricos de toddler organizados pelos 4 quadrantes |
| Faixas de classificação       | Proporcionais (Típico / Atípico leve / Atípico marcado) — já era assim                         |
| Nome do instrumento           | Renomeado para "Triagem Sensorial — Criança Pequena (7 a 36 meses)" para padronizar           |
| Curva normal                  | Oculta (`hasNormalCurve: false`)                                                               |
| Disclaimer                    | Presente                                                                                       |

### Rótulos de quadrante no relatório

| Antes                             | Agora                       |
| --------------------------------- | --------------------------- |
| Exploração / Criança exploradora  | Busca Sensorial (EX)        |
| Esquiva / Criança que se esquiva  | Evitação Sensorial (EV)     |
| Sensibilidade / Criança sensível  | Sensibilidade Sensorial (SN) |
| Observação / Criança observadora  | Registro Sensorial (OB)     |

Os rótulos agora seguem a terminologia acadêmica de Dunn (publicação científica), não a tradução comercial em PT-BR.

## Pontos em aberto (decisão de produto)

- **Nome do app**: o título no menu ainda é "Perfil Sensorial". Como é o termo genérico em PT-BR para o construto, mas também coincide com o nome comercial de instrumentos da Pearson, vale uma decisão consciente: manter, renomear para algo como "Triagem Sensorial", ou consultar advogado de propriedade intelectual. Nenhuma alteração de código foi feita nesse ponto.
- **Calibração clínica**: as faixas proporcionais são apenas uma heurística inicial (40% / 70%). Não há base amostral. Para uso clínico (não apenas apoio à observação), seria necessário um estudo de calibração com população real.
- **Anatomia das seções**: mantive a estrutura existente (9 seções na Criança 3–14, 6 na Criança Pequena). Profissional clínico pode querer revisar a distribuição de quadrantes por seção (algumas seções estão lopsided entre EV/SN e quase sem EX/OB).

## Compatibilidade com dados existentes

- IDs dos itens da Criança 3–14 foram preservados (1–14 com 15 vazio; 16–85). Avaliações já salvas continuam mapeando para as mesmas seções.
- O texto dos itens muda, então relatórios de avaliações antigas vão mostrar os novos enunciados ao lado das respostas salvas. Se isso for problema, o backend pode opcionalmente snapshot do texto do item no momento da resposta (sugestão para outra iteração).
- Backend não é afetado pelas mudanças (mesmas chaves de seção, mesmos IDs, mesmo `instrumentId`).
