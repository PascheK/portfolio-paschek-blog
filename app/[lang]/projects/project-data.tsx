
import { Project } from "@/types/project";
export const projects: Project[] = [
  {
    title: "Mithril AI",
    year: 2024,
    description: "Open science AI research lab",
    url: "https://github.com/mithrilai",
    category: ["AI", "Open Source"],
    image: "/photos/photo1.jpg",
    mdxFile: "mithril-ai.mdx",
    slug: "mithril-ai",
  },
  {
    title: "OpenDeepLearning",
    year: 2023,
    description: "Open source AI education resources",
    url: "https://opendeeplearning.xyz/",
    category: ["Education", "AI"],
    image: "/photos/photo2.jpg",
    mdxFile: "opendeep-learning.mdx",
    slug: "opendeep-learning",
  },
  {
    title: "i18n",
    year: 2023,
    description: "Open source AI education resources",
    url: "https://opendeeplearning.xyz/",
    category: ["Education", "AI"],
    image: "/photos/photo2.jpg",
    mdxFile: "nextjs-i18n.mdx",
    slug: "opendeep-as",
  },
  // Ajoute d'autres projets ici avec la propriété category, image et mdxFile
];
