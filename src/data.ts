import { BlogPost, PracticeArea } from './types';

export const PRACTICE_AREAS: PracticeArea[] = [
  {
    id: 'civil',
    iconName: 'Scale',
    name: 'Direito Civil',
    description: 'Assessoria em contratos, responsabilidade civil, obrigações e direitos reais com foco preventivo.',
    fullDetails: `O Direito Civil é a espinha dorsal de nossas relações cotidianas e comerciais. Atuamos de forma estratégica para mitigar riscos, proteger patrimônios e garantir a segurança jurídica de nossos clientes por meio de pareceres elaborados, análise criteriosa de contratos e forte representação em litígios.`,
    services: [
      'Elaboração e revisão de contratos de alta complexidade',
      'Responsabilidade civil e indenizações por danos morais e materiais',
      'Direito Imobiliário (regularização de imóveis, usucapião, despejos)',
      'Assessoria em transações e negócios jurídicos preventivos',
      'Planejamento sucessório inicial e proteção patrimonial'
    ]
  },
  {
    id: 'trabalhista',
    iconName: 'Briefcase',
    name: 'Direito Trabalhista',
    description: 'Defesa de interesses nas relações de emprego, compliance trabalhista e cálculos rescisórios.',
    fullDetails: `Oferecemos assessoria jurídica trabalhista completa, tanto preventiva quanto contenciosa. Auxiliamos empresas no compliance das leis trabalhistas, prevenindo passivos desnecessários, e defendemos os direitos dos trabalhadores de forma técnica e transparente, visando sempre o justo equilíbrio nas relações de trabalho.`,
    services: [
      'Auditoria trabalhista preventiva para redução de passivos',
      'Reclamações trabalhistas e defesa de empregadores em juízo',
      'Cálculos rescisórios complexos e revisão de benefícios',
      'Assessoria em acordos e convenções coletivas de trabalho',
      'Orientação sobre novas modalidades de trabalho (Teletrabalho/Home Office)'
    ]
  },
  {
    id: 'previdenciario',
    iconName: 'BookOpen',
    name: 'Direito Previdenciário',
    description: 'Planejamento de aposentadoria, concessão de benefícios e revisões administrativas ou judiciais.',
    fullDetails: `O planejamento e a obtenção de benefícios previdenciários exigem um estudo minucioso da vida contributiva. Realizamos cálculos detalhados para garantir que nossos clientes acessem a melhor aposentadoria possível, atuando na esfera administrativa perante o INSS e judicialmente em revisões complexas.`,
    services: [
      'Planejamento Previdenciário Estratégico personalizado',
      'Requerimento de aposentadorias (tempo de contribuição, idade, especial)',
      'Concessão de auxílios e benefícios por incapacidade',
      'Revisões de benefícios (incluindo a Revisão da Vida Toda)',
      'Recursos administrativos junto ao Conselho de Recursos da Previdência'
    ]
  },
  {
    id: 'familia',
    iconName: 'Users',
    name: 'Família e Sucessões',
    description: 'Resolução de conflitos familiares, divórcios, inventários, guardas e pensões alimentícias com discrição.',
    fullDetails: `As questões de família demandam não apenas conhecimento técnico aprofundado, mas também extrema sensibilidade e discrição. Buscamos soluções que priorizem o diálogo e a preservação dos vínculos afetivos, oferecendo suporte seguro em momentos delicados de transição familiar.`,
    services: [
      'Divórcio consensual ou litigioso (judicial e extrajudicial)',
      'Inventários, partilhas de bens e testamentos',
      'Fixação, oferta, execução e revisão de pensão alimentícia',
      'Regulamentação de guarda e regime de convivência familiar',
      'Reconhecimento e dissolução de união estável'
    ]
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    category: 'DIREITO CIVIL',
    date: '12 OUT 2023',
    title: 'Planejamento Sucessório: Como proteger seu patrimônio familiar',
    excerpt: 'Entenda a importância de organizar a sucessão de bens para evitar conflitos judiciais prolongados...',
    content: `O planejamento sucessório é um conjunto de estratégias jurídicas destinadas a organizar a transferência de patrimônio de uma pessoa para seus herdeiros de maneira ordenada, eficiente e pacífica. Mais do que apenas decidir o destino dos bens, planejar a sucessão visa evitar desgastes emocionais, burocracias excessivas e conflitos familiares desgastantes que costumam surgir no inventário tradicional.

### Benefícios de um Planejamento Estratégico
1. **Redução de Custos**: O inventário convencional pode consumir uma parcela significativa do patrimônio da família com impostos (ITCMD), custas judiciais e honorários advocatícios. O planejamento bem elaborado permite otimizar a carga tributária.
2. **Preservação dos Vínculos Familiares**: Ao definir de forma clara e justa a destinação dos bens em vida, diminui-se drasticamente o espaço para desentendimentos entre herdeiros.
3. **Continuidade de Negócios**: Para famílias que possuem empresas, o planejamento sucessório é vital para definir quem assumirá a gestão, evitando a paralisação das atividades da empresa em caso de falecimento do fundador.

### Principais Instrumentos Utilizados
* **Doação com reserva de usufruto**: Transmissão imediata da nua-propriedade dos bens, mantendo o direito de uso e frutos (como aluguel) com o doador enquanto ele viver.
* **Testamento**: Manifestação expressa de vontade quanto ao destino da parcela disponível do patrimônio (50%).
* **Holding Familiar**: Criação de uma empresa controladora para gerir os bens da família, facilitando a distribuição de quotas entre os herdeiros e protegendo o patrimônio contra riscos externos.

A assessoria de um advogado especialista é indispensável para desenhar a estrutura ideal, de acordo com o tamanho do patrimônio e a dinâmica familiar única de cada cliente.`,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBa4TSl8kls_u92msAyF_ekWOHrD6ETOPZ3Pp8shLNDtUKNOTzMvJHpzoVosU42smyKUoxhow9bi0xfdo-7qSuLTTBG3pNg56PGCMVZ3lUN9iwCe5zXZLhagoq3eZrZCyStIE4WiPf_aZ6Tx2yne4Qqqc5RTi8MSV8n0Ni2VWH1BKlC1Prnp3mlrn2L9UCO_4aMlfaki_HpkgLXk0lyYhslWvA-L5yoBraKEcdWRKMiLTK6VVhVK-k',
    readTime: '4 min de leitura'
  },
  {
    id: '2',
    category: 'TRABALHISTA',
    date: '05 NOV 2023',
    title: 'Novas regras do Home Office: O que muda para as empresas',
    excerpt: 'Esclarecimentos sobre as recentes alterações legislativas que regulamentam o trabalho remoto no Brasil...',
    content: `Com a consolidação do trabalho híbrido e remoto após os desafios globais recentes, a legislação brasileira passou por atualizações cruciais para conferir maior segurança jurídica tanto para empregadores quanto para colaboradores. A Medida Provisória e posterior Lei do Teletrabalho trouxeram regras claras que precisam ser devidamente observadas pelas organizações.

### O que define juridicamente o Teletrabalho?
O teletrabalho é caracterizado pela prestação de serviços preponderantemente fora das dependências do empregador, com a utilização de tecnologias de informação e comunicação. O comparecimento eventual às dependências da empresa para realização de atividades específicas não descaracteriza este regime de contratação.

### Principais Mudanças na Legislação
1. **Controle de Jornada**: Anteriormente, os trabalhadores em regime remoto eram isentos de controle de ponto. Com as novas regras, o controle de jornada passa a ser obrigatório, exceto se a contratação for expressamente realizada por produção ou por tarefa de forma integral.
2. **Requisitos de Contrato**: A transição entre trabalho presencial e remoto exige a celebração de um termo aditivo ao contrato de trabalho escrito, detalhando a responsabilidade pela aquisição, manutenção e fornecimento dos equipamentos tecnológicos e infraestrutura necessária.
3. **Reembolso de Despesas**: As despesas adicionais incorridas pelo trabalhador (como energia elétrica de alta intensidade e internet de alta velocidade) devem ser reguladas em contrato, não possuindo natureza salarial, o que afasta a incidência de encargos tributários para a empresa.
4. **Acidente de Trabalho**: As regras de prevenção de acidentes e doenças ocupacionais continuam válidas. O trabalhador deve assinar um termo de compromisso instruído pela empresa sobre as precauções ergonômicas e de saúde.

O não cumprimento dessas exigências legais pode gerar passivos trabalhistas elevados e autuações administrativas. Recomenda-se uma consultoria jurídica preventiva para ajustar as políticas internas e aditivos contratuais corporativos de forma segura.`,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASgAh_vyWo8l4cPRNFHLk2zqiGcshHEBhAPJqN-vG0FdHpDXu9qL2GfoA6OHRmSGInqkARi_1WXpq5-gzNyRJtBeKxE0MhwPGVj7yBUfe7Nj02-VzO2Td2xLFkiKsiimnKj6Yw97oQ12SZKP4vEtKRf4RRcpcPMhGNPVBbU3rQeQHYo_jIREZYQxgrDcA1EaXfM0BrCRgT1MMqeRHsFlPi8Fy2panRnr0PMxCXwzh0xBM7gQLyoPQ',
    readTime: '5 min de leitura'
  },
  {
    id: '3',
    category: 'PREVIDENCIÁRIO',
    date: '20 DEZ 2023',
    title: 'Revisão da Vida Toda: Quem tem direito ao novo cálculo?',
    excerpt: 'Tudo o que você precisa saber sobre a decisão do STF que impacta as aposentadorias de milhares de brasileiros...',
    content: `A chamada "Revisão da Vida Toda" é uma das teses previdenciárias mais discutidas da história jurídica nacional recente. Ela consiste na possibilidade de recalcular o benefício de aposentadoria de segurados do INSS incluindo no cálculo das médias todos os salários de contribuição anteriores a julho de 1994 (período pré-Plano Real), o que beneficia diretamente aqueles que possuíam contribuições altas nesta época.

### Quem Pode se Beneficiar da Revisão?
Não são todos os aposentados que terão vantagem financeira com a Revisão da Vida Toda. É essencial atender cumulativamente aos seguintes critérios básicos:
1. **Data de Aposentadoria**: Ter se aposentado entre 29 de novembro de 1999 e 12 de novembro de 2019 (data da Reforma da Previdência).
2. **Prazo Decadencial**: Estar recebendo o benefício há menos de 10 anos (prazo limite para solicitar revisões perante o INSS).
3. **Contribuições Relevantes Antes de 1994**: Ter possuído bons salários de contribuição em Cruzeiros, Cruzados ou moedas vigentes antes do advento do Real em julho de 1994.

### Por Que a Análise de Cálculo é Fundamental?
Entrar com a ação judicial de revisão sem a realização prévia de cálculos matemáticos precisos baseados no CNIS (Cadastro Nacional de Informações Sociais) é um risco grave. Em alguns casos, incluir as contribuições antigas pode reduzir o valor do benefício atual ou gerar ônus sucumbenciais se o pedido for improcedente.

Atuamos realizando perícias previdenciárias completas para certificar a viabilidade econômica do pedido antes de propor qualquer medida administrativa ou judicial, garantindo a máxima segurança ao patrimônio do segurado.`,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRDfHQctXq91nm5XErlh0AaRl-DepYtGlW5ESv8KAKrBz-DcktIjqwk51yDNLZrmiWbf3enQrir0mMtOE3Ggxy-ONRBxdyEZnl_YHWC4l84yRlAkBdhsnglRv-6ueRTirWPNANSCF-pXZqtMkqrZ6iRQFu5e4HH8ihG0wN95XkJEjfanPFw7gb7iNaOKEzjibrwgtwoexREsWSVUOd_U8L3UA1VUjLR56gGbIyARytLL68aettiZA',
    readTime: '6 min de leitura'
  }
];
