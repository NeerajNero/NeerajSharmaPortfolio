import type { PlatformId, PlatformStats } from "@/lib/gaming/types";

export interface NavItem {
  id: string;
  label: string;
}

export interface Identity {
  displayName: string;
  legalName: string;
  /** Avatar fallback letters. */
  initials: string;
  handle: string;
  title: string;
  company: string;
  location: string;
  experienceYears: string;
  /** Status dot label on the player card. */
  status: string;
  oneLiner: string;
  email: string;
}

export interface Links {
  github: string;
  linkedin: string;
  /** Route of the HTML résumé page. */
  resume: string;
  resumePdf: string;
  sourceRepo: string;
}

export interface Role {
  title: string;
  company: string;
  start: string;
  end: string;
  location: string;
  bullets: string[];
}

export interface Education {
  degree: string;
  institution: string;
  location: string;
  start: string;
  end: string;
}

export interface SkillGroup {
  name: string;
  items: string[];
}

export interface Project {
  name: string;
  repo: string;
  tags: string[];
  blurb: string;
}

export interface SideQuests {
  /** GitHub API endpoint for the owner's repositories. */
  endpoint: string;
  /** Repo names never shown as side quests (in addition to featured + forks). */
  exclude: string[];
  /** How many to show. */
  limit: number;
  /** ISR window in seconds. */
  revalidate: number;
}

export interface PlatformLabel {
  /** Card title. */
  name: string;
  /** Label under the aggregate number. */
  aggregate: string;
}

export interface GamingConfig {
  /** Hand-filled snapshots used whenever a live adapter fails or has no key. */
  static: Record<PlatformId, PlatformStats>;
  labels: Record<PlatformId, PlatformLabel>;
  /** Cache window for every adapter, in seconds. */
  revalidate: number;
  blog: { name: string; url: string; blurb: string };
}

export type AchievementId =
  | "press-start"
  | "secret-found"
  | "completionist"
  | "background-check"
  | "speedrun";

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  /** Shown as "???" until unlocked. */
  hidden: boolean;
}

export interface BootConfig {
  /** Lines typed by the boot overlay, in order. */
  lines: string[];
}

export interface SiteConfig {
  domain: string;
  nav: NavItem[];
  boot: BootConfig;
  identity: Identity;
  links: Links;
  experience: Role[];
  education: Education[];
  skills: SkillGroup[];
  featured: Project[];
  sideQuests: SideQuests;
  gaming: GamingConfig;
  achievements: Achievement[];
  footer: { year: number; builtWith: string };
}

const SNAPSHOT_AT = "2026-10-21T07:10:56.000Z";

export const site: SiteConfig = {
  domain: "neerajnero.com",

  nav: [
    { id: "player", label: "player" },
    { id: "loadout", label: "loadout" },
    { id: "quests", label: "quests" },
    { id: "campaign", label: "campaign" },
    { id: "arcade", label: "arcade" },
    { id: "ping", label: "ping" },
  ],

  boot: {
    lines: [
      "neerajnero.com",
      "loading player profile ......... ok",
      "mounting quest log ............. ok",
      "syncing trophy case ............ ok",
      "ready",
    ],
  },

  identity: {
    displayName: "Neeraj Sharma",
    legalName: "Neeraj Kumar Sharma U",
    initials: "NN",
    handle: "NeerajNero",
    title: "Software Engineer 2",
    company: "GeekyAnts",
    location: "Bangalore",
    experienceYears: "4+ years",
    status: "online",
    oneLiner:
      "Full-stack engineer building backend systems, AI-assisted workflows in TypeScript. Off the clock, a trophy hunter on PC, PlayStation and Xbox.",
    email: "neerajnero9066@gmail.com",
  },

  links: {
    github: "https://github.com/NeerajNero",
    linkedin: "https://www.linkedin.com/in/neeraj-sharma-13610716a/",
    resume: "/resume",
    resumePdf: "/resume.pdf",
    sourceRepo: "https://github.com/NeerajNero/portfolio",
  },

  experience: [
    {
      title: "Software Engineer 2",
      company: "GeekyAnts",
      start: "Jun 2025",
      end: "Present",
      location: "Bangalore",
      bullets: [
        "News & media platform: responsive UI, API integration, feature POCs.",
        "Online dating platform: end-to-end auth/authz, Express → NestJS migration, admin panel, AI-powered text + image moderation.",
        "Healthcare workflow platform: PDF generation, email workflows, treatment-plan and clinical-notes APIs.",
        "Online learning & assessment platform: scalable backend for assessments, auth, learning modules.",
        "B2B business platform: backend workflows and API development for enterprise use cases.",
      ],
    },
    {
      title: "Software Engineer 1",
      company: "Acesoft Labs",
      start: "Sep 2021",
      end: "Jun 2023",
      location: "Bangalore",
      bullets: [
        "Responsive web interfaces in React.js, REST integration, reusable component library, cross-browser and performance work, agile delivery.",
      ],
    },
    {
      title: "Trust & Safety Analyst / Technical Support Associate",
      company: "Concentrix",
      start: "Jan 2020",
      end: "Sep 2021",
      location: "Bangalore",
      bullets: [
        "Built responsive UI screens in React.js, integrated REST APIs, bug fixes and feature work.",
      ],
    },
  ],

  education: [
    {
      degree: "BCA",
      institution: "CMR Institute of Management Studies",
      location: "Bangalore",
      start: "2016",
      end: "2019",
    },
  ],

  skills: [
    {
      name: "Frontend",
      items: [
        "React.js",
        "Next.js",
        "TypeScript",
        "JavaScript",
        "Tailwind CSS",
        "Redux Toolkit",
        "Bootstrap",
        "HTML5/CSS3",
      ],
    },
    {
      name: "Backend",
      items: [
        "Node.js",
        "NestJS",
        "Express.js",
        "REST",
        "GraphQL",
        "Socket.io",
        "BullMQ",
        "Redis",
        "JWT / OAuth",
        "PDF + email workflows",
      ],
    },
    {
      name: "Data",
      items: ["PostgreSQL", "MongoDB", "Prisma", "Drizzle", "Mongoose", "Hasura"],
    },
    {
      name: "Cloud & infra",
      items: [
        "AWS (S3, Lambda, SQS, Rekognition)",
        "Docker",
        "Docker Compose",
        "Cloudinary",
        "Linux",
      ],
    },
    {
      name: "AI",
      items: [
        "OpenAI APIs",
        "content moderation (text + image)",
        "agentic workflows",
        "AI-assisted development",
      ],
    },
    {
      name: "Practice",
      items: [
        "System design fundamentals",
        "Swagger/OpenAPI",
        "observability",
        "agile",
      ],
    },
  ],

  featured: [
    {
      name: "TinCan",
      repo: "https://github.com/NeerajNero/TinCan",
      tags: ["Next.js", "Firebase", "PWA"],
      blurb:
        "Private PWA for two long-distance friends: chat, live presence, 14 games, shared memories, and a pet you raise together.",
    },
    {
      name: "Self-Hosted Private Cloud",
      repo: "https://github.com/NeerajNero/Self-Hosted-Private-Cloud",
      tags: ["Ubuntu Server", "Mesh VPN", "NAS"],
      blurb:
        "Secure self-hosted cloud with encrypted mesh networking, remote access, network storage and media services, minimal public attack surface.",
    },
    {
      name: "Task-Flow (SimpleCRM)",
      repo: "https://github.com/NeerajNero/Task-Flow",
      tags: ["NestJS", "PostgreSQL", "BullMQ", "Docker"],
      blurb:
        "Multi-tenant CRM backend: event-driven with BullMQ, strict 4-layer architecture, full observability.",
    },
    {
      name: "Chat-App",
      repo: "https://github.com/NeerajNero/Chat-App",
      tags: ["NestJS", "WebSockets", "Prisma", "Next.js"],
      blurb: "Real-time chat with cookie auth, Google OAuth and live presence.",
    },
    {
      name: "Ganesha Chaturthi Donation Manager",
      repo: "https://github.com/NeerajNero/Ganesha-Chaturthi-Donation-Manager-2026",
      tags: ["Next.js", "Prisma", "PostgreSQL"],
      blurb:
        "Mobile-first app managing street-wise donations, expenses and community engagement for the festival.",
    },
    {
      name: "AI Content Moderation",
      repo: "https://github.com/NeerajNero/AI-Content-Moderation",
      tags: ["OpenAI", "AWS Rekognition"],
      blurb: "POC moderating text and images with a simple web UI.",
    },
    {
      name: "Yt-Downloader",
      repo: "https://github.com/NeerajNero/Yt-Downloader",
      tags: ["Python"],
      blurb:
        "Local web app for best-quality video downloads with live progress and a library view.",
    },
    {
      name: "GameTechGuides",
      repo: "https://github.com/NeerajNero/-GameTechBlog-",
      tags: ["Next.js", "Blog"],
      blurb: "Gaming and tech blog: practical guides, hardware, setups.",
    },
  ],

  sideQuests: {
    endpoint:
      "https://api.github.com/users/NeerajNero/repos?per_page=100&sort=updated",
    exclude: ["NeerajNero", "Steam-Achievements-Tracker", "NeerajSharmaPortfolio"],
    limit: 8,
    revalidate: 3600,
  },

  gaming: {
    revalidate: 3600,
    labels: {
      steam: { name: "Steam", aggregate: "Steam hours" },
      xbox: { name: "Xbox", aggregate: "Xbox gamerscore" },
      psn: { name: "PlayStation", aggregate: "PSN platinums" },
    },
    blog: {
      name: "GameTechGuides",
      url: "https://github.com/NeerajNero/-GameTechBlog-",
      blurb: "Gaming and tech blog: practical guides, hardware, setups.",
    },
    // Snapshot of the live run on 2026-10-21; shown whenever a key is missing or an API fails.
    static: {
      steam: {
        id: "steam",
        handle: "Neeraj_Nero",
        headline: [
          { label: "hours", value: "532" },
          { label: "games", value: "115" },
        ],
        recent: [
          { name: "Marvel's Spider-Man Remastered", progress: 97, hours: 44 },
          { name: "Mafia: The Old Country", progress: 48, hours: 14 },
          { name: "Mafia III: Definitive Edition", progress: 0, hours: 1 },
        ],
        source: "static",
        fetchedAt: SNAPSHOT_AT,
      },
      xbox: {
        id: "xbox",
        handle: "NeerajNero",
        headline: [
          { label: "gamerscore", value: "24,336" },
          { label: "titles", value: "108" },
          { label: "100% completions", value: "8" },
        ],
        recent: [
          { name: "Resonance: A Plague Tale Legacy", progress: 3 },
          { name: "Forza Horizon 6", progress: 17 },
          { name: "DmC Devil May Cry: Definitive Edition", progress: 9 },
          { name: "Clair Obscur: Expedition 33", progress: 28 },
          { name: "Assassin's Creed Mirage", progress: 61 },
        ],
        source: "static",
        fetchedAt: SNAPSHOT_AT,
      },
      psn: {
        id: "psn",
        // The trophy API never returns the online ID, so it is set here.
        handle: "Neeraj_Nero",
        headline: [
          { label: "level", value: "607" },
          { label: "bronze", value: "7,003" },
          { label: "silver", value: "2,927" },
          { label: "gold", value: "2,173" },
          { label: "platinum", value: "312" },
        ],
        recent: [
          { name: "Mafia III: Definitive Edition", tag: "PS5", progress: 2 },
          { name: "Asphalt Legends Unite", progress: 55 },
          { name: "Cyberpunk 2077", progress: 7 },
          { name: "The Legend of Fireball", progress: 100 },
        ],
        source: "static",
        fetchedAt: SNAPSHOT_AT,
      },
    },
  },

  achievements: [
    { id: "press-start", title: "Press start", description: "Sat through the boot sequence. Or skipped it.", hidden: false },
    { id: "secret-found", title: "Secret found", description: "Turned on CRT mode.", hidden: false },
    { id: "completionist", title: "Completionist", description: "Saw every section.", hidden: false },
    { id: "background-check", title: "Background check", description: "Opened the résumé.", hidden: false },
    { id: "speedrun", title: "Speedrun", description: "Reached the bottom within eight seconds of boot.", hidden: true },
  ],

  footer: {
    year: 2026,
    builtWith: "Next.js",
  },
};
