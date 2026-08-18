/**
 * criterios.js — Os 10 critérios oficiais da Ficha de Avaliação de
 * Desempenho da Danmo, extraídos diretamente da folha CLASSIFICADOR
 * do ficheiro Excel partilhado. Cada critério é pontuado de 0 a 100.
 * Usado por: portal.html, preencher_auto.html, preencher_supervisor.html,
 * preencher_director.html, avaliacoes.html.
 */

var CRITERIOS = [
    { id: 'pontualidade', nome: 'Pontualidade', descricao: 'Avalia o grau de cumprimento do horário de trabalho',
      faixas: {
        nao_aceitavel: '.Desinteresse reiterado pelo cumprimento do seu regime de horário de trabalho .Mais de 20 vezes/mês não cumpriu o horário de trabalho',
        insuficiente: '.São frequentes os atrasos e a dificuldade em cumprir o seu regime de horário de trabalho .Entre 15/20 vezes/mês não cumpriu o horário de trabalho',
        satisfatorio: '.Cumpre   normalmente   o seu regime de horário de trabalho .Entre 10/15 vezes/mês não cumpriu    o    horário    de trabalho',
        bom: '.Cumpre exemplarmente o regime de horário de trabalho ou raramente regista atrasos .Entre 5/10 vezes/mês não cumpriu o horário de trabalho',
        excelente: '.Chama-se  a  atenção  pela sua pontualidade .Entre  0/5  vezes/mês  não cumpriu    o    horário    de trabalho'
      } },
    { id: 'assiduidade', nome: 'Assiduidade', descricao: 'Avalia quantificando as faltas injustificadas no mês',
      faixas: {
        nao_aceitavel: '.Tem faltas injustificadas superiores a 3 dias/ mês',
        insuficiente: '.Tem faltas injustificadas entre 2 a 3 dias/ mês',
        satisfatorio: '.Tem faltas injustificadas de 1 a 2 dias/ mês',
        bom: '.Tem faltas injustificadas até 1 dia/ mês',
        excelente: '.Não tem faltas injustificadas'
      } },
    { id: 'relacoes_humanas', nome: 'Relações Humanas', descricao: 'Avalia a estabilidade em estabelecer e manter boas relações com as pessoas com quem trabalha, bem como a capacidade para trabalhar em equipa',
      faixas: {
        nao_aceitavel: '. Difícil relacionamento . Gera conflitos permanentemente . Avesso à integração em equipa . Reage negativamente às legítimas directivas hierárquicas. . Reage frequentemente de forma negativa perante entidades eteriores ou utentes',
        insuficiente: '. Irregular relacionamento . Gera por vezes conflitos, não contribuindo para o bom ambiente de trabalho . Revela dificuldades em se integrar em equipa . Aceita com relutâmcia as legítimas directivas hierárquicas . Reage por vezes, de forma negativa perante entidades/utentes',
        satisfatorio: '. Relacionamento normal . Integra-se normalmente na equipa. É aceite. . Aceita naturalmente as legítimas directivas hierárquicas . Estabelece um relacionamento correcto com as entidades exteriores/utentes',
        bom: '. Fácil relacionamento. Tem boa aceitação . Cultura e espírito de equipa . Empenha-se na resposta às legítimas directivas Hierárquicas . Procura ser correcto e solícito no relacionamento com as entidades exteriores ou utentes',
        excelente: '. Relacionamento exemplar. Tem muito boa aceitação . Dinamiza o espírito de equipa, aumentando o grau de coesão . Coopera e dialoga com a hierarquia . Gosto, facilidade, correcção e eficiência nas relações com as entidades exteriores/utentes'
      } },
    { id: 'disponibilidade_adaptacao', nome: 'Disponibilidade/Adaptação Profissional', descricao: 'Avalia a actitude para participar em acções independentemente da sua previsibilidade que signifiquem acréscimo de trabalho decorrente de variações sazonais ou de ponta',
      faixas: {
        nao_aceitavel: '. Não revela dedicação nem disponibilidade . Resistência a acorrer a eventuais sobrecargas de trabalho decorrentes de variações sazonais de ponta . Não aceita geralmente, qualquer tarefa que não se inclua na rotina habitual e revela, na prática resistência . Não consegue ultrapassar a rotina',
        insuficiente: '. Pouca dedicação e disponibilidade . Aceita com relutâmcia as tarefas que não se incluam na rotina habitual ou que resultem de sobrecargas de trabalho decorrentes de variações sazonais ou de ponta . Nítida dificuldade de adaptação a novas tarefas e situações',
        satisfatorio: '. Razoável dedicação e disponibilidade . Aceita com naturalidade as tarefas que não se incluam na rotina habitual ou que resultem de sobrecargas de trabalho decorrentes de variações sazonais ou de ponta . Adaptação satisfatória a novas tarefas, embora hesite perante situações menos frequentes',
        bom: '. Bom nível de dedicação e disponibilidade . Aceita com empenho e boa vontande tarefas não se incluidas na rotina habitual ou que resultem de sobrecargas de trabalho decorrentes de variações sazonais ou de ponta . Revela boa adaptação  a novas tarefas e a situações menos frequentes',
        excelente: '. Excepcional nível de dedicação e empenhamento. . Disponibiliza-se independentemente de solicitação, para a realização de tarefas não incluidas na rotina habitual ou que resultem de sobrecargas de traba- lho decorrentes de variações sazonais ou de ponta . Disponibiliza-se, prontamente, sempre que os objectivoa do sector ou da Insti- tuição estejam em causa . Excepcional adaptação à mudanças.'
      } },
    { id: 'aperfeicoamento_profissional', nome: 'Aperfeiçoamento Profissional', descricao: 'Avalia o interesse demostrado em melhorar os conhecimentos profissionais e em corrigir defeitos e pontos fracos',
      faixas: {
        nao_aceitavel: '. Desinteresse em adquirir novos conhecimentos e em melhorar a qualidade de trabalho',
        insuficiente: '. Algum interesse, embora esporádico e pouco frequente, em adquirir novos conhecimentos e aperfeiçoar o seu trabalho',
        satisfatorio: '. Interesse , embora descontínuo, em aumentar os seus conhecimentos e aperfeiçoar o seu trabalho',
        bom: '. Em regra revela Interesse em melhorar os conhecimentos e aperfeiçoar o seu trabalho',
        excelente: '. Interesse metódico e sistemático em melhorar os conhecimentos profissionais e a qualidade do seu trabalho'
      } },
    { id: 'responsabilidade', nome: 'Responsabilidade', descricao: 'Avalia a capacidade de prever, julgar e assumir as conseqências dos seus actos',
      faixas: {
        nao_aceitavel: '. Evita as responsabilidades . Não prevé nem assume as consequê- ncias dos seus actos',
        insuficiente: '. Grande dificuldade em assumir responsabi- lidades. . Nem sempre avalia as conseqências dos seus actos, mas é capaz de as assumir',
        satisfatorio: '. Assume normalmente as responsabi- lidades . Pondera e assume normalmente as consequências dos seus actos.',
        bom: '. Assume claramente as suas responsabilidades . Revela ponderação em todos os actos que pratica e assume as suas consequências',
        excelente: '. Assume deliberadamente as suas responsabilidades . Revela elevada ponderação nos actos que pratica, assumindo integralmente e por iniciativa própria, a responsabilidade pelos mesmos, corrigindo-os se necessário'
      } },
    { id: 'autonomia_iniciativa', nome: 'Autonomia/Iniciativa', descricao: 'Avalia o grau de autonomia no desempenho da função, bem como a capacidade de organização e de decisão',
      faixas: {
        nao_aceitavel: '. Necessita de orientação pormenorizada . Recorre constantemente aos conselhos e directivas do responsável ou outros. . Não revela espírito de iniciativa.',
        insuficiente: '. Necessita frequentemente de orientação . Recorre com alguma frequência aos conselhos e directivas do responsável ou outros . Revela pouca iniciativa',
        satisfatorio: '. Necessita de orientação e apoio geral e de algumas directivas específicas . Recorre por vezes, a esclarecimentos complementares do responsável . Revela iniciativa com resultados visíveis',
        bom: '. Necessita apenas de orientação Geral . Não recorre a esclarecimentos comple- mentares . Revela acentuado grau de iniciativa, res- pondendo aos problemas de maneira rápida e acertada e apresentando sugestões de influência notória nos resultados',
        excelente: '. Com um mínimo de directivas, desenvolve e dinamiza o seu trabalho . É independente e resoluto . Revela elevado grau de iniciativa, com impácto decisivo nos resultados'
      } },
    { id: 'dominio_funcao', nome: 'Domínio da Função', descricao: 'Avalia o nível de conhecimentos práticos relacionados com a exigência da função',
      faixas: {
        nao_aceitavel: '. Conhecimentos insuficientes em aspectos fundamentais da função . Insuficiente conhecimento da realidade do trabalho em amplitude e em profundidade . Não tem experiência prática',
        insuficiente: 'Lacunas no domínio dos conhecimentos relacionados com aspectos fundamentais da função . Deficiências de conhecimento da realidade do trabalho em amplitude e profundidade Experiencia reduzida para o desempenho da função.',
        satisfatorio: 'Domínio dos conhecimentos necessários ao desenvolvimento da função . Razoável apreensão da realidade do trabalho em pelo menos um dos aspectos (amplitude ou profundidade) . Grau de experiência razoável para o denpenho da função',
        bom: '. Nível de conhecimentos ultrapassando, em alguns aspectos, o âmbito da função . Bom nível de apreensão da realidade do trabalho na generalidade dos sues aspectos (amplitude e profundidade) . Nível de experiência que permite o domío da função e gradualmente aperfeiçoar os seus conhecimentos.',
        excelente: '. Nível de conhecimentos, excedendo em muitos aspectos, as exigências da função . Domínio da realidade da função em amplitu- de e profundidade. Nível de experiência que permite atingir o grau de mestria'
      } },
    { id: 'quantidade_trabalho', nome: 'Quantidade de Trabalho', descricao: 'Avalia o volume de trabalho útil produzido',
      faixas: {
        nao_aceitavel: 'Nunca alcança o esperado',
        insuficiente: '. Resultados geralmente inferiores ao esperado',
        satisfatorio: '. Faz normalmente o que se espera',
        bom: '. Faz normalmente mais do que dele se espera',
        excelente: 'Faz sempre mais do que se espera'
      } },
    { id: 'qualidade_trabalho', nome: 'Qualidade de Trabalho', descricao: 'Avalia o grau de perfeição do trabalho produzido',
      faixas: {
        nao_aceitavel: 'Comete erros graves com muita frequência.',
        insuficiente: '. Trabalho com bastantes erros, exigindo Acompanhamento a correcções frequentes',
        satisfatorio: '. Trabalho que satisfaz, mas que exige aperfeiçoamento de pormenor',
        bom: '. Trabalho bem executado, sem deficiências',
        excelente: '. Executa o trabalho com total ausência de erros'
      } },
  ];
/* Faixas de classificação FINAL (confirmadas com o utilizador —
   Satisfatório usa 41-70, igual à folha CLASSIFICADOR) */
var FAIXAS_CLASSIFICACAO = [
  { min: 91, max: 100, nome: 'Excelente' },
  { min: 71, max: 90,  nome: 'Bom' },
  { min: 41, max: 70,  nome: 'Satisfatório' },
  { min: 21, max: 40,  nome: 'Insuficiente' },
  { min: 0,  max: 20,  nome: 'Não Aceitável' }
];

function classificar(pontos) {
  if (pontos === null || pontos === undefined) return '—';
  for (var i = 0; i < FAIXAS_CLASSIFICACAO.length; i++) {
    var f = FAIXAS_CLASSIFICACAO[i];
    if (pontos >= f.min && pontos <= f.max) return f.nome;
  }
  return '—';
}

/* Pontuação = média simples dos 10 critérios (0-100 cada) */
function calcularPontuacao(respostas) {
  if (!respostas) return null;
  var soma = 0, count = 0;
  CRITERIOS.forEach(function(c) {
    var v = respostas[c.id];
    if (v !== undefined && v !== null && v !== '') { soma += Number(v); count++; }
  });
  return count > 0 ? Math.round((soma / count) * 100) / 100 : null;
}
