export const translations = {
  en: {
    myInfo: {
      fullName: "Dulguun Battulga",
      shortName: "Duke",
      email: "bdulguunod@gmail.com",
      linkedInUrl: "https://www.linkedin.com/in/dulguun-battulga-90a4a62a0",
      facebookUrl: "https://www.facebook.com/dulguun.battulga.353586",
      instagramUrl: "https://www.instagram.com/dlgn_dg",
      githubUrl: "https://github.com/dgduksict",
    },
    nav: {
      about: "About",
      skills: "Skills",
      experience: "Experience",
      projects: "Projects",
      contact: "Contact",
    },
    hero: {
      greeting: "Hello, I'm",
      title: "AI Engineer & Blockchain Developer",
      subtitle:
        "Crafting intelligent solutions at the intersection of artificial intelligence and decentralized technology",
      cta: "View My Work",
    },
    about: {
      title: "About Me",
      description:
        "I'm a passionate AI Engineer with expertise in backend development and blockchain technology. I specialize in building scalable AI systems and decentralized applications that push the boundaries of what's possible.",
      specializations: "My Specializations",
    },
    skills: {
      title: "Technical Skills",
      ai: "AI & Machine Learning",
      blockchain: "Blockchain Development",
      backend: "Backend Engineering",
      tools: "Tools & Frameworks",
    },
    experience: {
      title: "Professional Experience",
    },
    projects: {
      title: "Featured Projects",
      viewProject: "View Project",
      viewCode: "View Code",
    },
    contact: {
      title: "Let's Connect",
      subtitle: "Ready to collaborate on your next AI or blockchain project?",
      name: "Name",
      email: "Email",
      message: "Message",
      send: "Send Message",
    },
  },
  mn: {
  myInfo: {
      fullName: "Дөлгөөн Баттулга",
      shortName: "Дөки",
      email: "bdulguunod@gmail.com",
      linkedInUrl: "https://www.linkedin.com/in/dulguun-battulga-90a4a62a0",
      facebookUrl: "https://www.facebook.com/dulguun.battulga.353586",
      instagramUrl: "https://www.instagram.com/dlgn_dg",
      githubUrl: "https://github.com/dgduksict",
    },
    nav: {
      about: "Миний тухай",
      skills: "Чадвар",
      experience: "Туршлага",
      projects: "Төслүүд",
      contact: "Холбоо барих",
    },
    hero: {
      greeting: "Сайн байна уу, би",
      title: "Хиймэл Оюун Ухаан & Блокчейн Хөгжүүлэгч",
      subtitle: "Хиймэл оюун ухаан болон блокчейн технологийн уулзварт ухаалаг шийдлүүд бүтээдэг",
      cta: "Миний ажлыг үзэх",
    },
    about: {
      title: "Миний тухай",
      description:
        "Би backend хөгжүүлэлт болон блокчейн технологид мэргэшсэн хиймэл оюун ухааны инженер юм. Боломжийн хилийг давсан өргөжүүлэх боломжтой AI систем болон төвлөрсөн бус аппликейшнүүд бүтээхэд мэргэшсэн.",
      specializations: "Миний мэргэшлүүд",
    },
    skills: {
      title: "Техникийн чадвар",
      ai: "Хиймэл оюун ухаан & Машин сургалт",
      blockchain: "Блокчейн хөгжүүлэлт",
      backend: "Backend инженерчлэл",
      tools: "Хэрэгслүүд & Фреймворкүүд",
    },
    experience: {
      title: "Мэргэжлийн туршлага",
    },
    projects: {
      title: "Онцлох төслүүд",
      viewProject: "Төслийг үзэх",
      viewCode: "Кодыг үзэх",
    },
    contact: {
      title: "Холбогдоцгооё",
      subtitle: "Таны дараагийн AI эсвэл блокчейн төсөлд хамтран ажиллахад бэлэн үү?",
      name: "Нэр",
      email: "И-мэйл",
      message: "Мессеж",
      send: "Мессеж илгээх",
    },
  },
}

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.en
