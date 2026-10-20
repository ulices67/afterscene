"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  Check,
  Clapperboard,
  Download,
  Heart,
  Layers3,
  MonitorDown,
  Play,
  Sparkles,
  Star,
} from "lucide-react";
import styles from "./distribution.module.css";

const installerUrl =
  "https://github.com/ulices67/afterscene/releases/latest/download/AFTERSCENE-Setup.exe";

const posters = [
  { title: "Interestelar", image: "/assets/interstellar-poster.jpg" },
  { title: "Duna: Parte dos", image: "/assets/dune-2-poster.jpg" },
  { title: "The Last of Us", image: "/assets/last-of-us-poster.jpg" },
  { title: "Oppenheimer", image: "/assets/oppenheimer-poster.jpg" },
  { title: "El viaje de Chihiro", image: "/assets/spirited-away-poster.jpg" },
];

export default function DistributionExperience() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    let active = true;
    let cleanup = () => {};

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (!active || !root.current) return;
        gsap.registerPlugin(ScrollTrigger);
        const ctx = gsap.context(() => {
          const mm = gsap.matchMedia();
          mm.add("(prefers-reduced-motion: no-preference)", () => {
            gsap.from(`.${styles.heroText} > *`, {
              y: 28,
              opacity: 0,
              duration: 0.9,
              stagger: 0.11,
              ease: "power3.out",
              clearProps: "all",
            });
            gsap.from(`.${styles.preview}`, {
              y: 54,
              opacity: 0,
              rotateX: 7,
              duration: 1.25,
              delay: 0.15,
              ease: "power3.out",
              clearProps: "all",
            });
            gsap.to(`.${styles.orbit}`, {
              rotate: 18,
              scale: 1.09,
              scrollTrigger: { trigger: `.${styles.hero}`, scrub: 1.1, start: "top top", end: "bottom top" },
            });
            gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
              gsap.from(element, {
                y: 34,
                opacity: 0,
                duration: 0.75,
                ease: "power2.out",
                scrollTrigger: { trigger: element, start: "top 88%", once: true },
                clearProps: "all",
              });
            });
          });
          cleanup = () => mm.revert();
        }, root);
        const oldCleanup = cleanup;
        cleanup = () => { oldCleanup(); ctx.revert(); };
      },
    );

    return () => { active = false; cleanup(); };
  }, []);

  return (
    <main className={styles.page} ref={root}>
      <div className={styles.grain} aria-hidden="true" />
      <nav className={styles.nav} aria-label="Navegación de distribución">
        <Link className={styles.wordmark} href="/#inicio" aria-label="AFTERSCENE, ir a la aplicación">
          <span className={styles.mark}>A<span>✦</span></span><span>AFTERSCENE</span>
        </Link>
        <div className={styles.navLinks}>
          <a href="#experiencia">La experiencia</a>
          <a href="#descargar">Descargar</a>
          <Link className={styles.navApp} href="/#inicio">Abrir app <ArrowRight size={15} /></Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroImage} aria-hidden="true" />
        <div className={styles.orbit} aria-hidden="true" />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <span className={styles.kicker}><span className={styles.kickerLine} /> UNA NUEVA FORMA DE VIVIR TUS HISTORIAS</span>
            <h1>El cine termina.<br /><em>La historia permanece.</em></h1>
            <p>Películas, series, anime y K-dramas en un solo lugar para descubrir, organizar y recordar lo que te mueve.</p>
            <div className={styles.actions}>
              <a className={styles.primary} href={installerUrl} download>
                <Download size={17} /> Descargar para Windows <ArrowRight size={16} />
              </a>
              <Link className={styles.secondary} href="/#inicio"><Play size={16} fill="currentColor" /> Entrar desde el navegador</Link>
            </div>
            <div className={styles.platform}><span className={styles.pulse} /> Aplicación de escritorio para Windows · Conexión a internet necesaria</div>
          </div>
          <div className={styles.heroIndex}><span>01 / 03</span><span>DESCUBRE · ORGANIZA · RECUERDA</span></div>
        </div>
        <a className={styles.scrollCue} href="#experiencia" aria-label="Descubre la experiencia"><span>EXPLORA</span><ArrowDown size={16} /></a>
      </section>

      <section className={styles.showcase} id="experiencia">
        <div className={styles.sectionHead} data-reveal>
          <div><span className={styles.eyebrow}>TU ARCHIVO PERSONAL</span><h2>Todo lo que viste.<br /><em>Todo lo que sentiste.</em></h2></div>
          <p>AFTERSCENE convierte tu recorrido audiovisual en un lugar propio. Guarda títulos reales, comparte reseñas y vuelve a los momentos que importan.</p>
        </div>
        <div className={styles.previewWrap} data-reveal>
          <div className={styles.preview} aria-label="Vista previa ilustrativa de la interfaz de AFTERSCENE">
            <div className={styles.previewSidebar}>
              <div className={styles.previewLogo}>AFTERSCENE</div>
              <span className={styles.previewNavActive}><Sparkles size={15} /> Inicio</span>
              <span><Clapperboard size={15} /> Películas</span>
              <span><Layers3 size={15} /> Mi biblioteca</span>
              <span><Heart size={15} /> Favoritos</span>
            </div>
            <div className={styles.previewBody}>
              <div className={styles.previewTop}><span>Explora tus historias</span><span className={styles.previewAvatar}>A</span></div>
              <div className={styles.previewHero}>
                <div className={styles.previewHeroCopy}><span>UNA HISTORIA PARA RECORDAR</span><strong>INTERSTELLAR</strong><small>2014 · Ciencia ficción · 2h 49m</small><span className={styles.previewPill}><Play size={11} fill="currentColor" /> Explorar título</span></div>
              </div>
              <div className={styles.previewRowTitle}><b>Historias que dejan huella</b><span>Explorar →</span></div>
              <div className={styles.posterRow}>{posters.map((item) => <div className={styles.poster} key={item.title}><Image unoptimized src={item.image} alt={item.title} width={160} height={240} /><span>{item.title}</span></div>)}</div>
            </div>
          </div>
          <div className={styles.previewGlow} aria-hidden="true" />
        </div>
        <div className={styles.capabilities}>
          <article data-reveal><span className={styles.featureNumber}>01</span><Clapperboard size={25} /><h3>Descubre</h3><p>Explora catálogos de películas, series, anime y K-dramas con información y reparto.</p></article>
          <article data-reveal><span className={styles.featureNumber}>02</span><Layers3 size={25} /><h3>Organiza</h3><p>Construye tu biblioteca, sigue episodios y conserva tus listas en un mismo espacio.</p></article>
          <article data-reveal><span className={styles.featureNumber}>03</span><Star size={25} /><h3>Recuerda</h3><p>Escribe reseñas, califica lo que viste y crea un archivo de tus propias experiencias.</p></article>
        </div>
      </section>

      <section className={styles.closing} id="descargar">
        <div className={styles.closingImage} aria-hidden="true" />
        <div className={styles.closingInner} data-reveal>
          <span className={styles.eyebrow}>LLEVA TUS HISTORIAS CONTIGO</span>
          <h2>Una escena más.<br /><em>Un recuerdo para siempre.</em></h2>
          <p>Instala AFTERSCENE en Windows y continúa en el navegador cuando quieras. Tu archivo se sincroniza con tu cuenta.</p>
          <div className={styles.actions}>
            <a className={styles.primary} href={installerUrl} download><MonitorDown size={18} /> Descargar instalador <ArrowRight size={16} /></a>
            <Link className={styles.secondary} href="/#inicio">Usar versión web <ArrowRight size={16} /></Link>
          </div>
          <div className={styles.installNote}><Check size={14} /> Instalación guiada · Windows 10/11 · Requiere internet</div>
        </div>
      </section>

      <footer className={styles.footer}><span>AFTERSCENE</span><span>Las historias que se quedan contigo.</span><Link href="/#inicio">Abrir aplicación <ArrowRight size={14} /></Link></footer>
    </main>
  );
}
