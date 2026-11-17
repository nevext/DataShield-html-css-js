/** @typedef {{ id: string; text: string; category: string; options: { label: string; score: number }[] }} Question */

/** @type {Question[]} */
const QUESTIONS = [
  {
    id: "q1",
    text: "Você reutiliza a mesma senha em vários sites ou aplicativos?",
    category: "Senhas",
    options: [
      { label: "Nunca — cada conta tem senha exclusiva", score: 0 },
      { label: "Em poucas contas sem dados sensíveis", score: 2 },
      { label: "Na maioria das contas", score: 4 },
    ],
  },
  {
    id: "q2",
    text: "A autenticação em duas etapas (2FA) está ativa nas contas importantes (e-mail, banco, redes)?",
    category: "Autenticação",
    options: [
      { label: "Sim, em todas que oferecem", score: 0 },
      { label: "Em algumas", score: 2 },
      { label: "Não uso 2FA", score: 4 },
    ],
  },
  {
    id: "q3",
    text: "Ao receber link por SMS, WhatsApp ou e-mail, o que costuma fazer?",
    category: "Phishing",
    options: [
      { label: "Confiro o remetente e a URL antes de clicar", score: 0 },
      { label: "Clico se parecer conhecido", score: 3 },
      { label: "Clico logo para resolver rápido", score: 5 },
    ],
  },
  {
    id: "q4",
    text: "Em redes Wi-Fi públicas, você acessa conta bancária ou compras?",
    category: "Redes",
    options: [
      { label: "Evito ou uso VPN / dados móveis", score: 0 },
      { label: "Às vezes, só para coisas simples", score: 2 },
      { label: "Sim, normalmente", score: 4 },
    ],
  },
  {
    id: "q5",
    text: "Com que frequência atualiza sistema, apps e antivírus?",
    category: "Dispositivos",
    options: [
      { label: "Assim que há atualização", score: 0 },
      { label: "De vez em quando", score: 2 },
      { label: "Raramente ou nunca", score: 4 },
    ],
  },
  {
    id: "q6",
    text: "Compartilha dados pessoais (documentos, endereço, telefone) em grupos abertos ou com desconhecidos?",
    category: "Compartilhamento",
    options: [
      { label: "Quase nunca, só o necessário", score: 0 },
      { label: "Às vezes em promoções ou sorteios", score: 3 },
      { label: "Com frequência, sem pensar muito", score: 5 },
    ],
  },
  {
    id: "q7",
    text: "Celular e computador ficam bloqueados quando você se ausenta?",
    category: "Dispositivos",
    options: [
      { label: "Sempre, com senha/PIN/biometria", score: 0 },
      { label: "Na maioria das vezes", score: 1 },
      { label: "Frequentemente desbloqueados", score: 4 },
    ],
  },
  {
    id: "q8",
    text: "Já informou senha ou código de verificação por mensagem a alguém?",
    category: "Phishing",
    options: [
      { label: "Nunca", score: 0 },
      { label: "Uma vez, sem entender o golpe", score: 4 },
      { label: "Já compartilhei códigos ou senhas", score: 6 },
    ],
  },
];

const SIMULATOR_SCENARIOS = [
  {
    id: "phish-sms",
    title: "SMS de “compra suspeita”",
    story:
      'Você recebe: "Compra de R$ 2.890 detectada. Cancele em: bit.ly/cancela-agora". O link não é do seu banco.',
    choices: [
      {
        text: "Clicar no link e informar os dados para cancelar",
        correct: false,
        feedback:
          "Página falsa de phishing. O golpista coleta login e dados. Ligue ou use o app oficial digitando o endereço você mesmo.",
      },
      {
        text: "Ignorar o link e abrir o app do banco para conferir",
        correct: true,
        feedback:
          "Correto. Canais oficiais não dependem de links encurtados. Na dúvida, confirme por número conhecido.",
      },
      {
        text: "Responder ao SMS com sua senha para provar identidade",
        correct: false,
        feedback:
          "Nunca compartilhe senhas ou códigos por mensagem. Bancos legítimos não pedem isso.",
      },
    ],
  },
  {
    id: "wifi",
    title: "Wi-Fi do shopping",
    story: 'Rede aberta "FREE_WIFI_MALL". Você precisa ver saldo e fazer um PIX.',
    choices: [
      {
        text: "Usar o Wi-Fi e abrir o app do banco",
        correct: false,
        feedback:
          "Redes públicas permitem interceptação. Prefira dados móveis ou VPN em transações.",
      },
      {
        text: "Usar 4G/5G ou esperar rede confiável",
        correct: true,
        feedback:
          "Boa decisão. Reduz risco de observação do tráfego em redes abertas.",
      },
    ],
  },
  {
    id: "anexo",
    title: "Anexo inesperado",
    story: 'E-mail: "Fatura em anexo — clique para abrir". Você não esperava essa cobrança.',
    choices: [
      {
        text: "Abrir o anexo imediatamente",
        correct: false,
        feedback:
          "Anexos inesperados podem instalar malware. Confirme com o remetente por canal alternativo antes de abrir.",
      },
      {
        text: "Verificar remetente, não abrir e acessar o serviço pelo site oficial",
        correct: true,
        feedback:
          "Previne ransomware e spyware. Exemplo citado na cartilha: anexo pode instalar programa malicioso.",
      },
    ],
  },
  {
    id: "incidente",
    title: "Suspeita de invasão",
    story: "Notificação de login em outro país na sua conta de e-mail.",
    choices: [
      {
        text: "Trocar senha em dispositivo confiável, ativar 2FA e avisar suporte",
        correct: true,
        feedback:
          "Alinhado à cartilha: pare a ação, avise responsáveis, troque senhas e guarde evidências (prints, horários).",
      },
      {
        text: "Só ignorar se ainda consigo entrar",
        correct: false,
        feedback:
          "Conta pode estar comprometida. Aja rápido: senha nova, 2FA, revisão de dispositivos conectados.",
      },
    ],
  },
];

/** Resumos nas orientações — conteúdo completo só na seção #cartilha */
const QUICK_TIPS = [
  {
    title: "Senhas",
    text: "Senhas longas e únicas por conta; gerenciador de senhas; nunca compartilhe códigos.",
  },
  {
    title: "2FA",
    text: "Ative em e-mail, banco e redes sociais. O segundo fator bloqueia acesso mesmo com senha vazada.",
  },
  {
    title: "Phishing",
    text: "Desconfie de urgência, medo, prêmio ou pedido de código. Confirme pelo canal oficial.",
  },
  {
    title: "Compartilhamento",
    text: "Publique só o necessário. Dados postados podem circular além do esperado.",
  },
];

/** Conteúdo integral da cartilha — renderizado apenas em #cartilha-viewer */
const CARTILHA_CONTENT = {
  titulo: "Escudo Digital: Proteja Seus Dados!",
  subtitulo:
    "Folder informativo — Segurança da Informação. Proteja seus dados. Reconheça golpes. Previna vazamentos.",
  destaque:
    "Sua atenção é uma das principais defesas no mundo digital.",
  blocos: [
    {
      num: "01",
      titulo: "Prevenção diária",
      subtitulo: "Pequenas atitudes, mais proteção",
      intro: "Hábitos simples ajudam a evitar golpes e exposição de dados.",
      itens: [
        "Mantenha celular, computador, aplicativos e antivírus atualizados.",
        "Use bloqueio de tela e não deixe dispositivos desbloqueados.",
        "Evite acessar contas importantes em redes Wi-Fi públicas.",
        "Compartilhe somente os dados necessários.",
        "Confira permissões de aplicativos e remova acessos que não usa.",
      ],
      callout: "Pense antes de compartilhar — uma informação publicada pode circular muito além do esperado.",
    },
    {
      num: "02",
      titulo: "Atenção aos sinais",
      subtitulo: "Como reconhecer uma tentativa de golpe",
      intro: "Desconfie quando uma mensagem tenta fazer você agir sem pensar.",
      itens: [
        "Urgência: “sua conta será bloqueada agora”.",
        "Medo: “detectamos uma compra; clique para cancelar”.",
        "Prêmio: “você ganhou um celular; pague a taxa para receber”.",
        "Segredo: “não conte a ninguém e faça esta transferência”.",
        "Pedido de código: alguém solicita o código recebido por SMS ou aplicativo.",
      ],
      callout:
        "Bancos e serviços legítimos não devem pedir sua senha ou código de autenticação por mensagem.",
    },
    {
      num: "03",
      titulo: "Ameaças digitais",
      subtitulo: "O que pode ameaçar seus dados?",
      intro: "Conheça os riscos mais comuns para identificar situações suspeitas.",
      itens: [
        "Phishing: mensagens e páginas falsas para roubar logins e dados.",
        "Malware: programas que espionam, danificam ou capturam informações.",
        "Ransomware: bloqueia arquivos e exige pagamento.",
        "Engenharia social: manipulação para obter informações ou ações.",
        "Roubo de conta: uso de senhas vazadas ou códigos obtidos por fraude.",
      ],
      callout: "Exemplo: um anexo inesperado pode instalar programa malicioso ao ser aberto.",
    },
    {
      num: "04",
      titulo: "Golpes virtuais",
      subtitulo: "Golpes comuns na internet",
      intro: "Veja exemplos de abordagens usadas para enganar pessoas.",
      itens: [
        "Falso banco: SMS/WhatsApp com compra suspeita e página falsa.",
        "Entrega / taxa: encomenda retida e cobrança por link desconhecido.",
        "Falso prêmio: sorteio que exige pagamento ou dados.",
        "Clone de WhatsApp: golpista se passa por conhecido e pede dinheiro.",
        "Boleto / Pix falso: dados alterados — confirme destinatário e canais oficiais.",
      ],
    },
    {
      num: "05",
      titulo: "Senhas e links",
      subtitulo: "Proteja seus acessos e navegue com cuidado",
      intro: "Senha forte e atenção aos links reduzem o risco de invasão.",
      itens: [
        "Crie senhas longas e exclusivas; use gerenciador confiável.",
        "Ative autenticação em dois fatores (2FA).",
        "Nunca compartilhe senhas ou códigos de verificação.",
        "Confira o endereço do site, letra por letra.",
        "Não clique em links inesperados; acesse digitando o endereço oficial.",
      ],
      callout: "Na dúvida, não clique. Procure o canal oficial para confirmar.",
    },
    {
      num: "06",
      titulo: "Prevenção de vazamentos e incidentes",
      subtitulo: "Se houver um incidente",
      intro: "Não envie documentos, fotos ou dados pessoais a quem não precisa recebê-los.",
      itens: [
        "Pare a ação imediatamente.",
        "Avise a equipe ou canal responsável (suporte, TI, instituição).",
        "Troque senhas em dispositivo confiável.",
        "Guarde evidências: capturas, horários, mensagens.",
        "Revise permissões e sessões ativas nas contas afetadas.",
      ],
    },
  ],
};

const RECOMMENDATIONS_BY_LEVEL = {
  baixo: [
    "Mantenha 2FA ativo e revise permissões de apps periodicamente.",
    "Continue evitando Wi-Fi público para transações sensíveis.",
    "Ajude colegas a reconhecer sinais de phishing.",
  ],
  medio: [
    "Priorize senhas únicas e um gerenciador de senhas.",
    "Ative 2FA em todas as contas que ainda não possuem.",
    "Revise o que compartilha em redes e grupos abertos.",
    "Consulte a cartilha na seção dedicada para aprofundar cada tema.",
  ],
  alto: [
    "Troque senhas reutilizadas imediatamente (em ambiente confiável).",
    "Ative 2FA e remova permissões excessivas de aplicativos.",
    "Não clique em links de urgência — confirme sempre pelo canal oficial.",
    "Evite Wi-Fi público para banco e compras até revisar seus hábitos.",
    "Leia a cartilha completa e repita o questionário após mudanças de hábito.",
  ],
};

const RECOMMENDATIONS_BY_CATEGORY = {
  Senhas: "Use senhas exclusivas e longas; considere um gerenciador. Nunca informe senhas reais neste ou em outros sites suspeitos.",
  Autenticação: "Ative 2FA em e-mail, banco e redes. Guarde códigos de recuperação em local seguro.",
  Phishing: "Desconfie de urgência e links encurtados. Digite o endereço do serviço manualmente.",
  Redes: "Prefira dados móveis ou VPN em redes abertas.",
  Dispositivos: "Atualize sistema e apps; mantenha bloqueio de tela ativo.",
  Compartilhamento: "Compartilhe apenas o mínimo necessário (LGPD — minimização, art. 6º).",
};