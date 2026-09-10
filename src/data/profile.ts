import type { Profile } from "@/types";

export const profile: Profile = {
  name: { en: "Dulguun Battulga", mn: "Дөлгөөн Баттулга" },
  shortName: { en: "Duke", mn: "Дөки" },
  role: {
    en: "AI Engineer & Blockchain Developer",
    mn: "Хиймэл оюуны инженер & Блокчейн хөгжүүлэгч",
  },
  roleRotation: {
    en: ["AI Engineer", "Blockchain Developer", "Backend Architect", "Automation Builder"],
    mn: ["Хиймэл оюуны инженер", "Блокчейн хөгжүүлэгч", "Backend архитектор", "Автоматжуулалт бүтээгч"],
  },
  tagline: {
    en: "I build intelligent systems where machine learning, distributed ledgers and hard backend engineering meet — and I ship them to production.",
    mn: "Машин сургалт, блокчейн болон backend инженерчлэлийн уулзварт ухаалаг системүүд бүтээж, продакшнд гаргадаг.",
  },
  bio: {
    en: [
      "I am a full-stack engineer from Ulaanbaatar who spends most of his time on the two hardest parts of a product: the data layer and the intelligence on top of it.",
      "Over the last few years I have shipped news platforms serving millions of monthly readers, smart contracts holding real value, and AI pipelines that quietly remove hours of manual work every week.",
      "I care about systems that stay understandable at 3 a.m. — strong typing, boring deployments, honest observability and tests that actually catch things.",
    ],
    mn: [
      "Би Улаанбаатар хотод ажилладаг full-stack инженер бөгөөд бүтээгдэхүүний хамгийн хэцүү хоёр хэсэг болох дата давхарга, түүн дээрх ухаалаг системд гол цагаа зарцуулдаг.",
      "Сүүлийн жилүүдэд сая сая уншигчтай мэдээллийн платформ, бодит үнэ цэн хадгалдаг ухаалаг гэрээ, долоо хоног бүр олон цагийн гар ажиллагааг хэмнэдэг AI системүүдийг продакшнд гаргасан.",
      "Шөнө дунд ч ойлгомжтой хэвээр байдаг системийг эрхэмлэдэг: хатуу типтэй код, уйтгартай найдвартай deploy, шударга мониторинг, үнэхээр алдаа барьдаг тестүүд.",
    ],
  },
  email: "bdulguunod@gmail.com",
  phone: "+976 8087 0027",
  location: { en: "Ulaanbaatar, Mongolia", mn: "Улаанбаатар, Монгол" },
  timezone: "UTC+08:00",
  availability: {
    en: "Available for select contracts",
    mn: "Сонгосон төслүүдэд бэлэн",
  },
  availableFrom: "2026-10-01",
  yearsExperience: 6,
  socials: [
    {
      id: "github",
      label: "GitHub",
      href: "https://github.com/dgduksict",
      handle: "@dgduksict",
      icon: "github",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/dulguun-battulga-90a4a62a0",
      handle: "in/dulguun-battulga",
      icon: "linkedin",
    },
    {
      id: "instagram",
      label: "Instagram",
      href: "https://www.instagram.com/dlgn_dg",
      handle: "@dlgn_dg",
      icon: "instagram",
    },
    {
      id: "facebook",
      label: "Facebook",
      href: "https://www.facebook.com/dulguun.battulga.353586",
      handle: "dulguun.battulga",
      icon: "facebook",
    },
  ],
  focusAreas: [
    {
      id: "ai",
      icon: "brain",
      title: { en: "Applied AI", mn: "Хэрэглээний AI" },
      description: {
        en: "Retrieval pipelines, model serving and evaluation harnesses that survive real traffic.",
        mn: "Бодит ачааллыг даах retrieval систем, загвар нийлүүлэлт, үнэлгээний хэрэгслүүд.",
      },
    },
    {
      id: "blockchain",
      icon: "blocks",
      title: { en: "Web3 Engineering", mn: "Web3 инженерчлэл" },
      description: {
        en: "Solidity contracts, Bitcoin tooling and indexers built with audit-first discipline.",
        mn: "Аудитыг эхэнд тавьсан Solidity гэрээ, Bitcoin хэрэгсэл, индексер.",
      },
    },
    {
      id: "backend",
      icon: "server",
      title: { en: "Backend Systems", mn: "Backend системүүд" },
      description: {
        en: "Typed APIs, queue-driven workloads and Postgres schemas that scale past the demo.",
        mn: "Типтэй API, дараалалд суурилсан ачаалал, өргөжих чадвартай Postgres схем.",
      },
    },
    {
      id: "automation",
      icon: "sparkles",
      title: { en: "Automation", mn: "Автоматжуулалт" },
      description: {
        en: "Editorial, ops and reporting workflows replaced by pipelines nobody has to babysit.",
        mn: "Редакц, үйл ажиллагаа, тайлангийн ажлыг хүний оролцоогүй урсгал болгон хувиргах.",
      },
    },
  ],
};
