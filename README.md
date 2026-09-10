# danmo-hub

![Plataforma](https://img.shields.io/badge/plataforma-web_est%C3%A1tico-0B1F3A)
![Base de dados](https://img.shields.io/badge/base_de_dados-Supabase-3ECF8E)
![Publica%C3%A7%C3%A3o](https://img.shields.io/badge/publica%C3%A7%C3%A3o-Vercel-000000)
![Vers%C3%A3o](https://img.shields.io/badge/vers%C3%A3o-2.0-F59E0B)

Portal interno da **Danmo Service System, Lda** (Porto da Beira, Sofala) para gestão
de oficina, ferramentaria, stock, aquisições, RH, avaliação de desempenho, segurança
no trabalho e plano de férias. Um sítio só, com conta própria para cada pessoa e
permissões por nível.

## Módulos

| Módulo | O que faz |
|---|---|
| Painel Principal | KPIs consolidados de todos os módulos |
| Oficina & Manutenção | Ordens de serviço, checklists, equipamentos e histórico de máquinas |
| Gestão de Stock | Entradas, saídas, materiais e relatórios |
| Portal HST | Acidentes, áreas de risco, EPIs e tensão arterial |
| Ferramentaria | Inventário, empréstimos, devoluções e danos |
| RH & Quadro de Pessoal | Colaboradores da empresa |
| Avaliação de Desempenho | Campanhas de avaliação com portal para avaliadores |
| Pedidos de Aquisição | Pedidos, aprovação de valores e fornecedores |
| Plano de Férias | Plano anual, folha mensal para o RH e calendário visual |
| Permissões | Contas, níveis de acesso, matriz de permissões e auditoria |

## Controlo de Acesso (v2.0)

- Cada pessoa entra com o seu **código** (ex.: DM0069) e **senha**.
- As senhas ficam guardadas como **hash bcrypt** na base de dados: nem quem gere a
  base consegue ler a senha de outra pessoa.
- Cada login cria uma **sessão no servidor** com validade de 12 horas. Desativar
  uma conta corta as sessões dela de imediato.
- Quatro níveis: **admin** (tudo), **gestor**, **operador** e **consulta** (só ver).
- A matriz de permissões define, por módulo, o que cada nível pode: **ver**, **criar**,
  **editar** ou **apagar**. Ajusta-se no módulo Permissões sem mexer em código.
- As ações sensíveis (criar contas, repor senhas, apagar, alterar permissões,
  bloquear o sistema) pedem sempre a **chave de administração**.
- Todas as entradas e ações ficam registadas no **historial de acessos**.
- É possível **bloquear o sistema inteiro** com um clique (só administração entra).

## Estrutura

```
index.html          Painel principal
login.html          Entrada no sistema
shared/             supabase.js, auth.js, guard.js, nav.js, tema.js, utils.js, style.css
oficina/            Módulo de oficina e manutenção
ferramentaria/      Módulo de ferramentaria
stock/              Módulo de stock
hst/                Portal HST
rh/                 RH e quadro de pessoal
avaliacao-desempenho/  Campanhas de avaliação
aquisicao/          Pedidos de aquisição
ferias/             Plano de férias
permissoes/         Contas, níveis e auditoria
sql/                Scripts da base de dados (correr no SQL Editor do Supabase)
```

## Como publicar alterações

1. Substituir ou adicionar os ficheiros no GitHub (upload direto).
2. A Vercel publica sozinha em segundos.
3. Se houver tabelas novas, correr primeiro o `.sql` correspondente no
   Supabase (Dashboard > SQL Editor > New query > Run).

## Histórico de Versões

**v2.0 - 10/09/2026** - Módulo de Permissões: login obrigatório em todas as páginas,
senhas em hash bcrypt, sessões no servidor (12h), níveis admin/gestor/operador/consulta,
matriz de permissões editável, chave de administração, bloqueio total do sistema e
historial de acessos.

**v1.2 - 09/09/2026** - Módulo Plano de Férias: plano anual marcado mês a mês,
extração mensal para o RH central, dias comunicados pelo RH, folhas para afixar,
calendário visual e relatórios.

**v1.0 - 2026** - Portal com os módulos de oficina, ferramentaria, stock, HST, RH,
avaliação de desempenho e aquisições.

---

Danmo Service System, Lda - Porto da Beira, Moçambique
Administrado por Filomeno Alexandre (DM0069)
