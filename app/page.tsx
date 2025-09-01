
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { t } from "@/lib/i18n";
import { projects } from "@/app/projects/project-data";
import { getBlogPosts } from "@/lib/posts";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";


export default function Page() {
  // Pour la démo, langue forcée à 'fr'. Pour la prod, passer la langue dynamiquement.
  const lang = 'fr';
  const blogPosts = getBlogPosts()
    .filter(post => post.metadata && post.metadata.title)
    .sort((a, b) => new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime())
    .slice(0, 5);
  const latestProjects = projects.slice(0, 5);
  const photos = [
    { src: "/photos/photo1.jpg", alt: "Photo 1" },
    { src: "/photos/photo2.jpg", alt: "Photo 2" },
    { src: "/photos/photo3.jpg", alt: "Photo 3" },
    { src: "/photos/photo4.jpg", alt: "Photo 4" },
    { src: "/photos/photo5.jpg", alt: "Photo 5" },
    { src: "/photos/photo6.jpg", alt: "Photo 6" },
  ];

  return (
    <>
      {/* Hero */}
  <section className="w-full flex flex-col md:flex-row items-center justify-between gap-8 py-12 md:py-20">
        <div className="flex-1 flex flex-col items-start gap-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow mb-2">
            {t('home.welcome', lang)}
          </h1>
          <p className="text-lg text-neutral-700 dark:text-neutral-300 max-w-xl mb-4">
            Passionné de développement web, d'IA et de design. Découvrez mes projets, articles et photos !
          </p>
          <div className="flex gap-4 mt-2">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow">
              <a href="/projects">Voir mes projets</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-semibold">
              <a href="/blog">Lire le blog</a>
            </Button>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Image
            src="/profile.png"
            alt="Photo de profil"
            width={180}
            height={180}
            className="rounded-full border-4 border-blue-400 shadow-lg object-cover"
            priority
          />
        </div>
      </section>

      {/* Section Projets */}
  <section className="w-full max-w-4xl mx-auto mt-12 md:mt-16 min-h-[420px] flex flex-col justify-between">
        <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-pink-400 flex items-center gap-2">
          <span>Projets récents</span>
          <a href="/projects" className="text-base underline text-blue-500 dark:text-pink-400 ml-2">Tout voir</a>
        </h2>
        <div className="relative flex-1">
          <Carousel className="mx-auto max-w-2xl">
            <CarouselContent>
              {latestProjects.map((project) => (
                <CarouselItem key={project.slug} className="p-4">
                  <div className="bg-white/80 dark:bg-neutral-900/80 rounded-xl shadow p-6 flex flex-col items-start h-full">
                    <Image src={project.image} alt={project.title} width={400} height={220} className="rounded-lg w-full object-cover mb-4" />
                    <h3 className="text-xl font-semibold mb-1">{project.title}</h3>
                    <p className="text-neutral-700 dark:text-neutral-300 mb-2">{project.description}</p>
                    <a href={project.url} target="_blank" rel="noopener" className="text-blue-600 dark:text-pink-400 underline font-medium">Découvrir</a>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Section Blog */}
  <section className="w-full max-w-4xl mx-auto mt-12 md:mt-16 min-h-[420px] flex flex-col justify-between">
        <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-pink-400 flex items-center gap-2">
          <span>Derniers articles</span>
          <a href="/blog" className="text-base underline text-blue-500 dark:text-pink-400 ml-2">Tout voir</a>
        </h2>
        <div className="relative flex-1">
          <Carousel className="mx-auto max-w-2xl">
            <CarouselContent>
              {blogPosts.map((post) => (
                <CarouselItem key={post.slug} className="p-4">
                  <div className="bg-white/80 dark:bg-neutral-900/80 rounded-xl shadow p-6 flex flex-col h-full">
                    <h3 className="text-xl font-semibold mb-1">{post.metadata.title}</h3>
                    <p className="text-neutral-700 dark:text-neutral-300 mb-2 line-clamp-3">{post.metadata.summary}</p>
                    <span className="text-xs text-neutral-500 mb-2">{post.metadata.publishedAt}</span>
                    <a href={`/blog/${post.slug}`} className="text-blue-600 dark:text-pink-400 underline font-medium mt-auto">Lire l'article</a>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Section Photos */}
  <section className="w-full max-w-4xl mx-auto mt-12 md:mt-16 min-h-[420px] flex flex-col justify-between">
        <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-pink-400 flex items-center gap-2">
          <span>Dernières photos</span>
          <a href="/photos" className="text-base underline text-blue-500 dark:text-pink-400 ml-2">Tout voir</a>
        </h2>
        <div className="relative flex-1">
          <Carousel className="mx-auto max-w-2xl">
            <CarouselContent>
              {photos.map((photo, idx) => (
                <CarouselItem key={idx} className="p-4">
                  <div className="rounded-xl overflow-hidden shadow bg-white/80 dark:bg-neutral-900/80 flex items-center justify-center h-64">
                    <Image src={photo.src} alt={photo.alt} width={400} height={256} className="object-cover w-full h-full" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>
    </>
  );
}
