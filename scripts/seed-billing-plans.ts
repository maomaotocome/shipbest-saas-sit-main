import {
  BillingScheme,
  Currency,
  Feature,
  FeatureType,
  PeriodType,
  Plan,
  PlanPeriod,
  PlanStatus,
  Prisma,
  PrismaClient,
  ResetBehavior,
} from "../src/db/generated/prisma/";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting to generate billing plan data...");

  // clean existing data
  await prisma.invoice.deleteMany({});
  await prisma.purchase.deleteMany({});
  await prisma.subscriptionPeriod.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.affiliateOrder.deleteMany({});
  await prisma.planPeriodFeatureAllocation.deleteMany({});
  await prisma.planPeriodProviderConfig.deleteMany({});
  await prisma.planPeriod.deleteMany({});
  await prisma.planFeatureRelation.deleteMany({});
  await prisma.featureTranslation.deleteMany({});
  await prisma.feature.deleteMany({});
  await prisma.planTranslation.deleteMany({});
  await prisma.plan.deleteMany({});

  console.log("Existing data cleaned, starting to create new data...");

  // create features
  const features = await createFeatures();
  console.log(`Created ${features.length} features`);

  // create plans
  const plans = await createPlans();
  console.log(`Created ${plans.length} plans`);

  // Associate plans with features
  await associatePlansWithFeatures(plans, features);
  console.log("Associated plans with features");

  // Create plan periods
  await createPlanPeriods(plans, features);
  console.log("Created plan periods and feature quotas");

  // Print preview table
  await printPlanSummary();

  console.log("Data generation completed!");
}

async function createFeatures() {
  // 1. Credits - Main consumable feature
  const creditFeature = await prisma.feature.create({
    data: {
      code: "CREDITS",
      featureType: FeatureType.CONSUMABLE,
      defaultResetBehavior: ResetBehavior.RESET,
      translations: {
        create: [
          {
            locale: "zh",
            name: "积分",
            description: "可用于AI对话、生成图片等功能",
            unit: "点",
          },
          {
            locale: "en",
            name: "Credits",
            description: "Used for AI conversations, image generation, etc.",
            unit: "points",
          },
          // Other languages...
          {
            locale: "ja",
            name: "クレジット",
            description: "AI会話、画像生成などに使用",
            unit: "ポイント",
          },
          {
            locale: "ko",
            name: "크레딧",
            description: "AI 대화, 이미지 생성 등에 사용",
            unit: "포인트",
          },
          {
            locale: "fr",
            name: "Crédits",
            description: "Utilisés pour les conversations IA, la génération d'images, etc.",
            unit: "points",
          },
          {
            locale: "de",
            name: "Guthaben",
            description: "Für KI-Gespräche, Bilderzeugung usw.",
            unit: "Punkte",
          },
          {
            locale: "es",
            name: "Créditos",
            description: "Usados para conversaciones de IA, generación de imágenes, etc.",
            unit: "puntos",
          },
          {
            locale: "it",
            name: "Crediti",
            description: "Utilizzati per conversazioni AI, generazione di immagini, ecc.",
            unit: "punti",
          },
          {
            locale: "pt",
            name: "Créditos",
            description: "Usados para conversas com IA, geração de imagens, etc.",
            unit: "pontos",
          },
        ],
      },
    },
  });

  // 2-3. Pure descriptive features
  const prioritySupport = await prisma.feature.create({
    data: {
      code: "PRIORITY_SUPPORT",
      featureType: FeatureType.AVAILABILITY,
      translations: {
        create: getTranslationsForFeature("PRIORITY_SUPPORT"),
      },
    },
  });

  const earlyAccess = await prisma.feature.create({
    data: {
      code: "EARLY_ACCESS",
      featureType: FeatureType.AVAILABILITY,
      translations: {
        create: getTranslationsForFeature("EARLY_ACCESS"),
      },
    },
  });

  // 4-6. Non-consumable allocatable features
  const storageSpace = await prisma.feature.create({
    data: {
      code: "STORAGE_SPACE",
      featureType: FeatureType.ALLOCATABLE,
      translations: {
        create: getTranslationsForFeature("STORAGE_SPACE"),
      },
    },
  });

  const maxProjects = await prisma.feature.create({
    data: {
      code: "MAX_PROJECTS",
      featureType: FeatureType.ALLOCATABLE,
      translations: {
        create: getTranslationsForFeature("MAX_PROJECTS"),
      },
    },
  });

  const teamMembers = await prisma.feature.create({
    data: {
      code: "TEAM_MEMBERS",
      featureType: FeatureType.ALLOCATABLE,
      translations: {
        create: getTranslationsForFeature("TEAM_MEMBERS"),
      },
    },
  });

  // 7-10. Other consumable features
  const imageGeneration = await prisma.feature.create({
    data: {
      code: "IMAGE_GENERATION",
      featureType: FeatureType.CONSUMABLE,
      defaultResetBehavior: ResetBehavior.RESET,
      translations: {
        create: getTranslationsForFeature("IMAGE_GENERATION"),
      },
    },
  });

  const audioTranscription = await prisma.feature.create({
    data: {
      code: "AUDIO_TRANSCRIPTION",
      featureType: FeatureType.CONSUMABLE,
      defaultResetBehavior: ResetBehavior.RESET,
      translations: {
        create: getTranslationsForFeature("AUDIO_TRANSCRIPTION"),
      },
    },
  });

  const codeGeneration = await prisma.feature.create({
    data: {
      code: "CODE_GENERATION",
      featureType: FeatureType.CONSUMABLE,
      defaultResetBehavior: ResetBehavior.RESET,
      translations: {
        create: getTranslationsForFeature("CODE_GENERATION"),
      },
    },
  });

  const apiCalls = await prisma.feature.create({
    data: {
      code: "API_CALLS",
      featureType: FeatureType.CONSUMABLE,
      defaultResetBehavior: ResetBehavior.RESET,
      translations: {
        create: getTranslationsForFeature("API_CALLS"),
      },
    },
  });

  return [
    creditFeature,
    prioritySupport,
    earlyAccess,
    storageSpace,
    maxProjects,
    teamMembers,
    imageGeneration,
    audioTranscription,
    codeGeneration,
    apiCalls,
  ];
}

function getTranslationsForFeature(featureCode: string) {
  const translations = {
    PRIORITY_SUPPORT: {
      zh: { name: "优先客服支持", description: "获得优先的客服支持和响应", unit: null },
      en: {
        name: "Priority Support",
        description: "Get priority customer support and faster response",
        unit: null,
      },
      ja: {
        name: "優先サポート",
        description: "優先的なカスタマーサポートと迅速な対応",
        unit: null,
      },
      ko: { name: "우선 지원", description: "우선적인 고객 지원 및 빠른 응답", unit: null },
      fr: {
        name: "Support prioritaire",
        description: "Bénéficiez d'un support client prioritaire et de réponses plus rapides",
        unit: null,
      },
      de: {
        name: "Prioritäts-Support",
        description: "Erhalten Sie vorrangigen Kundensupport und schnellere Antworten",
        unit: null,
      },
      es: {
        name: "Soporte prioritario",
        description: "Obtenga soporte al cliente prioritario y respuestas más rápidas",
        unit: null,
      },
      it: {
        name: "Supporto prioritario",
        description: "Ricevi supporto clienti prioritario e risposte più rapide",
        unit: null,
      },
      pt: {
        name: "Suporte prioritário",
        description: "Obtenha suporte ao cliente prioritário e respostas mais rápidas",
        unit: null,
      },
    },
    EARLY_ACCESS: {
      zh: { name: "抢先体验新功能", description: "提前体验最新功能和更新", unit: null },
      en: {
        name: "Early Access",
        description: "Get early access to new features and updates",
        unit: null,
      },
      ja: { name: "先行アクセス", description: "新機能やアップデートへの早期アクセス", unit: null },
      ko: {
        name: "얼리 액세스",
        description: "새로운 기능 및 업데이트에 대한 조기 액세스",
        unit: null,
      },
      fr: {
        name: "Accès anticipé",
        description: "Accédez en avant-première aux nouvelles fonctionnalités et mises à jour",
        unit: null,
      },
      de: {
        name: "Frühzugang",
        description: "Erhalten Sie frühzeitigen Zugang zu neuen Funktionen und Updates",
        unit: null,
      },
      es: {
        name: "Acceso anticipado",
        description: "Obtenga acceso anticipado a nuevas funciones y actualizaciones",
        unit: null,
      },
      it: {
        name: "Accesso anticipato",
        description: "Ottieni accesso anticipato a nuove funzionalità e aggiornamenti",
        unit: null,
      },
      pt: {
        name: "Acesso antecipado",
        description: "Obtenha acesso antecipado a novos recursos e atualizações",
        unit: null,
      },
    },
    STORAGE_SPACE: {
      zh: { name: "存储空间", description: "可用于存储文件、对话历史等", unit: "GB" },
      en: {
        name: "Storage Space",
        description: "Space for storing files, conversation history, etc.",
        unit: "GB",
      },
      ja: {
        name: "ストレージ容量",
        description: "ファイルや会話履歴などの保存用スペース",
        unit: "GB",
      },
      ko: { name: "저장 공간", description: "파일, 대화 기록 등을 저장하기 위한 공간", unit: "GB" },
      fr: {
        name: "Espace de stockage",
        description: "Espace pour stocker des fichiers, l'historique des conversations, etc.",
        unit: "Go",
      },
      de: {
        name: "Speicherplatz",
        description: "Platz zum Speichern von Dateien, Gesprächsverläufen usw.",
        unit: "GB",
      },
      es: {
        name: "Espacio de almacenamiento",
        description: "Espacio para almacenar archivos, historial de conversaciones, etc.",
        unit: "GB",
      },
      it: {
        name: "Spazio di archiviazione",
        description: "Spazio per archiviare file, cronologia delle conversazioni, ecc.",
        unit: "GB",
      },
      pt: {
        name: "Espaço de armazenamento",
        description: "Espaço para armazenar arquivos, histórico de conversas, etc.",
        unit: "GB",
      },
    },
    MAX_PROJECTS: {
      zh: { name: "最大项目数", description: "可创建的最大项目数量", unit: "个" },
      en: {
        name: "Maximum Projects",
        description: "Maximum number of projects you can create",
        unit: "",
      },
      ja: { name: "最大プロジェクト数", description: "作成可能なプロジェクトの最大数", unit: "" },
      ko: { name: "최대 프로젝트 수", description: "생성할 수 있는 최대 프로젝트 수", unit: "" },
      fr: {
        name: "Projets maximum",
        description: "Nombre maximum de projets que vous pouvez créer",
        unit: "",
      },
      de: {
        name: "Maximale Projekte",
        description: "Maximale Anzahl von Projekten, die Sie erstellen können",
        unit: "",
      },
      es: {
        name: "Proyectos máximos",
        description: "Número máximo de proyectos que puede crear",
        unit: "",
      },
      it: {
        name: "Progetti massimi",
        description: "Numero massimo di progetti che puoi creare",
        unit: "",
      },
      pt: {
        name: "Projetos máximos",
        description: "Número máximo de projetos que você pode criar",
        unit: "",
      },
    },
    TEAM_MEMBERS: {
      zh: { name: "团队成员", description: "可添加的团队成员数量", unit: "人" },
      en: { name: "Team Members", description: "Number of team members you can add", unit: "" },
      ja: { name: "チームメンバー", description: "追加可能なチームメンバーの数", unit: "人" },
      ko: { name: "팀 멤버", description: "추가할 수 있는 팀 멤버 수", unit: "명" },
      fr: {
        name: "Membres d'équipe",
        description: "Nombre de membres d'équipe que vous pouvez ajouter",
        unit: "",
      },
      de: {
        name: "Teammitglieder",
        description: "Anzahl der Teammitglieder, die Sie hinzufügen können",
        unit: "",
      },
      es: {
        name: "Miembros del equipo",
        description: "Número de miembros del equipo que puede agregar",
        unit: "",
      },
      it: {
        name: "Membri del team",
        description: "Numero di membri del team che puoi aggiungere",
        unit: "",
      },
      pt: {
        name: "Membros da equipe",
        description: "Número de membros da equipe que você pode adicionar",
        unit: "",
      },
    },
    IMAGE_GENERATION: {
      zh: { name: "AI图像生成", description: "使用AI生成图像的次数", unit: "次" },
      en: {
        name: "AI Image Generation",
        description: "Number of AI-generated images",
        unit: "images",
      },
      ja: { name: "AI画像生成", description: "AIで生成できる画像の数", unit: "枚" },
      ko: { name: "AI 이미지 생성", description: "AI로 생성할 수 있는 이미지 수", unit: "개" },
      fr: {
        name: "Génération d'images IA",
        description: "Nombre d'images générées par IA",
        unit: "images",
      },
      de: {
        name: "KI-Bilderzeugung",
        description: "Anzahl der KI-generierten Bilder",
        unit: "Bilder",
      },
      es: {
        name: "Generación de imágenes IA",
        description: "Número de imágenes generadas por IA",
        unit: "imágenes",
      },
      it: {
        name: "Generazione di immagini AI",
        description: "Numero di immagini generate dall'AI",
        unit: "immagini",
      },
      pt: {
        name: "Geração de imagens por IA",
        description: "Número de imagens geradas por IA",
        unit: "imagens",
      },
    },
    AUDIO_TRANSCRIPTION: {
      zh: { name: "音频转文字", description: "可转录的音频时长", unit: "分钟" },
      en: {
        name: "Audio Transcription",
        description: "Minutes of audio you can transcribe",
        unit: "minutes",
      },
      ja: { name: "音声文字起こし", description: "文字起こし可能な音声の長さ", unit: "分" },
      ko: { name: "오디오 변환", description: "변환할 수 있는 오디오 길이", unit: "분" },
      fr: {
        name: "Transcription audio",
        description: "Minutes d'audio que vous pouvez transcrire",
        unit: "minutes",
      },
      de: {
        name: "Audio-Transkription",
        description: "Minuten an Audio, die Sie transkribieren können",
        unit: "Minuten",
      },
      es: {
        name: "Transcripción de audio",
        description: "Minutos de audio que puede transcribir",
        unit: "minutos",
      },
      it: {
        name: "Trascrizione audio",
        description: "Minuti di audio che puoi trascrivere",
        unit: "minuti",
      },
      pt: {
        name: "Transcrição de áudio",
        description: "Minutos de áudio que você pode transcrever",
        unit: "minutos",
      },
    },
    CODE_GENERATION: {
      zh: { name: "代码生成", description: "使用AI生成代码的次数", unit: "次" },
      en: {
        name: "Code Generation",
        description: "Number of code snippets you can generate",
        unit: "snippets",
      },
      ja: { name: "コード生成", description: "生成可能なコードスニペットの数", unit: "回" },
      ko: { name: "코드 생성", description: "생성할 수 있는 코드 스니펫 수", unit: "개" },
      fr: {
        name: "Génération de code",
        description: "Nombre de snippets de code que vous pouvez générer",
        unit: "snippets",
      },
      de: {
        name: "Code-Generierung",
        description: "Anzahl der Code-Snippets, die Sie generieren können",
        unit: "Snippets",
      },
      es: {
        name: "Generación de código",
        description: "Número de fragmentos de código que puede generar",
        unit: "fragmentos",
      },
      it: {
        name: "Generazione di codice",
        description: "Numero di frammenti di codice che puoi generare",
        unit: "frammenti",
      },
      pt: {
        name: "Geração de código",
        description: "Número de trechos de código que você pode gerar",
        unit: "trechos",
      },
    },
    API_CALLS: {
      zh: { name: "API调用", description: "每月可用的API调用次数", unit: "次" },
      en: {
        name: "API Calls",
        description: "Number of API calls you can make per month",
        unit: "calls",
      },
      ja: { name: "API呼び出し", description: "月あたりのAPI呼び出し回数", unit: "回" },
      ko: { name: "API 호출", description: "월간 사용 가능한 API 호출 횟수", unit: "회" },
      fr: {
        name: "Appels API",
        description: "Nombre d'appels API que vous pouvez effectuer par mois",
        unit: "appels",
      },
      de: {
        name: "API-Aufrufe",
        description: "Anzahl der API-Aufrufe, die Sie pro Monat tätigen können",
        unit: "Aufrufe",
      },
      es: {
        name: "Llamadas API",
        description: "Número de llamadas API que puede realizar por mes",
        unit: "llamadas",
      },
      it: {
        name: "Chiamate API",
        description: "Numero di chiamate API che puoi effettuare al mese",
        unit: "chiamate",
      },
      pt: {
        name: "Chamadas de API",
        description: "Número de chamadas de API que você pode fazer por mês",
        unit: "chamadas",
      },
    },
  };

  const featureTranslations = translations[featureCode as keyof typeof translations];

  return Object.entries(featureTranslations).map(([locale, data]) => ({
    locale,
    name: data.name,
    description: data.description,
    unit: data.unit,
  }));
}

async function createPlans() {
  // basic plan
  const basicPlan = await prisma.plan.create({
    data: {
      code: "BASIC",
      status: PlanStatus.ACTIVE,
      billingScheme: BillingScheme.CREDIT_BASED,
      sortOrder: 1,
      isPopular: false,
      allowPrivateTasks: true,
      translations: {
        create: getPlanTranslations("BASIC"),
      },
    },
  });

  // pro plan
  const proPlan = await prisma.plan.create({
    data: {
      code: "PRO",
      status: PlanStatus.ACTIVE,
      billingScheme: BillingScheme.CREDIT_BASED,
      sortOrder: 2,
      isPopular: true,
      allowPrivateTasks: true,
      translations: {
        create: getPlanTranslations("PRO"),
      },
    },
  });

  // enterprise plan
  const enterprisePlan = await prisma.plan.create({
    data: {
      code: "ENTERPRISE",
      status: PlanStatus.ACTIVE,
      billingScheme: BillingScheme.CREDIT_BASED,
      sortOrder: 3,
      isPopular: false,
      allowPrivateTasks: true,
      translations: {
        create: getPlanTranslations("ENTERPRISE"),
      },
    },
  });

  return [basicPlan, proPlan, enterprisePlan];
}

function getPlanTranslations(planCode: string) {
  const translations = {
    BASIC: {
      zh: { nickname: "基础版", description: "适合个人用户的入门方案", subtitle: "开始您的AI之旅" },
      en: {
        nickname: "Basic",
        description: "Starter plan for individual users",
        subtitle: "Start your AI journey",
      },
      ja: {
        nickname: "ベーシック",
        description: "個人ユーザー向けスタータープラン",
        subtitle: "AIの旅を始めましょう",
      },
      ko: {
        nickname: "베이직",
        description: "개인 사용자를 위한 스타터 플랜",
        subtitle: "AI 여정을 시작하세요",
      },
      fr: {
        nickname: "Basique",
        description: "Plan de démarrage pour utilisateurs individuels",
        subtitle: "Commencez votre voyage IA",
      },
      de: {
        nickname: "Basis",
        description: "Einstiegsplan für Einzelnutzer",
        subtitle: "Starten Sie Ihre KI-Reise",
      },
      es: {
        nickname: "Básico",
        description: "Plan inicial para usuarios individuales",
        subtitle: "Comience su viaje de IA",
      },
      it: {
        nickname: "Base",
        description: "Piano iniziale per utenti individuali",
        subtitle: "Inizia il tuo viaggio AI",
      },
      pt: {
        nickname: "Básico",
        description: "Plano inicial para usuários individuais",
        subtitle: "Inicie sua jornada de IA",
      },
    },
    PRO: {
      zh: { nickname: "专业版", description: "适合专业用户的高级方案", subtitle: "提升您的AI体验" },
      en: {
        nickname: "Professional",
        description: "Advanced plan for professional users",
        subtitle: "Elevate your AI experience",
      },
      ja: {
        nickname: "プロフェッショナル",
        description: "プロユーザー向け高度なプラン",
        subtitle: "AIエクスペリエンスを向上させる",
      },
      ko: {
        nickname: "프로페셔널",
        description: "전문 사용자를 위한 고급 플랜",
        subtitle: "AI 경험을 향상시키세요",
      },
      fr: {
        nickname: "Professionnel",
        description: "Plan avancé pour utilisateurs professionnels",
        subtitle: "Élevez votre expérience IA",
      },
      de: {
        nickname: "Profi",
        description: "Erweiterter Plan für professionelle Nutzer",
        subtitle: "Verbessern Sie Ihr KI-Erlebnis",
      },
      es: {
        nickname: "Profesional",
        description: "Plan avanzado para usuarios profesionales",
        subtitle: "Eleve su experiencia de IA",
      },
      it: {
        nickname: "Professionale",
        description: "Piano avanzato per utenti professionali",
        subtitle: "Eleva la tua esperienza AI",
      },
      pt: {
        nickname: "Profissional",
        description: "Plano avançado para usuários profissionais",
        subtitle: "Eleve sua experiência de IA",
      },
    },
    ENTERPRISE: {
      zh: {
        nickname: "企业版",
        description: "适合团队和企业的全功能方案",
        subtitle: "为您的团队提供强大支持",
      },
      en: {
        nickname: "Enterprise",
        description: "Full-featured plan for teams and businesses",
        subtitle: "Powerful support for your team",
      },
      ja: {
        nickname: "エンタープライズ",
        description: "チームと企業向けの完全機能プラン",
        subtitle: "チームに強力なサポートを提供",
      },
      ko: {
        nickname: "엔터프라이즈",
        description: "팀 및 기업을 위한 모든 기능을 갖춘 플랜",
        subtitle: "팀을 위한 강력한 지원",
      },
      fr: {
        nickname: "Entreprise",
        description: "Plan complet pour équipes et entreprises",
        subtitle: "Support puissant pour votre équipe",
      },
      de: {
        nickname: "Unternehmen",
        description: "Vollständiger Plan für Teams und Unternehmen",
        subtitle: "Leistungsstarke Unterstützung für Ihr Team",
      },
      es: {
        nickname: "Empresa",
        description: "Plan completo para equipos y empresas",
        subtitle: "Soporte potente para su equipo",
      },
      it: {
        nickname: "Azienda",
        description: "Piano completo per team e aziende",
        subtitle: "Supporto potente per il tuo team",
      },
      pt: {
        nickname: "Empresarial",
        description: "Plano completo para equipes e empresas",
        subtitle: "Suporte poderoso para sua equipe",
      },
    },
  };

  const planTranslations = translations[planCode as keyof typeof translations];

  return Object.entries(planTranslations).map(([locale, data]) => ({
    locale,
    nickname: data.nickname,
    description: data.description,
    subtitle: data.subtitle,
  }));
}

async function associatePlansWithFeatures(plans: Plan[], features: Feature[]) {
  const [basicPlan, proPlan, enterprisePlan] = plans;
  const [
    creditFeature,
    prioritySupport,
    earlyAccess,
    storageSpace,
    maxProjects,
    teamMembers,
    imageGeneration,
    audioTranscription,
    codeGeneration,
    apiCalls,
  ] = features;

  // basic plan features
  await prisma.planFeatureRelation.createMany({
    data: [
      {
        planId: basicPlan.id,
        featureId: creditFeature.id,
        isPrimary: true,
        isIncluded: true,
        sortOrder: 1,
      },
      {
        planId: basicPlan.id,
        featureId: storageSpace.id,
        isPrimary: false,
        isIncluded: true,
        sortOrder: 2,
        limit: 5,
      }, // 5GB storage space
      {
        planId: basicPlan.id,
        featureId: maxProjects.id,
        isPrimary: false,
        isIncluded: true,
        sortOrder: 3,
        limit: 3,
      }, // 3 projects
      {
        planId: basicPlan.id,
        featureId: imageGeneration.id,
        isPrimary: false,
        isIncluded: true,
        sortOrder: 4,
      },
      {
        planId: basicPlan.id,
        featureId: codeGeneration.id,
        isPrimary: false,
        isIncluded: true,
        sortOrder: 5,
      },
      {
        planId: basicPlan.id,
        featureId: prioritySupport.id,
        isPrimary: false,
        isIncluded: false,
        sortOrder: 6,
      },
      {
        planId: basicPlan.id,
        featureId: earlyAccess.id,
        isPrimary: false,
        isIncluded: false,
        sortOrder: 7,
      },
      {
        planId: basicPlan.id,
        featureId: teamMembers.id,
        isPrimary: false,
        isIncluded: false,
        sortOrder: 8,
        limit: 0,
      }, // not included team members
      {
        planId: basicPlan.id,
        featureId: audioTranscription.id,
        isPrimary: false,
        isIncluded: false,
        sortOrder: 9,
      },
      {
        planId: basicPlan.id,
        featureId: apiCalls.id,
        isPrimary: false,
        isIncluded: false,
        sortOrder: 10,
      },
    ],
  });

  // professional plan features
  await prisma.planFeatureRelation.createMany({
    data: [
      {
        planId: proPlan.id,
        featureId: creditFeature.id,
        isPrimary: true,
        isIncluded: true,
        sortOrder: 1,
      },
      {
        planId: proPlan.id,
        featureId: prioritySupport.id,
        isPrimary: false,
        isIncluded: true,
        sortOrder: 2,
      },
      {
        planId: proPlan.id,
        featureId: earlyAccess.id,
        isPrimary: false,
        isIncluded: true,
        sortOrder: 3,
      },
      {
        planId: proPlan.id,
        featureId: storageSpace.id,
        isPrimary: false,
        isIncluded: true,
        sortOrder: 4,
        limit: 20,
      }, // 20GB storage space
      {
        planId: proPlan.id,
        featureId: maxProjects.id,
        isPrimary: false,
        isIncluded: true,
        sortOrder: 5,
        limit: 10,
      }, // 10 projects
      {
        planId: proPlan.id,
        featureId: imageGeneration.id,
        isPrimary: false,
        isIncluded: true,
        sortOrder: 6,
      },
      {
        planId: proPlan.id,
        featureId: codeGeneration.id,
        isPrimary: false,
        isIncluded: true,
        sortOrder: 7,
      },
      {
        planId: proPlan.id,
        featureId: audioTranscription.id,
        isPrimary: false,
        isIncluded: true,
        sortOrder: 8,
      },
      {
        planId: proPlan.id,
        featureId: teamMembers.id,
        isPrimary: false,
        isIncluded: false,
        sortOrder: 9,
        limit: 0,
      }, // Team members not included
      {
        planId: proPlan.id,
        featureId: apiCalls.id,
        isPrimary: false,
        isIncluded: false,
        sortOrder: 10,
      },
    ],
  });

  // Enterprise plan features
  await prisma.planFeatureRelation.createMany({
    data: [
      {
        planId: enterprisePlan.id,
        featureId: creditFeature.id,
        isPrimary: true,
        isIncluded: true,
        sortOrder: 1,
      },
      {
        planId: enterprisePlan.id,
        featureId: prioritySupport.id,
        isPrimary: false,
        isIncluded: true,
        sortOrder: 2,
      },
      {
        planId: enterprisePlan.id,
        featureId: earlyAccess.id,
        isPrimary: false,
        isIncluded: true,
        sortOrder: 3,
      },
      {
        planId: enterprisePlan.id,
        featureId: storageSpace.id,
        isPrimary: false,
        isIncluded: true,
        sortOrder: 4,
        limit: 100,
      }, // 100GB storage space
      {
        planId: enterprisePlan.id,
        featureId: maxProjects.id,
        isPrimary: false,
        isIncluded: true,
        sortOrder: 5,
        limit: 50,
      }, // 50 projects
      {
        planId: enterprisePlan.id,
        featureId: teamMembers.id,
        isPrimary: false,
        isIncluded: true,
        sortOrder: 6,
        limit: 10,
      }, // 10 team members
      {
        planId: enterprisePlan.id,
        featureId: imageGeneration.id,
        isPrimary: false,
        isIncluded: true,
        sortOrder: 7,
      },
      {
        planId: enterprisePlan.id,
        featureId: codeGeneration.id,
        isPrimary: false,
        isIncluded: true,
        sortOrder: 8,
      },
      {
        planId: enterprisePlan.id,
        featureId: audioTranscription.id,
        isPrimary: false,
        isIncluded: true,
        sortOrder: 9,
      },
      {
        planId: enterprisePlan.id,
        featureId: apiCalls.id,
        isPrimary: false,
        isIncluded: true,
        sortOrder: 10,
      },
    ],
  });
}

async function createPlanPeriods(plans: Plan[], features: Feature[]) {
  const [basicPlan, proPlan, enterprisePlan] = plans;
  const [, , , , , , , , , ,] = features;

  // Helper function to generate period code
  const generatePeriodCode = (
    plan: Plan,
    periodType: PeriodType,
    periodValue: number | null,
    resetPeriodType: PeriodType | null,
    resetPeriodValue: number | null
  ) => {
    let code = `PERIOD-${plan.code}-${periodType}`;
    // Only add periodValue if it exists
    if (periodValue !== null) {
      code += `-${periodValue}`;
    }

    // Only add RESET part if resetPeriodType exists
    if (resetPeriodType) {
      code += `-RESET`;
      // Add reset period type
      code += `-${resetPeriodType}`;
      // Only add reset period value if it exists
      if (resetPeriodValue !== null) {
        code += `-${resetPeriodValue}`;
      }
    }

    return code;
  };

  // Basic plan periods
  const basicPeriods = await Promise.all([
    // 7 days
    prisma.planPeriod.create({
      data: {
        planId: basicPlan.id,
        periodCode: generatePeriodCode(basicPlan, PeriodType.DAYS, 7, PeriodType.DAYS, 7),
        periodType: PeriodType.DAYS,
        periodValue: 7,
        price: 999,
        currency: Currency.USD,
        creditValue: 100,
        resetPeriodType: PeriodType.DAYS,
        resetPeriodValue: 7,
        isActive: true,
        sortOrder: 1,
      },
    }),
    // 28 days
    prisma.planPeriod.create({
      data: {
        planId: basicPlan.id,
        periodCode: generatePeriodCode(basicPlan, PeriodType.DAYS, 28, PeriodType.DAYS, 7),
        periodType: PeriodType.DAYS,
        periodValue: 28,
        price: 2999,
        currency: Currency.USD,
        creditValue: 500,
        resetPeriodType: PeriodType.DAYS,
        resetPeriodValue: 7,
        isActive: true,
        sortOrder: 2,
      },
    }),
    // 1 month
    prisma.planPeriod.create({
      data: {
        planId: basicPlan.id,
        periodCode: generatePeriodCode(basicPlan, PeriodType.MONTHS, 1, PeriodType.MONTHS, 1),
        periodType: PeriodType.MONTHS,
        periodValue: 1,
        price: 3999,
        currency: Currency.USD,
        creditValue: 700,
        resetPeriodType: PeriodType.MONTHS,
        resetPeriodValue: 1,
        isActive: true,
        sortOrder: 3,
      },
    }),
    // 1 year
    prisma.planPeriod.create({
      data: {
        planId: basicPlan.id,
        periodCode: generatePeriodCode(basicPlan, PeriodType.YEARS, 1, PeriodType.MONTHS, 1),
        periodType: PeriodType.YEARS,
        periodValue: 1,
        price: 39999,
        currency: Currency.USD,
        creditValue: 9000,
        resetPeriodType: PeriodType.MONTHS,
        resetPeriodValue: 1,
        isActive: true,
        sortOrder: 4,
      },
    }),
  ]);

  // professional plan periods
  const proPeriods = await Promise.all([
    // 7 days
    prisma.planPeriod.create({
      data: {
        planId: proPlan.id,
        periodCode: generatePeriodCode(proPlan, PeriodType.DAYS, 7, PeriodType.DAYS, 7),
        periodType: PeriodType.DAYS,
        periodValue: 7,
        price: 1999,
        currency: Currency.USD,
        creditValue: 300,
        resetPeriodType: PeriodType.DAYS,
        resetPeriodValue: 7,
        isActive: true,
        sortOrder: 1,
      },
    }),
    // 28 days
    prisma.planPeriod.create({
      data: {
        planId: proPlan.id,
        periodCode: generatePeriodCode(proPlan, PeriodType.DAYS, 28, PeriodType.DAYS, 7),
        periodType: PeriodType.DAYS,
        periodValue: 28,
        price: 5999,
        currency: Currency.USD,
        creditValue: 1500,
        resetPeriodType: PeriodType.DAYS,
        resetPeriodValue: 7,
        isActive: true,
        sortOrder: 2,
      },
    }),
    // 1 month
    prisma.planPeriod.create({
      data: {
        planId: proPlan.id,
        periodCode: generatePeriodCode(proPlan, PeriodType.MONTHS, 1, PeriodType.MONTHS, 1),
        periodType: PeriodType.MONTHS,
        periodValue: 1,
        price: 7999,
        currency: Currency.USD,
        creditValue: 2100,
        resetPeriodType: PeriodType.MONTHS,
        resetPeriodValue: 1,
        isActive: true,
        sortOrder: 3,
      },
    }),
    // 1 year
    prisma.planPeriod.create({
      data: {
        planId: proPlan.id,
        periodCode: generatePeriodCode(proPlan, PeriodType.YEARS, 1, PeriodType.MONTHS, 1),
        periodType: PeriodType.YEARS,
        periodValue: 1,
        price: 79999,
        currency: Currency.USD,
        creditValue: 27000,
        resetPeriodType: PeriodType.MONTHS,
        resetPeriodValue: 1,
        isActive: true,
        sortOrder: 4,
      },
    }),
    // One-time
    prisma.planPeriod.create({
      data: {
        planId: proPlan.id,
        periodCode: generatePeriodCode(proPlan, PeriodType.ONE_TIME, null, PeriodType.YEARS, 1),
        periodType: PeriodType.ONE_TIME,
        periodValue: null,
        price: 49999,
        currency: Currency.USD,
        creditValue: 15000,
        resetPeriodType: PeriodType.YEARS,
        resetPeriodValue: 1,
        isActive: true,
        sortOrder: 5,
      },
    }),
    // Lifetime
    prisma.planPeriod.create({
      data: {
        planId: proPlan.id,
        periodCode: generatePeriodCode(proPlan, PeriodType.LIFETIME, null, null, null),
        periodType: PeriodType.LIFETIME,
        periodValue: null,
        price: 199999,
        currency: Currency.USD,
        creditValue: 100000,
        resetPeriodType: null,
        resetPeriodValue: null,
        isActive: true,
        sortOrder: 6,
      },
    }),
  ]);

  // Enterprise plan periods
  const enterprisePeriods = await Promise.all([
    // 1 month
    prisma.planPeriod.create({
      data: {
        planId: enterprisePlan.id,
        periodCode: generatePeriodCode(enterprisePlan, PeriodType.MONTHS, 1, PeriodType.MONTHS, 1),
        periodType: PeriodType.MONTHS,
        periodValue: 1,
        price: 19999,
        currency: Currency.USD,
        creditValue: 6000,
        resetPeriodType: PeriodType.MONTHS,
        resetPeriodValue: 1,
        isActive: true,
        sortOrder: 1,
      },
    }),
    // 1 year
    prisma.planPeriod.create({
      data: {
        planId: enterprisePlan.id,
        periodCode: generatePeriodCode(enterprisePlan, PeriodType.YEARS, 1, PeriodType.MONTHS, 1),
        periodType: PeriodType.YEARS,
        periodValue: 1,
        price: 199999,
        currency: Currency.USD,
        creditValue: 75000,
        resetPeriodType: PeriodType.MONTHS,
        resetPeriodValue: 1,
        isActive: true,
        sortOrder: 2,
      },
    }),
    // One-time
    prisma.planPeriod.create({
      data: {
        planId: enterprisePlan.id,
        periodCode: generatePeriodCode(
          enterprisePlan,
          PeriodType.ONE_TIME,
          null,
          PeriodType.YEARS,
          1
        ),
        periodType: PeriodType.ONE_TIME,
        periodValue: null,
        price: 149999,
        currency: Currency.USD,
        creditValue: 50000,
        resetPeriodType: PeriodType.YEARS,
        resetPeriodValue: 1,
        isActive: true,
        sortOrder: 3,
      },
    }),
    // Lifetime
    prisma.planPeriod.create({
      data: {
        planId: enterprisePlan.id,
        periodCode: generatePeriodCode(enterprisePlan, PeriodType.LIFETIME, null, null, null),
        periodType: PeriodType.LIFETIME,
        periodValue: null,
        price: 499999,
        currency: Currency.USD,
        creditValue: 300000,
        resetPeriodType: null,
        resetPeriodValue: null,
        isActive: true,
        sortOrder: 4,
      },
    }),
  ]);

  // Create feature quotas for all periods
  const allPeriods = [...basicPeriods, ...proPeriods, ...enterprisePeriods];

  for (const period of allPeriods) {
    // Create feature quotas for each period
    await createFeatureAllocationsForPeriod(period, features);
  }
}

async function createFeatureAllocationsForPeriod(period: PlanPeriod, features: Feature[]) {
  const [creditFeature, , , , , , imageGeneration, audioTranscription, codeGeneration, apiCalls] =
    features;

  // Get plan code
  const plan = await prisma.plan.findUnique({
    where: { id: period.planId },
  });

  if (!plan) return;

  // Determine reset period type and value
  const resetPeriodType = period.resetPeriodType;
  const resetPeriodValue = period.resetPeriodValue;

  // If there's no reset period (one-time or lifetime plan), use specific quotas
  const isOneTimeOrLifetime =
    period.periodType === PeriodType.ONE_TIME || period.periodType === PeriodType.LIFETIME;

  // Image generation quota - adjusted based on reset period
  let imageGenerationAllocation = 0;
  if (plan.code === "BASIC") {
    if (isOneTimeOrLifetime) {
      imageGenerationAllocation = period.periodType === PeriodType.LIFETIME ? 1000 : 500;
    } else if (resetPeriodType === PeriodType.DAYS && resetPeriodValue === 7) {
      imageGenerationAllocation = 10;
    } else if (resetPeriodType === PeriodType.MONTHS && resetPeriodValue === 1) {
      imageGenerationAllocation = 50;
    }
  } else if (plan.code === "PRO") {
    if (isOneTimeOrLifetime) {
      imageGenerationAllocation = period.periodType === PeriodType.LIFETIME ? 10000 : 1500;
    } else if (resetPeriodType === PeriodType.DAYS && resetPeriodValue === 7) {
      imageGenerationAllocation = 30;
    } else if (resetPeriodType === PeriodType.MONTHS && resetPeriodValue === 1) {
      imageGenerationAllocation = 150;
    }
  } else if (plan.code === "ENTERPRISE") {
    if (isOneTimeOrLifetime) {
      imageGenerationAllocation = period.periodType === PeriodType.LIFETIME ? 30000 : 5000;
    } else if (resetPeriodType === PeriodType.MONTHS && resetPeriodValue === 1) {
      imageGenerationAllocation = 600;
    }
  }

  // Audio transcription quota - adjusted based on reset period
  let audioTranscriptionAllocation = 0;
  if (plan.code === "BASIC") {
    audioTranscriptionAllocation = 0; // Not included in basic plan
  } else if (plan.code === "PRO") {
    if (isOneTimeOrLifetime) {
      audioTranscriptionAllocation = period.periodType === PeriodType.LIFETIME ? 10000 : 1500;
    } else if (resetPeriodType === PeriodType.DAYS && resetPeriodValue === 7) {
      audioTranscriptionAllocation = 30;
    } else if (resetPeriodType === PeriodType.MONTHS && resetPeriodValue === 1) {
      audioTranscriptionAllocation = 150;
    }
  } else if (plan.code === "ENTERPRISE") {
    if (isOneTimeOrLifetime) {
      audioTranscriptionAllocation = period.periodType === PeriodType.LIFETIME ? 30000 : 5000;
    } else if (resetPeriodType === PeriodType.MONTHS && resetPeriodValue === 1) {
      audioTranscriptionAllocation = 600;
    }
  }

  // Code generation quota - adjusted based on reset period
  let codeGenerationAllocation = 0;
  if (plan.code === "BASIC") {
    if (isOneTimeOrLifetime) {
      codeGenerationAllocation = period.periodType === PeriodType.LIFETIME ? 2000 : 1000;
    } else if (resetPeriodType === PeriodType.DAYS && resetPeriodValue === 7) {
      codeGenerationAllocation = 20;
    } else if (resetPeriodType === PeriodType.MONTHS && resetPeriodValue === 1) {
      codeGenerationAllocation = 100;
    }
  } else if (plan.code === "PRO") {
    if (isOneTimeOrLifetime) {
      codeGenerationAllocation = period.periodType === PeriodType.LIFETIME ? 20000 : 3000;
    } else if (resetPeriodType === PeriodType.DAYS && resetPeriodValue === 7) {
      codeGenerationAllocation = 60;
    } else if (resetPeriodType === PeriodType.MONTHS && resetPeriodValue === 1) {
      codeGenerationAllocation = 300;
    }
  } else if (plan.code === "ENTERPRISE") {
    if (isOneTimeOrLifetime) {
      codeGenerationAllocation = period.periodType === PeriodType.LIFETIME ? 60000 : 10000;
    } else if (resetPeriodType === PeriodType.MONTHS && resetPeriodValue === 1) {
      codeGenerationAllocation = 1200;
    }
  }

  // API calls quota - adjusted based on reset period
  let apiCallsAllocation = 0;
  if (plan.code === "BASIC") {
    apiCallsAllocation = 0; // Not included in basic plan
  } else if (plan.code === "PRO") {
    apiCallsAllocation = 0; // Not included in professional plan
  } else if (plan.code === "ENTERPRISE") {
    if (isOneTimeOrLifetime) {
      apiCallsAllocation = period.periodType === PeriodType.LIFETIME ? 500000 : 100000;
    } else if (resetPeriodType === PeriodType.MONTHS && resetPeriodValue === 1) {
      apiCallsAllocation = 10000;
    }
  }

  // Create feature quotas - only for CONSUMABLE type features
  const allocationsData = [
    // Credits
    { planPeriodId: period.id, featureId: creditFeature.id, quantity: period.creditValue },
    // Only include consumable features
    { planPeriodId: period.id, featureId: imageGeneration.id, quantity: imageGenerationAllocation },
    {
      planPeriodId: period.id,
      featureId: audioTranscription.id,
      quantity: audioTranscriptionAllocation,
    },
    { planPeriodId: period.id, featureId: codeGeneration.id, quantity: codeGenerationAllocation },
    { planPeriodId: period.id, featureId: apiCalls.id, quantity: apiCallsAllocation },
  ];

  // Batch create feature quotas
  await prisma.planPeriodFeatureAllocation.createMany({
    data: allocationsData as Prisma.PlanPeriodFeatureAllocationCreateManyInput[],
  });
}

async function printPlanSummary() {
  console.log("\n===== Billing Plan Preview Table =====\n");

  // Get all plans
  const plans = await prisma.plan.findMany({
    include: {
      translations: {
        where: { locale: "zh" },
      },
      planPeriods: {
        orderBy: { sortOrder: "asc" },
        include: {
          featureAllocations: {
            include: {
              feature: true, // Ensure complete feature information is loaded
            },
          },
        },
      },
      planFeatures: {
        include: {
          feature: {
            include: {
              translations: {
                where: { locale: "zh" },
              },
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  console.log(JSON.stringify(plans, null, 2));
  // Print information for each plan
  for (const plan of plans) {
    const planName = plan.translations[0]?.nickname || plan.code;
    console.log(`\n## ${planName} (${plan.code})`);

    // Print plan features
    console.log("\n### Included Features:");

    // Group by feature type
    const availabilityFeatures = [];
    const allocatableFeatures = [];
    const consumableFeatures = [];

    for (const relation of plan.planFeatures) {
      if (relation.isIncluded) {
        const feature = relation.feature;
        const featureName = feature.translations[0]?.name || feature.code;
        const featureUnit = feature.translations[0]?.unit;
        const isPrimary = relation.isPrimary ? "(Primary)" : "";

        if (feature.featureType === FeatureType.AVAILABILITY) {
          availabilityFeatures.push(`- ${featureName} ${isPrimary} ✓`);
        } else if (feature.featureType === FeatureType.ALLOCATABLE) {
          const limit = relation.limit || "Unlimited";
          const unitDisplay = featureUnit ? ` ${featureUnit}` : "";
          allocatableFeatures.push(`- ${featureName} ${isPrimary} (${limit}${unitDisplay})`);
        } else if (feature.featureType === FeatureType.CONSUMABLE) {
          // Consumable features shown in period table
          consumableFeatures.push(`- ${featureName} ${isPrimary} (see table below)`);
        }
      }
    }

    // Print availability features
    if (availabilityFeatures.length > 0) {
      console.log("\n#### Availability Features:");
      availabilityFeatures.forEach((f) => console.log(f));
    }

    // Print allocatable features
    if (allocatableFeatures.length > 0) {
      console.log("\n#### Allocatable Features:");
      allocatableFeatures.forEach((f) => console.log(f));
    }

    // Print consumable features
    if (consumableFeatures.length > 0) {
      console.log("\n#### Consumable Features:");
      consumableFeatures.forEach((f) => console.log(f));
    }

    // Print plan periods and quotas
    console.log("\n### Periods and Quotas:");
    console.log(
      "| Payment Period | Price | Reset Period | Credits | Image Generation | Audio Transcription | Code Generation | API Calls |"
    );
    console.log(
      "|----------------|-------|--------------|---------|------------------|---------------------|-----------------|-----------|"
    );

    for (const period of plan.planPeriods) {
      // Format period display
      let periodDisplay = "";
      if (period.periodType === PeriodType.DAYS) {
        periodDisplay = `${period.periodValue} days`;
      } else if (period.periodType === PeriodType.MONTHS) {
        periodDisplay = `${period.periodValue} months`;
      } else if (period.periodType === PeriodType.YEARS) {
        periodDisplay = `${period.periodValue} years`;
      } else if (period.periodType === PeriodType.ONE_TIME) {
        periodDisplay = "One-time";
      } else if (period.periodType === PeriodType.LIFETIME) {
        periodDisplay = "Lifetime";
      }

      // Format reset period display
      let resetDisplay = "";
      if (period.resetPeriodType === PeriodType.DAYS) {
        resetDisplay = `${period.resetPeriodValue} days`;
      } else if (period.resetPeriodType === PeriodType.MONTHS) {
        resetDisplay = `${period.resetPeriodValue} months`;
      } else if (period.resetPeriodType === PeriodType.YEARS) {
        resetDisplay = `${period.resetPeriodValue} years`;
      } else {
        resetDisplay = "No reset";
      }

      // Get feature quotas - fix lookup logic
      const imageGenAlloc =
        period.featureAllocations.find((fa) => fa.feature.code === "IMAGE_GENERATION")?.quantity ||
        0;

      const audioAlloc =
        period.featureAllocations.find((fa) => fa.feature.code === "AUDIO_TRANSCRIPTION")
          ?.quantity || 0;

      const codeAlloc =
        period.featureAllocations.find((fa) => fa.feature.code === "CODE_GENERATION")?.quantity ||
        0;

      const apiAlloc =
        period.featureAllocations.find((fa) => fa.feature.code === "API_CALLS")?.quantity || 0;

      // Print row
      console.log(
        `| ${periodDisplay} | ${period.price}${period.currency} | ${resetDisplay} | ${period.creditValue} points | ${imageGenAlloc} times | ${audioAlloc} minutes | ${codeAlloc} times | ${apiAlloc} times |`
      );
    }
  }

  console.log("\n===== End of Preview Table =====\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
