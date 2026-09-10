import type { Project } from "@/types";

export const projects: readonly Project[] = [
  {
    id: "gogo",
    slug: "gogo-media-platform",
    title: "Gogo.mn",
    category: "platform",
    year: 2026,
    featured: true,
    tagline: {
      en: "A national news platform, rebuilt for speed and recommendations.",
      mn: "Үндэсний хэмжээний мэдээллийн платформыг хурд, зөвлөмжийн системтэйгээр дахин бүтээв.",
    },
    description: {
      en: "A high-traffic media platform where editorial tooling, delivery and personalisation share one typed backend. Reader-facing pages are streamed as server components, while a NestJS service handles ranking, personalisation and the editorial API.",
      mn: "Редакцын хэрэгсэл, контент хүргэлт, хувийн зөвлөмж нэг типтэй backend дээр ажилладаг өндөр ачаалалтай медиа платформ. Уншигчийн хуудсууд server component-ээр дамжуулагдаж, NestJS сервис нь эрэмбэлэлт, хувьчлал, редакцын API-г хариуцна.",
    },
    role: {
      en: "Full-stack engineer — delivery layer, recommendation service, editorial API",
      mn: "Full-stack инженер — хүргэлтийн давхарга, зөвлөмжийн сервис, редакцын API",
    },
    outcomes: {
      en: [
        "Cut median article load time from 2.4s to 0.7s by streaming server components.",
        "Recommendation rail lifted articles-per-session by 31% in the first quarter.",
        "Editorial publishing moved from six manual steps to a single reviewed action.",
      ],
      mn: [
        "Server component-ийн урсгал дамжуулалтаар нийтлэлийн ачаалах хугацааг 2.4с-аас 0.7с болгов.",
        "Зөвлөмжийн систем эхний улиралд сешн бүрийн уншсан нийтлэлийг 31%-иар нэмэгдүүлэв.",
        "Нийтлэх процессыг зургаан гар алхмаас нэг хянагдсан үйлдэл болгов.",
      ],
    },
    stack: ["Next.js", "NestJS", "Laravel", "PostgreSQL", "Redis", "Docker"],
    metrics: [
      { id: "readers", label: { en: "Monthly readers", mn: "Сарын уншигч" }, value: 2.4, suffix: "M", decimals: 1 },
      { id: "p95", label: { en: "p95 response", mn: "p95 хариу" }, value: 180, suffix: "ms", decimals: 0 },
      { id: "uptime", label: { en: "Uptime", mn: "Тасралтгүй ажиллагаа" }, value: 99.95, suffix: "%", decimals: 2 },
    ],
    image: "/defi-dashboard-interface.jpg",
    accent: "#34d399",
    demoUrl: "https://gogo.mn",
    repoUrl: null,
  },
  {
    id: "sonsy",
    slug: "sonsy-audio",
    title: "Sonsy.mn",
    category: "fullstack",
    year: 2026,
    featured: true,
    tagline: {
      en: "Audio-first publishing with generated narration for every article.",
      mn: "Нийтлэл бүрийг хиймэл дуу оруулалттай болгосон аудио платформ.",
    },
    description: {
      en: "A listening platform for Mongolian long-form content. Articles are converted to narrated audio through a scheduled pipeline, chunked for streaming, and served with resumable playback state per listener.",
      mn: "Монгол хэлний урт хэлбэрийн контентод зориулсан сонсох платформ. Нийтлэлүүд төлөвлөгөөт урсгалаар яриа болон хөрвөж, хэсэглэн дамжуулагдаж, сонсогч бүрийн үргэлжлүүлэх төлөвтэйгээр хүргэгдэнэ.",
    },
    role: {
      en: "Full-stack engineer — pipeline, playback API, web client",
      mn: "Full-stack инженер — урсгал, тоглуулалтын API, веб клиент",
    },
    outcomes: {
      en: [
        "Narration pipeline processes a full day of publishing in under nine minutes.",
        "Resumable playback state syncs across devices without a login wall.",
        "Storage costs held flat while the catalogue tripled, via chunk deduplication.",
      ],
      mn: [
        "Дуу оруулах урсгал өдрийн бүх нийтлэлийг есөн минутын дотор боловсруулна.",
        "Нэвтрэлт шаардахгүйгээр төхөөрөмж хооронд үргэлжлүүлэх төлөв синк хийгдэнэ.",
        "Хэсгийн давхардал арилгаснаар каталог гурав дахин өссөн ч хадгалалтын зардал тогтвортой.",
      ],
    },
    stack: ["Next.js", "NestJS", "Python", "PostgreSQL", "Redis", "AWS"],
    metrics: [
      { id: "hours", label: { en: "Audio hours", mn: "Аудио цаг" }, value: 12.6, suffix: "k", decimals: 1 },
      { id: "latency", label: { en: "Time to first byte", mn: "Эхний байт хүртэл" }, value: 240, suffix: "ms", decimals: 0 },
      { id: "completion", label: { en: "Completion rate", mn: "Сонсож дуусгалт" }, value: 68, suffix: "%", decimals: 0 },
    ],
    image: "/trading-bot-dashboard.png",
    accent: "#22d3ee",
    demoUrl: "https://sonsy.mn",
    repoUrl: null,
  },
  {
    id: "newsletter",
    slug: "newsletter-delivery-engine",
    title: "Newsletter Engine",
    category: "ai",
    year: 2026,
    featured: true,
    tagline: {
      en: "Editorial newsletters assembled, personalised and sent without a human in the loop.",
      mn: "Хүний оролцоогүйгээр эмхэтгэж, хувьчилж, илгээдэг мэдээллийн товхимлын систем.",
    },
    description: {
      en: "A FastAPI service that assembles daily digests from the newsroom feed. Candidate articles are embedded, clustered to remove near-duplicates, ranked per subscriber segment, then handed to an idempotent send worker with per-recipient tracking.",
      mn: "Редакцын урсгалаас өдөр тутмын товхимол угсардаг FastAPI сервис. Нийтлэлүүдийг embedding болгож, ойролцоо давхардлыг кластераар цэвэрлэж, захиалагчийн бүлэг тус бүрээр эрэмбэлээд, давхардалгүй илгээх worker руу дамжуулна.",
    },
    role: {
      en: "Backend & ML engineer — embeddings, ranking, delivery worker",
      mn: "Backend & ML инженер — embedding, эрэмбэлэлт, илгээх worker",
    },
    outcomes: {
      en: [
        "Duplicate stories in a digest dropped from roughly one in five to under one in fifty.",
        "The send worker is idempotent by message key — zero duplicate emails since launch.",
        "Editors spend around four hours less per week assembling issues.",
      ],
      mn: [
        "Нэг товхимол доторх давхардсан мэдээ тав тутмын нэгээс тавь тутмын нэгээс доош буурав.",
        "Илгээх worker нь message key-ээр давхардалгүй — нэвтрүүлснээс хойш давхар и-мэйл гараагүй.",
        "Редакторууд долоо хоногт ойролцоогоор дөрвөн цагийг хэмнэж байна.",
      ],
    },
    stack: ["FastAPI", "Python", "pgvector", "PostgreSQL", "Redis", "Docker"],
    metrics: [
      { id: "sends", label: { en: "Emails / month", mn: "Сарын и-мэйл" }, value: 860, suffix: "k", decimals: 0 },
      { id: "dedupe", label: { en: "Duplicate rate", mn: "Давхардлын хувь" }, value: 1.8, suffix: "%", decimals: 1 },
      { id: "open", label: { en: "Open rate", mn: "Нээлтийн хувь" }, value: 42, suffix: "%", decimals: 0 },
    ],
    image: "/nft-marketplace-interface.png",
    accent: "#a78bfa",
    demoUrl: null,
    repoUrl: "https://github.com/dgduksict",
  },
  {
    id: "article-monitor",
    slug: "article-monitor",
    title: "Article Monitor",
    category: "ai",
    year: 2025,
    featured: false,
    tagline: {
      en: "Wire-feed watchdog that classifies, tags and flags stories in near real time.",
      mn: "Мэдээний урсгалыг бараг шууд ангилж, шошголж, анхааруулдаг хяналтын систем.",
    },
    description: {
      en: "A monitoring service that polls dozens of sources, normalises the payloads, classifies topic and tone, and raises alerts when coverage of a tracked entity spikes. Results land in a Postgres store the newsroom queries directly.",
      mn: "Олон эх сурвалжийг тогтмол шалгаж, өгөгдлийг нэгтгэж, сэдэв, өнгө аясыг ангилж, тодорхой сэдвийн мэдээ огцом нэмэгдвэл анхааруулга өгдөг систем. Үр дүн нь редакц шууд асуудаг Postgres санд хадгалагдана.",
    },
    role: {
      en: "ML engineer — ingestion, classification, alerting",
      mn: "ML инженер — өгөгдөл цуглуулалт, ангилал, анхааруулга",
    },
    outcomes: {
      en: [
        "The topic classifier holds 0.91 macro F1 on the held-out newsroom set.",
        "Latency from publication to newsroom notification stays under 90 seconds.",
        "Source adapters are declarative, so a new feed takes minutes rather than a deploy cycle.",
      ],
      mn: [
        "Сэдвийн ангилагч тусгаарласан өгөгдөл дээр 0.91 macro F1 үзүүлж байна.",
        "Нийтлэгдсэнээс редакц мэдэгдэл авах хүртэлх хугацаа 90 секундээс бага.",
        "Эх сурвалжийн адаптер декларатив тул шинэ урсгал нэмэхэд deploy шаардлагагүй.",
      ],
    },
    stack: ["Python", "Hugging Face", "FastAPI", "PostgreSQL", "Grafana"],
    metrics: [
      { id: "sources", label: { en: "Tracked sources", mn: "Хянадаг эх сурвалж" }, value: 74, suffix: "", decimals: 0 },
      { id: "f1", label: { en: "Macro F1", mn: "Macro F1" }, value: 0.91, suffix: "", decimals: 2 },
      { id: "alert", label: { en: "Alert latency", mn: "Анхааруулгын хугацаа" }, value: 87, suffix: "s", decimals: 0 },
    ],
    image: "/blockchain-analytics-dashboard.png",
    accent: "#f59e0b",
    demoUrl: null,
    repoUrl: "https://github.com/dgduksict",
  },
  {
    id: "yield-optimizer",
    slug: "defi-yield-optimizer",
    title: "Yield Optimizer",
    category: "blockchain",
    year: 2025,
    featured: false,
    tagline: {
      en: "A vault strategy router that rebalances on measured risk, not vibes.",
      mn: "Хэмжсэн эрсдэлд тулгуурлан дахин тэнцвэржүүлдэг vault стратегийн систем.",
    },
    description: {
      en: "An ERC-4626 vault with a strategy router and an off-chain scorer. The scorer ranks pools on realised volatility, depth and incentive decay; the router only rebalances when the projected gain clears gas plus a safety margin.",
      mn: "ERC-4626 vault, стратегийн router болон off-chain үнэлгээний системээс бүрдэнэ. Үнэлгээ нь пулуудыг хэлбэлзэл, гүн, урамшууллын бууралтаар эрэмбэлж, router нь хүлээгдэж буй өгөөж gas болон аюулгүйн зөрүүг давсан үед л дахин тэнцвэржүүлнэ.",
    },
    role: {
      en: "Smart contract & backend engineer — vault, router, scorer",
      mn: "Ухаалаг гэрээ & backend инженер — vault, router, үнэлгээ",
    },
    outcomes: {
      en: [
        "Rebalance frequency fell 62% while net yield stayed within 0.4% of the naive strategy.",
        "The full invariant suite runs against a forked mainnet on every pull request.",
        "The emergency withdraw path is exercised in CI, not just documented.",
      ],
      mn: [
        "Дахин тэнцвэржүүлэлтийн давтамж 62% буурсан ч цэвэр өгөөж энгийн стратегиас 0.4%-ийн дотор хэвээр.",
        "Pull request бүрт fork хийсэн mainnet дээр invariant тестүүд бүрэн ажиллана.",
        "Яаралтай татан авах зам зөвхөн баримтжуулагдсан биш, CI дээр шалгагддаг.",
      ],
    },
    stack: ["Solidity", "Foundry", "Hardhat", "viem", "Python", "PostgreSQL"],
    metrics: [
      { id: "tvl", label: { en: "Peak TVL", mn: "Дээд TVL" }, value: 3.2, suffix: "M", decimals: 1 },
      { id: "gas", label: { en: "Gas saved", mn: "Хэмнэсэн gas" }, value: 62, suffix: "%", decimals: 0 },
      { id: "coverage", label: { en: "Contract coverage", mn: "Гэрээний тест хамралт" }, value: 96, suffix: "%", decimals: 0 },
    ],
    image: "/abstract-blockchain-network.png",
    accent: "#f472b6",
    demoUrl: null,
    repoUrl: "https://github.com/dgduksict",
  },
  {
    id: "chain-explorer",
    slug: "chain-analytics",
    title: "Chain Analytics",
    category: "blockchain",
    year: 2024,
    featured: false,
    tagline: {
      en: "An indexer and query layer that makes on-chain data feel like SQL.",
      mn: "On-chain өгөгдлийг SQL шиг болгодог индексер, асуулгын давхарга.",
    },
    description: {
      en: "A block indexer with reorg-safe writes, plus a GraphQL layer over materialised views. Wallet clustering and flow tracing run as nightly jobs so the interactive queries stay fast.",
      mn: "Reorg-д тэсвэртэй бичилттэй блок индексер, materialised view дээрх GraphQL давхарга. Түрийвчний кластерчлал, урсгалын мөшгилт шөнийн ажлаар гүйж, интерактив асуулга хурдан хэвээр байдаг.",
    },
    role: {
      en: "Backend engineer — indexer, schema design, GraphQL layer",
      mn: "Backend инженер — индексер, схемийн загвар, GraphQL давхарга",
    },
    outcomes: {
      en: [
        "Reorg handling is idempotent — replays converge to the same state every time.",
        "Materialised views keep p95 dashboard queries under 300ms at 40M rows.",
        "A two-year historical backfill completes in a single overnight run.",
      ],
      mn: [
        "Reorg боловсруулалт давхардалгүй — дахин тоглуулалт үргэлж ижил төлөвт хүрнэ.",
        "Materialised view нь 40 сая мөр дээр p95 асуулгыг 300мс-ээс доош барина.",
        "Хоёр жилийн түүхийг нэг шөнийн ажлаар бүрэн буцаан индекслэнэ.",
      ],
    },
    stack: ["Node.js", "TypeScript", "PostgreSQL", "Redis", "Docker", "Grafana"],
    metrics: [
      { id: "rows", label: { en: "Indexed rows", mn: "Индексэлсэн мөр" }, value: 41, suffix: "M", decimals: 0 },
      { id: "query", label: { en: "p95 query", mn: "p95 асуулга" }, value: 290, suffix: "ms", decimals: 0 },
      { id: "lag", label: { en: "Head lag", mn: "Хоцролт" }, value: 2.1, suffix: "s", decimals: 1 },
    ],
    image: "/blockchain-analytics-dashboard.png",
    accent: "#60a5fa",
    demoUrl: null,
    repoUrl: "https://github.com/dgduksict",
  },
];
