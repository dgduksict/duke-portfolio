import type { Project } from "@/types";

/**
 * Written from each repo's README and kept high level. `stages` drive the
 * pipeline diagram, in order. Add `outcomes` or `metrics` only with real numbers.
 */
export const projects: readonly Project[] = [
  {
    id: "gogo",
    name: { en: "Gogo.mn", mn: "Gogo.mn" },
    year: 2026,
    roleId: "mongol-content",
    tagline: {
      en: "A Mongolian news portal: the site, its API, and the AI services around them.",
      mn: "Монголын мэдээллийн портал: сайт, түүний API, эргэн тойрны AI сервисүүд.",
    },
    description: {
      en: "A Next.js front end over a NestJS REST API on MySQL and Redis, with sign-in through Google, Facebook and Apple. Python services beside it handle semantic search and article recommendations, using OpenAI embeddings stored in Qdrant.",
      mn: "MySQL, Redis дээр ажилладаг NestJS REST API-тай, Google, Facebook, Apple-ээр нэвтэрдэг Next.js frontend. Хажууд нь Python сервисүүд Qdrant-д хадгалсан OpenAI embedding ашиглан утгын хайлт, нийтлэлийн зөвлөмжийг хариуцдаг.",
    },
    part: {
      en: "Full-stack: the Next.js site, the NestJS API, and the search and recommendation services.",
      mn: "Full-stack: Next.js сайт, NestJS API, хайлт болон зөвлөмжийн сервисүүд.",
    },
    stages: [
      { id: "cms", label: { en: "Newsroom CMS", mn: "Редакцын CMS" } },
      {
        id: "api",
        label: { en: "NestJS API", mn: "NestJS API" },
        detail: { en: "MySQL and Redis", mn: "MySQL, Redis" },
      },
      {
        id: "search",
        label: { en: "Search and recommendations", mn: "Хайлт, зөвлөмж" },
        detail: { en: "Embeddings in Qdrant", mn: "Qdrant дахь embedding" },
      },
      { id: "web", label: { en: "Next.js site", mn: "Next.js сайт" } },
      { id: "readers", label: { en: "Readers", mn: "Уншигчид" } },
    ],
    stack: [
      "Next.js",
      "TypeScript",
      "NestJS",
      "TypeORM",
      "MySQL",
      "Redis",
      "Python",
      "FastAPI",
      "OpenAI",
      "Qdrant",
    ],
    links: [{ kind: "live", href: "https://gogo.mn" }],
  },
  {
    id: "newsletter",
    name: { en: "Gogo newsletter", mn: "Gogo товхимол" },
    year: 2026,
    roleId: "mongol-content",
    tagline: {
      en: "Personal news digests for Gogo readers, ranked per reader and summarised by an LLM.",
      mn: "Gogo-гийн уншигч бүрт тохируулан эрэмбэлж, LLM-ээр хураангуйлсан мэдээний товхимол.",
    },
    description: {
      en: "Readers choose a daily or weekly cadence. For each of them, new articles are ranked by an interest vector in Qdrant, recency and popularity; an LLM writes the summaries, and the issue is rendered from MJML and sent through Mailgun. Editors can also send curated trend issues, with the LLM drafting subject lines, intros and blurbs. Mongolian first, English optional.",
      mn: "Уншигч өдөр бүр эсвэл долоо хоног бүр авахаа сонгоно. Уншигч бүрийн хувьд шинэ нийтлэлүүдийг Qdrant дахь сонирхлын вектор, шинэлэг байдал, уншилтаар эрэмбэлж, LLM хураангуйг бичээд, MJML загвараар бэлдэж Mailgun-аар илгээнэ. Редакторууд мөн онцлох сэдвийн дугаар илгээж болох бөгөөд гарчиг, оршил, товч тайлбарын ноорогийг LLM гаргадаг. Үндсэн хэл нь монгол, англи нь сонголтоор.",
    },
    part: {
      en: "Backend and AI: the FastAPI service, the ranking, the LLM layer and delivery.",
      mn: "Backend ба AI: FastAPI сервис, эрэмбэлэлт, LLM давхарга, илгээлт.",
    },
    stages: [
      { id: "articles", label: { en: "New articles", mn: "Шинэ нийтлэл" } },
      {
        id: "rank",
        label: { en: "Rank per reader", mn: "Уншигч бүрт эрэмбэлэх" },
        detail: { en: "Interests, recency, popularity", mn: "Сонирхол, шинэлэг байдал, уншилт" },
      },
      { id: "summarise", label: { en: "LLM summaries", mn: "LLM хураангуй" } },
      {
        id: "send",
        label: { en: "Send", mn: "Илгээх" },
        detail: { en: "MJML through Mailgun", mn: "MJML, Mailgun" },
      },
      { id: "inbox", label: { en: "Inbox", mn: "Шуудан" } },
    ],
    stack: ["Python", "FastAPI", "SQLAlchemy", "MySQL", "Qdrant", "OpenAI"],
    links: [],
  },
  {
    id: "article-monitor",
    name: { en: "Article similarity monitor", mn: "Нийтлэлийн төстэй байдлын хяналт" },
    year: 2026,
    roleId: "mongol-content",
    tagline: {
      en: "Scores how closely a Gogo story matches coverage on other Mongolian news sites.",
      mn: "Gogo-гийн нийтлэл бусад монгол мэдээний сайтын нийтлэлтэй хэр төстэйг үнэлдэг.",
    },
    description: {
      en: "A crawler collects articles from other news sites into MySQL and indexes their embeddings in Qdrant. For a Gogo article, the hundred or so nearest candidates from the same sources and dates are re-ranked on meaning, character-level keywords and the title, giving a score from 0 to 100. Scoring is deterministic, with no LLM in the loop, and a high score means two articles are alike, not that one copied the other.",
      mn: "Crawler бусад мэдээний сайтын нийтлэлийг MySQL-д цуглуулж, embedding-ийг нь Qdrant-д индексжүүлдэг. Gogo-гийн нийтлэл бүрийн хувьд тухайн эх сурвалж, огнооны хамгийн ойр зуу орчим нийтлэлийг утга, тэмдэгтийн түвшний түлхүүр үг, гарчгаар нь дахин эрэмбэлж 0-ээс 100 хүртэл оноо гаргана. Үнэлгээ тогтсон дүрмээр явагддаг, LLM оролцдоггүй бөгөөд өндөр оноо нь хоёр нийтлэл төстэй гэсэн үг болохоос хуулсан гэсэн үг биш.",
    },
    part: {
      en: "Designed and built the crawler, the vector index and the scoring.",
      mn: "Crawler, вектор индекс, үнэлгээг зохион бүтээж хийсэн.",
    },
    stages: [
      { id: "crawl", label: { en: "Crawl news sites", mn: "Мэдээний сайт цуглуулах" } },
      {
        id: "index",
        label: { en: "Embed and index", mn: "Embedding, индекс" },
        detail: { en: "MySQL and Qdrant", mn: "MySQL, Qdrant" },
      },
      {
        id: "candidates",
        label: { en: "Nearest candidates", mn: "Ойр нийтлэлүүд" },
        detail: { en: "Same sources and dates", mn: "Ижил эх сурвалж, огноо" },
      },
      {
        id: "rerank",
        label: { en: "Re-rank", mn: "Дахин эрэмбэлэх" },
        detail: { en: "Meaning, keywords, title", mn: "Утга, түлхүүр үг, гарчиг" },
      },
      { id: "score", label: { en: "Score 0–100", mn: "0–100 оноо" } },
    ],
    stack: ["Python", "FastAPI", "MySQL", "Qdrant", "OpenAI", "scikit-learn"],
    links: [],
  },
  {
    id: "sonsy-tickets",
    name: { en: "Sonsy tickets", mn: "Sonsy тасалбар" },
    year: 2026,
    roleId: "mongol-content",
    tagline: {
      en: "Event ticketing for the Sonsy music platform, moved into its own app.",
      mn: "Sonsy хөгжмийн платформын арга хэмжээний тасалбарыг тусдаа апп болгон салгасан.",
    },
    description: {
      en: "Ticketing used to live inside the main Sonsy web app. It now runs as its own Next.js site at tickets.sonsy.mn, so changing it can't touch the Premium subscription flow that funds the platform. Visitors browse events, pay through the amsys API and get a QR ticket. Premium Duo members claim ticket vouchers through a hand-off between sonsy.mn and the ticket site, and the old event links redirect, so nothing already published breaks.",
      mn: "Тасалбарын урсгал өмнө нь Sonsy-гийн үндсэн веб апп дотор байсан. Одоо tickets.sonsy.mn дээр тусдаа Next.js сайт болж ажилладаг тул өөрчлөлт нь платформын орлого бүрдүүлдэг Premium захиалгын урсгалд хүрэхгүй. Хэрэглэгч арга хэмжээ үзэж, amsys API-аар төлбөрөө төлөөд QR тасалбар авна. Premium Duo гишүүд sonsy.mn болон тасалбарын сайтын хооронд дамжин ваучер авдаг бөгөөд хуучин холбоосууд шинэ хаяг руу шилждэг тул нийтлэгдсэн линк эвдрэхгүй.",
    },
    part: {
      en: "Split the ticket flow out of the main app and built the new site.",
      mn: "Тасалбарын урсгалыг үндсэн аппаас салгаж, шинэ сайтыг бүтээсэн.",
    },
    stages: [
      { id: "events", label: { en: "Event page", mn: "Арга хэмжээ" } },
      {
        id: "checkout",
        label: { en: "Checkout", mn: "Захиалга" },
        detail: { en: "amsys API", mn: "amsys API" },
      },
      { id: "payment", label: { en: "Payment", mn: "Төлбөр" } },
      { id: "ticket", label: { en: "QR ticket", mn: "QR тасалбар" } },
    ],
    stack: ["Next.js", "TypeScript", "React", "Tailwind CSS"],
    links: [{ kind: "live", href: "https://tickets.sonsy.mn" }],
  },
];
