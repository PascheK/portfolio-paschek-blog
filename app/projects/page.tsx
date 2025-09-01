
import Link from "next/link";
import type { Metadata } from "next";
import { projects } from "./project-data";
import ProjectsClient from "./projects-client";


export const metadata: Metadata = {
  title: "Projects",
  description: "Nextfolio Projects"
};


export default function Projects() {
  return <ProjectsClient projects={projects} />;
}
