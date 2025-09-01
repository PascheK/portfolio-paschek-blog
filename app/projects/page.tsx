
import Link from "next/link";
import type { Metadata } from "next";
import { projects } from "./project-data";
import ProjectsClient from "./projects-client";


export const metadata: Metadata = {
  title: "Projects",
  description: "Nextfolio Projects"
};


export default function Projects() {
  return (
    <section className="w-full px-2 sm:px-4 md:px-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
             <h1 className="mt-4 mb-2 text-3xl font-bold tracking-tight text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Projects</h1>
      <ProjectsClient projects={projects} />
      </div>
    </section>
  );
}
