import { ULAANBAATAR } from "@/lib/sun";
import type { Profile } from "@/types";

export const profile: Profile = {
  name: { en: "Dulguun Battulga", mn: "Дөлгөөн Баттулга" },
  shortName: { en: "Duke", mn: "Дөки" },
  headline: {
    en: "AI engineer and blockchain developer in Ulaanbaatar.",
    mn: "Улаанбаатар дахь AI инженер, блокчейн хөгжүүлэгч.",
  },
  intro: {
    en: "I build backend and AI services for Gogo.mn at Mongol Content, and enterprise systems at MobiCom. Before that I spent two years on smart contracts and Bitcoin tooling at NumadLabs and ErchimLabs.",
    mn: "Монгол Контентод Gogo.mn-ийн backend болон AI сервисүүдийг, Мобикомд байгууллагын системүүдийг хөгжүүлдэг. Үүнээс өмнө NumadLabs, ErchimLabs-д хоёр жил ухаалаг гэрээ, Bitcoin хэрэгслүүд дээр ажилласан.",
  },
  bio: {
    en: [
      "Most of my work sits behind the page: APIs, data pipelines, search and recommendations, and lately LLM features that have to work in Mongolian first.",
      "I'm comfortable across the stack, from Solidity and Python to Next.js, and I work in Mongolian and English.",
    ],
    mn: [
      "Миний ажлын ихэнх нь дэлгэцийн ард байдаг: API, өгөгдлийн урсгал, хайлт ба зөвлөмж, мөн сүүлийн үед хамгийн түрүүнд монгол хэл дээр ажиллах ёстой LLM боломжууд.",
      "Solidity, Python-оос Next.js хүртэл stack-ийн бүх давхаргад чөлөөтэй ажиллаж, монгол болон англи хэлээр харилцдаг.",
    ],
  },
  email: "bdulguunod@gmail.com",
  phone: "+976 8087 0027",
  location: { en: "Ulaanbaatar, Mongolia", mn: "Улаанбаатар, Монгол" },
  timeZone: "Asia/Ulaanbaatar",
  coordinates: ULAANBAATAR,
  availability: null,
  resumeUrl: null,
  sourceUrl: "https://github.com/dgduksict/duke-portfolio",
  socials: [
    {
      id: "linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/dulguun-battulga-90a4a62a0",
      handle: "in/dulguun-battulga",
      icon: "linkedin",
    },
    {
      id: "github",
      label: "GitHub",
      href: "https://github.com/dgduksict",
      handle: "@dgduksict",
      icon: "github",
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
};
