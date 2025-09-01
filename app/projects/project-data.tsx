
export interface Project {
  title: string;
  year: number;
  description: string;
  url: string;
  category: string;
}

export const projects: Project[] = [
  {
    title: "Mithril AI",
    year: 2024,
    description: "Open science AI resarch lab",
    url: "https://github.com/mithrilai",
    category: "AI",
  },
  {
    title: "OpenDeepLearning",
    year: 2023,
    description: "Open source AI education resources",
    url: "https://opendeeplearning.xyz/",
    category: "Education",
  },
  // Ajoute d'autres projets ici avec la propriété category
];
