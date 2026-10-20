"use client";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import {
  motion,
  AnimatePresence,
  MotionConfig,
  LayoutGroup,
  useReducedMotion,
} from "motion/react";
import gsap from "gsap";
import { Dialog } from "radix-ui";
import {
  Home,
  Compass,
  Clapperboard,
  Tv,
  Flower2,
  Heart,
  Library,
  ChartNoAxesColumn,
  BookOpen,
  Settings,
  Search,
  Bell,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Plus,
  Check,
  Play,
  X,
  Star,
  SlidersHorizontal,
  Grid2X2,
  List,
  MoreHorizontal,
  Bookmark,
  LogOut,
  Download,
  Upload,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Film as FilmIcon,
  Globe,
  CheckCircle2,
  Camera,
  Trash2,
  PenLine,
  Menu,
  UserRound,
  UsersRound,
  Info,
  LoaderCircle,
  Volume2,
  ExternalLink,
  Leaf,
  Sparkles,
  CalendarDays,
  Pause,
  Lock,
  Monitor,
} from "lucide-react";
import {
  films,
  getFilm,
  image,
  matches,
  statuses,
  registerFilms,
  sourceLink,
  type Film,
  type Category,
} from "@/lib/catalog";
import {
  seed,
  storageKey,
  isArchive,
  getSupabase,
  getCloudArchive,
  saveCloudArchive,
  type Archive,
  type LibraryItem,
  type Memory,
} from "@/lib/archive";
import ProfileEditor from "@/components/ProfileEditor";
import AuthPage from "@/components/AuthPage";
import LocalPlayer from "@/components/LocalPlayer";
import PeoplePage, { type PersonSummary } from "@/components/PeoplePage";
import SocialNotifications from "@/components/SocialNotifications";
import Community, { PublishProfile } from "@/components/Community";
import ReleaseCalendar from "@/components/ReleaseCalendar";
import CinematicMotion from "@/components/CinematicMotion";
import ActivityDashboard from "@/components/ActivityDashboard";
import CastCards from "@/components/CastCards";
import TitleReviews from "@/components/TitleReviews";
import { useCatalog } from "@/lib/useCatalog";

const nav = [
  { id: "inicio", name: "Inicio", icon: Home },
  { id: "explorar", name: "Explorar", icon: Compass },
  { id: "peliculas", name: "Películas", icon: Clapperboard },
  { id: "series", name: "Series", icon: Tv },
  { id: "anime", name: "Anime", icon: Flower2 },
  { id: "kdramas", name: "K-dramas", icon: Heart },
  { id: "personas", name: "Personas", icon: UsersRound },
  { id: "comunidad", name: "Comunidad", icon: UsersRound },
  { id: "calendario", name: "Calendario", icon: CalendarDays },
];
const personal = [
  { id: "favoritos", name: "Favoritos", icon: Heart },
  { id: "biblioteca", name: "Mi biblioteca", icon: Library },
  { id: "tops", name: "Mis tops", icon: ChartNoAxesColumn },
  { id: "recuerdos", name: "Recuerdos", icon: BookOpen },
  { id: "actividad", name: "Mi actividad", icon: ChartNoAxesColumn },
];
const cats = ["Todo", "Películas", "Series", "Anime", "K-dramas"];
const today = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
const dateLabel = (s: string) =>
  new Date(s + "T12:00:00").toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
const categoryFits = (f: Film, c: string) =>
  c === "Todo" ||
  c === "Todos" ||
  (c === "Películas" ? f.type === "movie" : f.category === c);
const Button = ({
  children,
  onClick,
  primary = false,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`btn ${primary ? "primary" : ""} ${className}`}
    {...(props as any)}
  >
    {children}
  </motion.button>
);
const IconButton = ({
  children,
  label,
  onClick,
  ...props
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  [key: string]: any;
}) => (
  <button
    type="button"
    className="icon-btn"
    aria-label={label}
    title={label}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);

function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild aria-describedby={undefined}>
              <motion.div
                className={`modal ${wide ? "wide" : ""}`}
                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.22 }}
              >
                <div className="modal-header">
                  <Dialog.Title>{title}</Dialog.Title>
                  <Dialog.Close asChild>
                    <IconButton label="Cerrar">
                      <X size={20} />
                    </IconButton>
                  </Dialog.Close>
                </div>
                {children}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

export default function Cinema() {
  const [route, setRoute] = useState("inicio"),
    [archive, setArchive] = useState<Archive>(seed),
    [ready, setReady] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false),
    [query, setQuery] = useState(""),
    [debounced, setDebounced] = useState("");
  const [peopleResults, setPeopleResults] = useState<PersonSummary[]>([]);
  const [trailer, setTrailer] = useState<Film | null>(null),
    [memoryFilm, setMemoryFilm] = useState<string | null>(null),
    [editMemory, setEditMemory] = useState<Memory | null>(null);
  const [toast, setToast] = useState(""),
    [notifications, setNotifications] = useState(false),
    [mobileMenu, setMobileMenu] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null),
    [cloudReady, setCloudReady] = useState(false),
    [cloudEnabled, setCloudEnabled] = useState(false),
    [syncError, setSyncError] = useState(false);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const content = useRef<HTMLDivElement>(null);
  const skipSave = useRef(true);
  const account = useRef<string | null>(null);
  const hydratedAccount = useRef(false);
  const announce = useCallback((text: string) => {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3400);
  }, []);
  const update = useCallback(
    (fn: (a: Archive) => Archive) => setArchive((a) => {
      const next = fn(a);
      const ids = new Set([...Object.keys(next.library), ...next.top, ...next.profile.four, ...next.memories.map(m => m.film), ...next.collections.flatMap(c => c.films)]);
      const catalog = new Map((next.catalog || []).map(f => [f.id, f]));
      for (const f of films) if (ids.has(f.id)) catalog.set(f.id, f);
      return { ...next, catalog: [...catalog.values()] };
    }),
    [],
  );
  const navigate = useCallback((target: string) => {
    window.location.hash = target;
    setMobileMenu(false);
    setSearchOpen(false);
  }, []);
  useEffect(() => {
    let active = true;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (isArchive(parsed)) {
          registerFilms(parsed.catalog || []);
          setArchive(parsed);
        }
      }
    } catch {
      announce(
        "No se pudo leer el archivo local. Puedes importar una copia desde ajustes.",
      );
    }
    hydratedAccount.current = true;
    setReady(true);
    const routeChange = () => {
      setRoute(decodeURIComponent(location.hash.slice(1)) || "inicio");
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    routeChange();
    window.addEventListener("hashchange", routeChange);
    if(new URLSearchParams(location.search).get("recovery") === "1"){sessionStorage.setItem("afterscene.passwordRecovery","1");setRoute("login");}

    let unsub: (() => void) | undefined;
    getSupabase()
      .then(async (c) => {
        if (!active) return;
        setCloudEnabled(!!c);
        if (!c) {
          setCloudReady(true);
          return;
        }
        const session = await c.auth.getSession();
        if (active) setUser(session.data.session?.user || null);
        const listener = c.auth.onAuthStateChange((_e, s) => {
          if (active) {setUser(s?.user || null);if(_e === "PASSWORD_RECOVERY"){sessionStorage.setItem("afterscene.passwordRecovery","1");navigate("login");}}
        });
        unsub = () => listener.data.subscription.unsubscribe();
        setCloudReady(true);
      })
      .catch(() => {
        if (active) setCloudReady(true);
      });
    return () => {
      active = false;
      window.removeEventListener("hashchange", routeChange);
      unsub?.();
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [announce]);
  useEffect(() => {
    if (
      !ready ||
      !hydratedAccount.current ||
      account.current !== (user?.id || null)
    )
      return;
    try {
      localStorage.setItem(
        user ? `${storageKey}.${user.id}` : storageKey,
        JSON.stringify(archive),
      );
    } catch {
      announce(
        "El almacenamiento está lleno. Exporta una copia antes de añadir más fotografías.",
      );
    }
  }, [archive, ready, user, announce]);
  useEffect(() => {
    if (!cloudReady) return;
    let active = true;
    account.current = user?.id || null;
    hydratedAccount.current = false;
    skipSave.current = true;
    if (user) {
      getCloudArchive(user.id)
        .then((data) => {
          if (!active) return;
          if (data && isArchive(data)) setArchive(data);
          else {
            const local = localStorage.getItem(`${storageKey}.${user.id}`);
            setArchive(
              local && isArchive(JSON.parse(local))
                ? JSON.parse(local)
                : structuredClone(seed),
            );
          }
          setSyncError(false);
          hydratedAccount.current = true;
          skipSave.current = false;
        })
        .catch(() => {
          if (active) {
            hydratedAccount.current = true;
            try {
              const local = localStorage.getItem(`${storageKey}.${user.id}`);
              setArchive(
                local && isArchive(JSON.parse(local))
                  ? JSON.parse(local)
                  : structuredClone(seed),
              );
            } catch {}
            setSyncError(true);
            announce(
              "No se pudo cargar tu archivo de la nube. Tus cambios locales siguen guardados.",
            );
          }
        });
    } else {
      try {
        const local = localStorage.getItem(storageKey);
        setArchive(
          local && isArchive(JSON.parse(local))
            ? JSON.parse(local)
            : structuredClone(seed),
        );
      } catch {}
      hydratedAccount.current = true;
      skipSave.current = false;
    }
    return () => {
      active = false;
    };
  }, [user, cloudReady, announce]);
  useEffect(() => {
    if (!user || skipSave.current) return;
    const id = user.id;
    const timer = setTimeout(() => {
      if (account.current !== id) return;
      saveCloudArchive(id, archive)
        .then(() => setSyncError(false))
        .catch(() => {
          setSyncError(true);
          announce(
            "Sin conexión con la nube. Conservamos tus cambios en este navegador.",
          );
        });
    }, 700);
    return () => clearTimeout(timer);
  }, [archive, user, announce]);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);
  useEffect(() => {
    if (!searchOpen || debounced.trim().length < 2) { setPeopleResults([]); return; }
    const ac = new AbortController();
    fetch(`/api/people?action=search&q=${encodeURIComponent(debounced.trim())}`, { signal: ac.signal })
      .then(r => r.ok ? r.json() as Promise<{results:PersonSummary[]}> : null).then(d => { if (!ac.signal.aborted) setPeopleResults((d?.results || []).slice(0, 5)); })
      .catch(() => {});
    return () => ac.abort();
  }, [searchOpen, debounced]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") setNotifications(false);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    if (
      !content.current ||
      !archive.settings.motion ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".page-intro",
        { opacity: 0.3, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          clearProps: "opacity,transform",
        },
      );
    }, content);
    return () => ctx.revert();
  }, [route, archive.settings.motion]);
  const saveItem = (
    id: string,
    patch: Partial<LibraryItem>,
    message?: string,
  ) => {
    const timestamp = new Date().toISOString();
    const action = patch.episodes ? "Progreso de episodios actualizado" : patch.status ? `Estado: ${statuses[patch.status] || patch.status}` : patch.rating !== undefined ? `Calificación: ${patch.rating}/10` : patch.reminder ? "Recordatorio programado" : patch.favorite !== undefined ? (patch.favorite ? "Añadida a favoritos" : "Retirada de favoritos") : "Biblioteca actualizada";
    const eventId = crypto.randomUUID();
    update((a) => ({
      ...a,
      catalog: [...(a.catalog || []).filter(f=>f.id!==id), getFilm(id)],
      activity: [{id:eventId,film:id,action,date:timestamp},...(a.activity || [])].slice(0,2000),
      library: {
        ...a.library,
        [id]: {
          ...(a.library[id] || {status: "planned", favorite: false, added: today()}),
          ...patch, updatedAt: timestamp,
          completedAt: patch.status === "completed" ? a.library[id]?.completedAt || timestamp : patch.status ? undefined : a.library[id]?.completedAt,
        },
      },
    }));
    if (message) announce(message);
  };
  const checkAvailability = (checked: Film[]) => {
    if(!checked.length)return;
    update(a=>{
      const providerHistory={...a.providerHistory}, changes=[...(a.availabilityChanges||[])];let changed=false;
      for(const film of checked){if(!film.watchProviders)continue;const key=`${a.settings.country}:${film.id}`, next=film.watchProviders[a.settings.country]||[],previous=providerHistory[key];
        if(JSON.stringify(previous)!==JSON.stringify(next)){changed=true;if(previous)changes.unshift({film:film.id,country:a.settings.country,date:new Date().toISOString()});providerHistory[key]=next;}
      }
      return changed?{...a,providerHistory,availabilityChanges:changes.slice(0,50)}:a;
    });
  };
  const toggleFavorite = (id: string) => {
    const favorite = !archive.library[id]?.favorite;
    saveItem(
      id,
      { favorite },
      favorite ? "Añadida a tus favoritos" : "Eliminada de favoritos",
    );
  };
  const togglePlanned = (id: string) => {
    const exists = !!archive.library[id];
    if (!exists) {
      saveItem(
        id,
        { status: "planned" },
        "Guardada en tu biblioteca · Por ver",
      );
    } else {
      navigate("biblioteca");
      announce("Ya está en tu biblioteca. Puedes cambiar su estado.");
    }
  };
  const openFilm = (f: Film) => {
    if (f.remote)
      update((a) => ({
        ...a,
        catalog: [...(a.catalog || []).filter((v) => v.id !== f.id), f],
      }));
    navigate(`titulo/${f.type}/${f.id}`);
  };
  const openMemory = (id?: string) => {
    setEditMemory(null);
    setMemoryFilm(id || "interstellar");
  };
  useEffect(() => {
    registerFilms(archive.catalog || []);
  }, [archive.catalog]);
  const universal = useCatalog(searchOpen ? debounced : "__disabled__");
  const searchFilms = universal.remote || films;
  const selected = route.startsWith("titulo/")
    ? films.find(f => f.id === route.split("/")[2]) || null
    : null;
  const routeBase = route.split("?")[0];
  const currentLabel = selected
    ? selected.title
    : [
        ...nav,
        ...personal,
        { id: "perfil", name: "Mi perfil" },
        { id: "configuracion", name: "Configuración" },
      ].find((n) => n.id === route)?.name || "Inicio";
  const props = {
    archive,
    update,
    announce,
    openFilm,
    toggleFavorite,
    togglePlanned,
    saveItem,
    openMemory,
    navigate,
  };
  if (route === "login")
    return (
      <AuthPage
        enabled={cloudEnabled}
        onBack={() => navigate("inicio")}
        announce={announce}
      />
    );
  return (
    <MotionConfig reducedMotion={archive.settings.motion ? "user" : "always"}>
      <LayoutGroup>
        <div className={`app-shell ${(route === "anime" || selected?.category === "Anime") ? "anime-world" : ""} ${archive.settings.visualTheme === "storybook" ? "storybook-theme" : (archive.settings.visualTheme === "kdrama" || route === "kdramas" || selected?.category === "K-dramas") ? "kdrama-theme" : ""}`} data-density={archive.settings.density || "gallery"} data-motion={archive.settings.motion}>
          <aside className="sidebar">
            <a className="brand" href="#inicio" aria-label="AFTERSCENE inicio">
              afterscene<span>.</span>
            </a>
            <p className="brand-caption">THE PERSONAL FILM ARCHIVE</p>
            <nav aria-label="Navegación principal">
              <span className="nav-label">DESCUBRIR</span>
              {nav.map((n) => (
                <button
                  key={n.id}
                  aria-label={n.name}
                  className={`nav-item ${route === n.id ? "active" : ""}`}
                  onClick={() => navigate(n.id)}
                  aria-current={route === n.id ? "page" : undefined}
                >
                  <n.icon size={18} />
                  <span>{n.name}</span>
                  {route === n.id && <span className="active-dot" />}
                </button>
              ))}
              <div className="nav-divider" />
              <span className="nav-label">Mi biblioteca</span>
              {personal.map((n) => (
                <button
                  key={n.id}
                  aria-label={n.name}
                  className={`nav-item ${route === n.id ? "active" : ""}`}
                  onClick={() => navigate(n.id)}
                  aria-current={route === n.id ? "page" : undefined}
                >
                  <n.icon size={18} />
                  <span>{n.name}</span>
                  {n.id === "biblioteca" && (
                    <small>
                      {Object.keys(archive.library)
                        .length.toString()
                        .padStart(2, "0")}
                    </small>
                  )}
                </button>
              ))}
            </nav>
            <div className="sidebar-bottom">
              <div className="archive-note">
                <div className="tiny-star">✳</div>
                <p>
                  Una vida.
                  <br />
                  <span>Muchas historias.</span>
                </p>
                <span className="small-line" />
              </div>
              <button
                className="nav-item"
                onClick={() => navigate("configuracion")}
              >
                <Settings size={17} />
                Configuración
              </button>
              <Link className="nav-item" href="/descargar">
                <Download size={17} />
                Descargar app
              </Link>
              <button
                className="profile-link"
                aria-label="Abrir mi espacio personal"
                onClick={() => navigate("perfil")}
              >
                <div className="avatar">
                  {archive.profile.avatar ? <img className="avatar-photo" src={archive.profile.avatar} alt="Tu foto de perfil"/> : <UserRound size={20}/>}
                </div>
                <span>
                  <b>{archive.profile.name}</b>
                  <small>
                    {user ? "Archivo sincronizado" : "Archivo personal"}
                  </small>
                </span>
                <ChevronRight size={15} />
              </button>
            </div>
          </aside>
          <main className="main" ref={content}>
            <CinematicMotion scope={content} enabled={archive.settings.motion} route={route}/>
            <header className="topbar">
              <div className="breadcrumb">
                <span>Tu universo</span>
                <ChevronRight size={13} />
                <b>{currentLabel}</b>
              </div>
              <button
                className="search-trigger"
                aria-label="Buscar películas, series y personas"
                onClick={() => {
                  setSearchOpen(true);
                  setQuery("");
                }}
              >
                <Search size={16} />
                <span>Buscar películas, series, personas...</span>
                <kbd>⌘ K</kbd>
              </button>
              <div className="top-actions">
                <IconButton
                  label="Notificaciones"
                  onClick={() => setNotifications((v) => !v)}
                >
                  <Bell size={18} />
                  {archive.settings.notifications !== false && ((archive.availabilityChanges?.length||0)>0 || Object.values(archive.library).some(v=>v.reminder && v.reminder<=today())) && (
                    <i className="notification-dot" />
                  )}
                </IconButton>
                <button
                  className="avatar small"
                  onClick={() => navigate("perfil")}
                  aria-label="Abrir mi perfil"
                >
                  {archive.profile.avatar ? <img className="avatar-photo" src={archive.profile.avatar} alt="Tu foto de perfil"/> : <UserRound size={20}/>}
                </button>
              </div>
              {notifications && (
                <div className="notification-panel">
                  <SocialNotifications userId={user?.id} navigate={r=>{setNotifications(false);navigate(r);}}/>
                  <ReleaseCalendar onCheck={checkAvailability} archive={archive} compact openFilm={f=>{setNotifications(false);openFilm(f);}}/>
                  <button onClick={()=>{setNotifications(false);navigate("calendario");}}>Abrir calendario <ArrowRight size={15}/></button>
                </div>
              )}
            </header>
            {route === "inicio" ? (
              <HomePage {...props} setTrailer={setTrailer} />
            ) : routeBase === "explorar" ||
              ["peliculas", "series", "anime", "kdramas"].includes(
                routeBase,
              ) ? (
              <Explore {...props} route={route} />
            ) : selected ? (
              <Details {...props} film={selected} setTrailer={setTrailer} userId={user?.id} />
            ) : routeBase.startsWith("titulo/") ? (
              <RemoteTitle {...props} route={routeBase} setTrailer={setTrailer} userId={user?.id}/>
            ) : routeBase === "personas" || routeBase.startsWith("persona/") ? (
              <PeoplePage key={routeBase.startsWith("persona/") ? routeBase : "personas"}
                personId={routeBase.startsWith("persona/") ? routeBase.split("/")[1] : undefined}
                initialQuery={routeBase === "personas" ? new URLSearchParams(route.split("?")[1] || "").get("q") || "" : undefined}
                onOpenPerson={id => navigate(`persona/${id}`)} onOpenFilm={openFilm} onBack={() => navigate("personas")} />
            ) : route === "biblioteca" || route === "favoritos" ? (
              <LibraryPage
                key={route}
                {...props}
                favorites={route === "favoritos"}
              />
            ) : route === "tops" ? (
              <Tops {...props} />
            ) : route === "recuerdos" ? (
              <Memories
                {...props}
                onEdit={(m: Memory) => {
                  setEditMemory(m);
                  setMemoryFilm(m.film);
                }}
              />
            ) : route === "comunidad" || routeBase.startsWith("usuario/") ? (
              <Community profileId={routeBase.startsWith("usuario/")?routeBase.split("/")[1]:undefined} userId={user?.id} navigate={navigate}/>
            ) : route === "calendario" ? (
              <ReleaseCalendar onCheck={checkAvailability} archive={archive} openFilm={openFilm}/>
            ) : route === "actividad" ? (
              <div className="standard-page page-intro"><ActivityDashboard archive={archive} openFilm={openFilm}/></div>
            ) : route === "perfil" ? (
              <Profile {...props} userId={user?.id} />
            ) : route === "configuracion" ? (
              <SettingsPage
                {...props}
                user={user}
                cloudEnabled={cloudEnabled}
                syncError={syncError}
                onAuth={() => navigate("login")}
              />
            ) : (
              <div className="empty-state">
                <Compass />
                <h1>Esta escena aún no existe.</h1>
                <Button primary onClick={() => navigate("inicio")}>
                  Volver a Inicio
                </Button>
              </div>
            )}
            <footer className="footer">
              <span className="footer-brand">afterscene.</span>
              <span>Para las historias que se quedan contigo.</span>
              <span>
                HECHO PARA RECORDAR <span className="footer-star">✳</span>
              </span>
            </footer>
          </main>
          <nav className="mobile-nav" aria-label="Navegación móvil">
            {[nav[0], nav[1], personal[1], personal[3]].map((n) => (
              <button
                key={n.id}
                className={route === n.id ? "active" : ""}
                onClick={() => navigate(n.id)}
              >
                <n.icon size={21} />
                <span>{n.id === "biblioteca" ? "Biblioteca" : n.name}</span>
              </button>
            ))}
            <button onClick={() => setMobileMenu(true)}>
              <Menu size={21} />
              <span>Más</span>
            </button>
          </nav>
          <Modal
            open={mobileMenu}
            onClose={() => setMobileMenu(false)}
            title="Tu universo cinematográfico"
          >
            <div className="mobile-menu-list">
              {[
                ...nav.slice(2),
                { id: "tops", name: "Mis tops", icon: ChartNoAxesColumn },
                { id: "perfil", name: "Mi perfil", icon: UserRound },
                { id: "configuracion", name: "Configuración", icon: Settings },
              ].map((n) => (
                <button key={n.id} onClick={() => navigate(n.id)}>
                  <n.icon size={20} />
                  {n.name}
                  <ChevronRight size={18} />
                </button>
              ))}
              <Link href="/descargar"><Download size={20} /> Descargar app <ChevronRight size={18} /></Link>
            </div>
          </Modal>
          <Modal
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
            title="Encuentra tu próxima historia"
            wide
          >
            <div className="search-modal-input">
              <Search size={21} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Un título, una persona, una emoción..."
                aria-label="Buscar en el catálogo"
              />
              {query && (
                <IconButton
                  label="Limpiar búsqueda"
                  onClick={() => setQuery("")}
                >
                  <X size={17} />
                </IconButton>
              )}
            </div>
            <div className="search-results">
              {!debounced && (
                <>
                  <p className="eyebrow">
                    {archive.recent.length
                      ? "BÚSQUEDAS RECIENTES"
                      : "UN BUEN PUNTO DE PARTIDA"}
                  </p>
                  <div className="chips">
                    {(archive.recent.length
                      ? archive.recent
                      : ["Christopher Nolan", "Ciencia ficción", "Your Name"]
                    ).map((q) => (
                      <button
                        className="chip"
                        key={q}
                        onClick={() => setQuery(q)}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <p className="muted search-count">
                {debounced
                  ? "Resultados del catálogo"
                  : "Historias para descubrir"}
              </p>
              {searchFilms
                .filter(
                  (f) =>
                    universal.remote || !debounced || matches(f, debounced),
                )
                .slice(0, 8)
                .map((f) => (
                  <button
                    className="search-result"
                    key={f.id}
                    onClick={() => {
                      if (query)
                        update((a) => ({
                          ...a,
                          recent: [
                            query,
                            ...a.recent.filter((q) => q !== query),
                          ].slice(0, 5),
                        }));
                      openFilm(f);
                    }}
                  >
                    <img src={image(f)} alt="" />
                    <span>
                      <b>{f.title}</b>
                      <small>
                        {f.year || "—"} · {f.category} · {f.director}
                      </small>
                    </span>
                    <ArrowUpRight size={18} />
                  </button>
                ))}
              {peopleResults.length > 0 && <><p className="eyebrow">PERSONAS</p>{peopleResults.map(person => <button className="search-result" key={`person-${person.id}`} onClick={() => navigate(`persona/${person.id}`)}>
                {person.photo ? <img src={person.photo} alt="" /> : <UserRound size={26} />}
                <span><b>{person.name}</b><small>{person.knownFor || "Cine y televisión"} · TMDB</small></span><ArrowUpRight size={18}/>
              </button>)}<button className="text-link" onClick={() => navigate(`personas?q=${encodeURIComponent(query)}`)}>Ver todas las personas <ArrowRight size={15}/></button></>}
              {debounced &&
                !searchFilms.some(
                  (f) => universal.remote || matches(f, debounced),
                ) && (
                  <div className="empty-state compact">
                    <Search />
                    <h3>No encontramos esa historia</h3>
                    <p>Prueba otro título, director o género.</p>
                  </div>
                )}
            </div>
          </Modal>
          <Modal
            open={!!trailer}
            onClose={() => setTrailer(null)}
            title={`Tráiler · ${trailer?.title || ""}`}
            wide
          >
            {trailer && (
              <div className="trailer-frame">
                {trailer.trailer ? (
                  <iframe
                    key={trailer.id}
                    src={`https://www.youtube-nocookie.com/embed/${trailer.trailer}?rel=0&autoplay=0`}
                    title={`Tráiler de ${trailer.title}`}
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <div className="empty-state">
                    <FilmIcon />
                    <h3>Sin tráiler en esta selección</h3>
                    <a
                      href={sourceLink(trailer)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Consultar fuente original <ExternalLink size={15} />
                    </a>
                  </div>
                )}
              </div>
            )}
            <p className="modal-footnote">
              Tráiler de la fuente original en YouTube. La reproducción depende de la
              disponibilidad regional del video.
            </p>
          </Modal>
          <MemoryEditor
            open={!!memoryFilm}
            onClose={() => {
              setMemoryFilm(null);
              setEditMemory(null);
            }}
            filmId={memoryFilm || "interstellar"}
            existing={editMemory}
            onSave={(m) => {
              update((a) => ({
                ...a,
                memories: [m, ...a.memories.filter((v) => v.id !== m.id)],
              }));
              setMemoryFilm(null);
              setEditMemory(null);
              announce("Un recuerdo más para tu archivo.");
              navigate("recuerdos");
            }}
          />
          <AnimatePresence>
            {toast && (
              <motion.div
                className="toast"
                role="status"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
              >
                <CheckCircle2 size={18} />
                {toast}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}

type Common = {
  archive: Archive;
  update: (fn: (a: Archive) => Archive) => void;
  announce: (s: string) => void;
  openFilm: (f: Film) => void;
  toggleFavorite: (id: string) => void;
  togglePlanned: (id: string) => void;
  saveItem: (id: string, patch: Partial<LibraryItem>, message?: string) => void;
  openMemory: (id?: string) => void;
  navigate: (s: string) => void;
};
function Poster({
  film: f,
  archive,
  openFilm,
  toggleFavorite,
  togglePlanned,
  context = "catalog",
  rank,
}: { film: Film; context?: string; rank?: number } & Pick<
  Common,
  "archive" | "openFilm" | "toggleFavorite" | "togglePlanned"
>) {
  const reduce = useReducedMotion();
  return (
    <motion.article
      className="poster-card"
      whileHover={reduce ? {} : { y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <button
        className="poster-open"
        onClick={() => openFilm(f)}
        aria-label={`Ver detalles de ${f.title}`}
      >
        <motion.div
          layoutId={`poster-${context}-${f.id}`}
          className="poster-image"
        >
          <img
            src={image(f)}
            alt={`Póster de ${f.title}`}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.opacity = "0";
            }}
          />
          <span className="poster-fallback">{f.title}</span>
          {rank && (
            <span className="rank-badge">{String(rank).padStart(2, "0")}</span>
          )}
          <span className="poster-overlay">
            <span className="round-play">
              <ArrowUpRight size={23} />
            </span>
            <span>Ver historia</span>
          </span>
        </motion.div>
        <h3>{f.title}</h3>
        <div className="poster-meta">
          <span>
            {f.year || "—"} <i>·</i>{" "}
            {f.category === "Películas"
              ? "Película"
              : f.category === "Anime"
                ? "Anime"
                : f.category === "K-dramas"
                  ? "K-drama"
                  : "Serie"}
          </span>
          <span>
            <Star size={11} fill="currentColor" />
            {f.score ? f.score.toFixed(1) : "—"}
          </span>
        </div>
      </button>
      <div className="poster-actions">
        <button
          aria-label={`${archive.library[f.id]?.favorite ? "Quitar" : "Añadir"} ${f.title} ${archive.library[f.id]?.favorite ? "de" : "a"} favoritos`}
          aria-pressed={!!archive.library[f.id]?.favorite}
          className={archive.library[f.id]?.favorite ? "is-favorite" : ""}
          onClick={() => toggleFavorite(f.id)}
        >
          <Heart
            size={16}
            fill={archive.library[f.id]?.favorite ? "currentColor" : "none"}
          />
        </button>
        <button
          aria-label={`Guardar ${f.title} en mi biblioteca`}
          onClick={() => togglePlanned(f.id)}
        >
          {archive.library[f.id] ? <Check size={16} /> : <Plus size={16} />}
        </button>
      </div>
    </motion.article>
  );
}
function SectionHeading({
  eyebrow,
  title,
  action,
  onAction,
  children,
}: {
  eyebrow?: string;
  title: string;
  action?: string;
  onAction?: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      <div className="section-heading-actions">
        {action && (
          <button className="text-link" onClick={onAction}>
            {action}
            <ArrowUpRight size={15} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
function FilmRow({
  ids,
  context,
  ...p
}: Common & { ids: string[]; context: string }) {
  return (
    <div className="poster-grid row">
      {ids.map((id) => (
        <Poster key={id} film={getFilm(id)} {...p} context={context} />
      ))}
    </div>
  );
}

function HomePage(p: Common & { setTrailer: (f: Film) => void }) {
  const [hero, setHero] = useState(0),
    [paused, setPaused] = useState(false);
  const [surprise, setSurprise] = useState<Film | null>(null);
  const trending = useCatalog("", "Tendencias");
  const featured = [films[0], films[1], films[2]];
  const f = featured[hero];
  useEffect(() => {
    if (paused || !p.archive.settings.autoplay) return;
    const t = setInterval(() => {
      if (!document.hidden) setHero((h) => (h + 1) % 3);
    }, 10000);
    return () => clearInterval(t);
  }, [paused, p.archive.settings.autoplay]);
  return (
    <div className="home-page">
      <div className="home-tabs">
        <div>
          {["Para ti", ...cats.slice(1)].map((c, i) => (
            <button
              key={c}
              className={i === 0 ? "selected" : ""}
              onClick={() =>
                i &&
                p.navigate(
                  ["inicio", "peliculas", "series", "anime", "kdramas"][i],
                )
              }
            >
              {c}
            </button>
          ))}
        </div>
        <span>
          <span className="live-dot" /> TU CINE, A TU MANERA
        </span>
      </div>
      <section
        className="hero page-intro"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <AnimatePresence initial={false} mode="sync">
          <motion.img
            key={f.id}
            className="hero-backdrop"
            src={image(f, "backdrop")}
            alt=""
            initial={{ opacity: 0, scale: 1.025 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        </AnimatePresence>
        <div className="hero-shade" />
        <div className="hero-top">
          <span className="feature-tag">
            <span /> LA SELECCIÓN DE AFTERSCENE
          </span>
          <span className="hero-quality">UNA HISTORIA PARA QUEDARSE</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={f.id}
            className="hero-copy"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <p className="eyebrow">
              UNA PELÍCULA DE {f.director.toUpperCase()}
            </p>
            <h1 className={f.id === "interstellar" ? "space-title" : ""}>
              {f.title}
            </h1>
            <div className="hero-meta">
              <span>{f.year || "—"}</span>
              <i /> <span>{f.duration}</span>
              <i />
              <span>{f.genre}</span>

            </div>
            <p className="hero-description">
              {f.synopsis}
            </p>
            <div className="hero-buttons">
              <Button primary onClick={() => p.setTrailer(f)}>
                <Play size={16} fill="currentColor" />
                Ver tráiler
              </Button>
              <Button onClick={() => p.openFilm(f)}>
                Más información
                <ArrowUpRight size={16} />
              </Button>
              <IconButton
                label="Guardar en mi biblioteca"
                onClick={() => p.togglePlanned(f.id)}
              >
                {p.archive.library[f.id] ? (
                  <Check size={19} />
                ) : (
                  <Plus size={19} />
                )}
              </IconButton>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="hero-bottom">
          <span>
            <Star size={12} fill="currentColor" />
            {f.score ? f.score.toFixed(1) : "—"} <span>EN TMDB</span>
          </span>
          <div className="hero-pagination">
            {featured.map((v, i) => (
              <button
                key={v.id}
                aria-label={`Destacar ${v.title}`}
                aria-pressed={hero === i}
                className={hero === i ? "active" : ""}
                onClick={() => {
                  setHero(i);
                  setPaused(true);
                }}
              >
                <span>0{i + 1}</span>
                <i />
              </button>
            ))}
            <IconButton
              label={
                p.archive.settings.autoplay
                  ? "Pausar rotación"
                  : "Activar rotación"
              }
              onClick={() => {
                p.update((a) => ({
                  ...a,
                  settings: { ...a.settings, autoplay: !a.settings.autoplay },
                }));
                setPaused(false);
              }}
            >
              {p.archive.settings.autoplay ? (
                <Pause size={12} />
              ) : (
                <Play size={12} />
              )}
            </IconButton>
          </div>
        </div>
      </section>
      <section className="home-discovery content-section" aria-label="Descubrimiento sorpresa">
        <div><span className="eyebrow">UNA HISTORIA INESPERADA</span><h2>¿Qué vemos hoy?</h2><p>Déjate sorprender por una película o serie del catálogo real.</p></div>
        {surprise && <button className="discovery-pick" onClick={() => p.openFilm(surprise)}><img src={image(surprise, "poster")} alt=""/><span><b>{surprise.title}</b><small>{surprise.year} · {surprise.category}</small><em>Ver ficha →</em></span></button>}
        <button className="btn primary discovery-roll" onClick={() => {
          const choices = (trending.remote || []).filter(item => item.poster && item.id !== surprise?.id);
          if (choices.length) setSurprise(choices[Math.floor(Math.random() * choices.length)]);
          else p.navigate("explorar");
        }}>{surprise ? "Otra sorpresa" : "Sorpréndeme"}</button>
      </section>
      <section className="content-section trends">
        <SectionHeading
          eyebrow="EN EL RADAR"
          title="Tendencias esta semana"
          action="Explorar todo"
          onAction={() => p.navigate("explorar")}
        />
        <FilmRow
          {...p}
          context="trends"
          ids={(trending.remote || []).slice(0, 12).map(f => f.id)}
        />
      </section>
      {Object.values(p.archive.library).some(item => item.status === "watching") && <section className="content-section continue">
        <SectionHeading
          title="Continuar viendo"
          action="Ir a mi biblioteca"
          onAction={() => p.navigate("biblioteca")}
        />
        <div className="landscape-grid">
          {Object.entries(p.archive.library).filter(([,item])=>item.status === "watching").map(([id], i) => {
            const f = getFilm(id);
            return (
              <button
                className="landscape-card"
                onClick={() => p.openFilm(f)}
                key={id}
              >
                <img src={image(f, "backdrop")} alt="" loading="lazy" />
                <div className="landscape-shade" />
                <span className="landscape-label">
                  {statuses[p.archive.library[id].status]}
                </span>
                <div>
                  <span>
                    <b>{f.title}</b>
                    <small>
                      {f.category}
                    </small>
                  </span>
                  <span className="landscape-arrow">
                    <ArrowUpRight size={20} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>}
      <section className="editorial-banner">
        <img
          src={image(getFilm("past-lives"), "backdrop")}
          alt=""
          loading="lazy"
        />
        <div>
          <p className="eyebrow">MÁS QUE UNA LISTA DE PELÍCULAS</p>
          <h2>
            Algunas historias
            <br />
            se vuelven parte de <em>ti.</em>
          </h2>
          <p>
            Guarda ese instante. La persona, el lugar, lo que sentiste.
            <br />
            Tu cine también es tu historia.
          </p>
          <Button onClick={() => p.openMemory()}>
            Escribir mi primer recuerdo <PenLine size={15} />
          </Button>
        </div>
        <span className="editorial-index">EL ARCHIVO PERSONAL / 01</span>
      </section>
      <section className="content-section">
        <SectionHeading
          eyebrow="OTRAS FORMAS DE MIRAR"
          title="Explorar por género"
        />
        <div className="collection-grid">
          {[
            {
              name: "Más allá de las estrellas",
              sub: "Para quienes siempre miran al cielo",
              film: "interstellar",
              filter: "Ciencia ficción",
            },
            {
              name: "El arte de sentir",
              sub: "Historias que hablan de nosotros",
              film: "past-lives",
              filter: "Romance",
            },
            {
              name: "Mundos sin límites",
              sub: "La imaginación en cada fotograma",
              film: "your-name",
              filter: "Anime",
            },
          ].map((c) => (
            <button
              key={c.name}
              onClick={() =>
                p.navigate(`explorar?genre=${encodeURIComponent(c.filter)}`)
              }
            >
              <img
                src={image(getFilm(c.film), "backdrop")}
                alt=""
                loading="lazy"
              />
              <div>
                <span>COLECCIÓN CURADA</span>
                <h3>{c.name}</h3>
                <p>{c.sub}</p>
              </div>
              <ArrowUpRight size={20} />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function Explore(p: Common & { route: string }) {
  const routeBase = p.route.split("?")[0];
  const map: Record<string, string> = {
    peliculas: "Películas",
    series: "Series",
    anime: "Anime",
    kdramas: "K-dramas",
  };
  const [category, setCategory] = useState(map[routeBase] || "Todo"),
    [query, setQuery] = useState(""),
    [q, setQ] = useState(""),
    [genre, setGenre] = useState("Todos los géneros"),
    [year, setYear] = useState("Todos los años"),
    [score, setScore] = useState("Cualquier nota"),
    [sort, setSort] = useState("popular"),
    [country, setCountry] = useState("Todos los países"),
    [filters, setFilters] = useState(false),
    [page, setPage] = useState(1);
  useEffect(() => {
    setCategory(map[routeBase] || "Todo");
    const g = new URLSearchParams(p.route.split("?")[1]).get("genre");
    if (g === "Anime") {
      setCategory("Anime");
      setGenre("Todos los géneros");
    } else setGenre(g || "Todos los géneros");
    setPage(1);
  }, [p.route]);
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(query);
      setPage(1);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);
  const [animeMode,setAnimeMode] = useState("top");
  const live = useCatalog(q, category, page, animeMode);
  const data = (live.remote || films)
    .filter(
      (f) =>
        categoryFits(f, category) &&
        (live.remote || matches(f, q)) &&
        (genre === "Todos los géneros" || f.genre === genre) &&
        (year === "Todos los años" ||
          (year === "2020–2026"
            ? f.year >= 2020
            : year === "2010–2019"
              ? f.year >= 2010 && f.year < 2020
              : f.year < 2010)) &&
        (score === "Cualquier nota" || f.score >= Number(score)) &&
        (country === "Todos los países" || f.country === country),
    )
    .sort((a, b) =>
      sort === "rating"
        ? b.score - a.score
        : sort === "recent"
          ? b.year - a.year
          : sort === "title"
            ? a.title.localeCompare(b.title)
            : 0,
    );
  const featured =
    routeBase === "peliculas"
      ? getFilm("oppenheimer")
      : routeBase === "series"
        ? getFilm("last-of-us")
        : routeBase === "anime"
          ? getFilm("your-name")
          : getFilm("crash-landing");
  return (
    <div className="standard-page">
      <section
        className={`page-heading page-intro ${routeBase !== "explorar" ? "category-heading" : ""}`}
      >
        {routeBase !== "explorar" && (
          <>
            <img src={image(featured, "backdrop")} alt="" />
            <div className="category-shade" />
          </>
        )}
        <div>
          <p className="eyebrow">
            {routeBase === "explorar"
              ? "UN MUNDO POR DESCUBRIR"
              : "UNA HISTORIA PUEDE CAMBIARLO TODO"}
          </p>
          <h1>
            {map[routeBase] || "Explorar"}
            <span>.</span>
          </h1>
          <p>
            {routeBase === "explorar"
              ? "La próxima historia que se quede contigo está aquí."
              : routeBase === "anime"
                ? "Universos extraordinarios. Emociones que trascienden la pantalla."
                : routeBase === "kdramas"
                  ? "Historias que cruzan fronteras y llegan al corazón."
                  : "Otra mirada. Otra vida. Una nueva historia para tu archivo."}
          </p>
        </div>
      </section>
      <div className="catalog-search">
        <Search size={20} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busca por título o nombre de una persona"
          aria-label="Buscar películas y series"
        />
        <button
          className={filters ? "filter-toggle active" : "filter-toggle"}
          onClick={() => setFilters((v) => !v)}
        >
          <SlidersHorizontal size={16} />
          <span>Filtros</span>
        </button>
      </div>
      {live.notice && <p className="catalog-notice" role="status">{live.notice}</p>}
      <div className="catalog-tabs chips">
        {cats.map((c) => (
          <button
            className={`chip ${category === c ? "active" : ""}`}
            key={c}
            onClick={() => {
              setCategory(c);
              setPage(1);
            }}
          >
            {c}
          </button>
        ))}
      </div>
      {category === "Anime" && <div className="chips anime-modes">{[["top","Mejor valorados"],["season","En emisión"],["movies","Películas de anime"]].map(([id,label])=><button key={id} className={`chip ${animeMode===id?"active":""}`} onClick={()=>{setAnimeMode(id);setPage(1);}}>{label}</button>)}</div>}
      <div className="filter-row">
        <label>
          <span className="sr-only">Género</span>
          <select
            value={genre}
            onChange={(e) => {
              setGenre(e.target.value);
              setPage(1);
            }}
          >
            {[
              "Todos los géneros",
              "Ciencia ficción",
              "Drama",
              "Romance",
              "Fantasía",
              "Suspenso",
              "Acción",
              "Animación",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Década</span>
          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setPage(1);
            }}
          >
            {["Todos los años", "2020–2026", "2010–2019", "Antes de 2010"].map(
              (v) => (
                <option key={v}>{v}</option>
              ),
            )}
          </select>
        </label>
        <label>
          <span className="sr-only">Calificación mínima</span>
          <select
            value={score}
            onChange={(e) => {
              setScore(e.target.value);
              setPage(1);
            }}
          >
            <option>Cualquier nota</option>
            <option value="8">8 o más</option>
            <option value="8.5">8.5 o más</option>
          </select>
        </label>
        {filters && (
          <label>
            <span className="sr-only">País</span>
            <select
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setPage(1);
              }}
            >
              {[
                "Todos los países",
                ...new Set(films.map((f) => f.country)),
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
        )}
        <button
          className="clear-filters"
          onClick={() => {
            setQuery("");
            setGenre("Todos los géneros");
            setYear("Todos los años");
            setScore("Cualquier nota");
            setCountry("Todos los países");
            setCategory("Todo");
            setPage(1);
          }}
        >
          Limpiar
        </button>
      </div>
      <div className="results-toolbar">
        <span>
          {live.loading
            ? "Buscando historias..."
            : `${data.length} historias ${live.remote ? (live.source === "mal" ? "en MyAnimeList" : live.source === "kitsu" ? "en Kitsu" : "en TMDB") : "en la copia consultada"}`}
        </span>
        <label>
          Ordenar por{" "}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Ordenar resultados"
          >
            <option value="popular">Orden de la fuente</option>
            <option value="rating">Mejor calificadas</option>
            <option value="recent">Más recientes</option>
            <option value="title">Título A–Z</option>
          </select>
        </label>
      </div>
      {data.length ? (
        <div className="poster-grid catalog-grid">
          {data.slice(0, live.remote ? data.length : page * 12).map((f) => (
            <Poster key={f.id} {...p} film={f} context="catalog" />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Compass size={32} />
          <h2>Cambiemos de perspectiva.</h2>
          <p>
            No hay historias con estos filtros. Prueba una combinación
            diferente.
          </p>
          <Button
            onClick={() => {
              setGenre("Todos los géneros");
              setYear("Todos los años");
              setScore("Cualquier nota");
              setCountry("Todos los países");
              setQuery("");
            }}
          >
            Restablecer filtros
          </Button>
        </div>
      )}
      {(live.remote ? page < live.totalPages : data.length > page * 12) && (
        <div className="load-more">
          <Button onClick={() => setPage((v) => v + 1)}>
            Descubrir más historias <Plus size={16} />
          </Button>
        </div>
      )}
      <p className="catalog-source">
        Catálogo consultado en {" "}
        <a href={live.source === "mal" ? "https://myanimelist.net" : live.source === "kitsu" ? "https://kitsu.app" : "https://www.themoviedb.org"} target="_blank" rel="noreferrer">
          {live.source === "mal" ? "MyAnimeList" : live.source === "kitsu" ? "Kitsu" : "TMDB"}
        </a>
      </p>
    </div>
  );
}

function RemoteTitle(p: Common & {route:string;setTrailer:(f:Film)=>void;userId?:string}) {
  const [film,setFilm]=useState<Film|null>(null),[error,setError]=useState("");
  useEffect(()=>{
    const ac=new AbortController();setFilm(null);setError("");
    const [,type,id]=p.route.split("/");
    const match=/^(movie|tv|mal|kitsu)-(\d+)$/.exec(id||"");
    if(!match||!["movie","tv"].includes(type)){setError("Este título no está disponible en el catálogo.");return;}
    const url=match[1]==="mal"||match[1]==="kitsu"?`/api/anime?action=details&source=${match[1]}&id=${match[2]}`:`/api/catalog?action=details&type=${type}&id=${match[2]}`;
    fetch(url,{signal:ac.signal}).then(async r=>{if(!r.ok)throw Error();return await r.json() as {film:Film};}).then(d=>{if(!ac.signal.aborted&&d.film){registerFilms([d.film]);setFilm(d.film);}}).catch(()=>{if(!ac.signal.aborted)setError("No pudimos cargar este título. Vuelve a intentarlo desde Explorar.");});
    return()=>ac.abort();
  },[p.route]);
  return film?<Details {...p} film={film}/>:<div className="standard-page"><p role="status">{error||"Cargando la ficha del catálogo…"}</p>{error&&<Button onClick={()=>p.navigate("explorar")}>Explorar catálogo</Button>}</div>;
}

function Details(p: Common & { film: Film; setTrailer: (f: Film) => void; userId?: string }) {
  const [resolved, setResolved] = useState<Film | null>(null);
  const f = resolved?.id === p.film.id ? resolved : p.film;
  const animeProvider = f.source === "mal" || f.source === "kitsu" || f.source === "jikan";
  const providerName = f.source === "kitsu" ? "Kitsu" : animeProvider ? "MyAnimeList" : "TMDB";
  const [tab, setTab] = useState("Información"),
    [season, setSeason] = useState(1),
    [episodes, setEpisodes] = useState<any[]>([]),
    [loading, setLoading] = useState(false),
    [tvdb, setTvdb] = useState<any>(null), [moreEpisodes, setMoreEpisodes] = useState(false),
    [related,setRelated] = useState<Film[]>([]);
  useEffect(()=>{setTvdb(null);if(!f.tvdb || f.type !== "tv")return;const ac=new AbortController();fetch(`/api/tvdb?id=${f.tvdb}`,{signal:ac.signal}).then(r=>r.ok?r.json():null).then(d=>{if(!ac.signal.aborted)setTvdb(d);}).catch(()=>{});return ()=>ac.abort();},[f.id,f.tvdb]);
  const item = p.archive.library[f.id];
  useEffect(() => {
    setTab("Información");
    setSeason(1);
    setResolved(null);
    const ac = new AbortController();
    fetch(p.film.source === "kitsu" ? `/api/anime?action=details&source=kitsu&id=${p.film.kitsu}` : p.film.source === "mal" || p.film.source === "jikan" ? `/api/anime?action=details&source=mal&id=${p.film.mal}` : `/api/catalog?action=details&type=${p.film.type}&id=${p.film.tmdb}`, {
      signal: ac.signal,
    })
      .then((r) => r.json())
      .then((d: any) => {
        if (d.film) {
          registerFilms([d.film]);
          setResolved(d.film);
        }
      })
      .catch(() => {});
    return () => ac.abort();
  }, [p.film.id]);
  useEffect(() => {
    if (tab !== "Episodios") return;
    if(f.source === "mal") {
      const count=f.episodeCount||0, start=(season-1)*20;
      setEpisodes(Array.from({length:Math.max(0,Math.min(20,count-start))},(_,i)=>({episode_number:start+i+1,name:`Episodio ${start+i+1}`,overview:"Seguimiento por número; esta fuente no proporciona una sinopsis del episodio."})));
      setMoreEpisodes(start+20<count);setLoading(false);return;
    }
    const ac = new AbortController();
    setLoading(true);
    fetch(f.source === "kitsu" ? `/api/anime?action=episodes&source=kitsu&id=${f.kitsu}&page=${season}` : `/api/catalog?action=season&type=tv&id=${f.tmdb}&season=${season}`, {
      signal: ac.signal,
    })
      .then((r) => r.json())
      .then((d: any) => {
        setEpisodes(d.episodes || []);
        setMoreEpisodes(!!d.hasNext);
        setLoading(false);
      })
      .catch(() => {
        if (!ac.signal.aborted) {
          setEpisodes([]);
          setLoading(false);
        }
      });
    return () => ac.abort();
  }, [f.id, season, tab]);
  useEffect(()=>{if(tab!=="Similares" || !f.tmdb)return;const ac=new AbortController();fetch(`/api/catalog?action=recommendations&type=${f.type}&id=${f.tmdb}`,{signal:ac.signal}).then(r=>r.ok?r.json() as Promise<{results:Film[]}>:null).then(d=>{if(!ac.signal.aborted&&d?.results){registerFilms(d.results);setRelated(d.results.slice(0,12));}}).catch(()=>{});return()=>ac.abort();},[f.id,f.tmdb,tab]);
  const markWatched=()=>p.saveItem(f.id,{status:"completed"},"Marcada como terminada");
  const toggleTop=()=>p.update(a=>({...a,top:a.top.includes(f.id)?a.top.filter(id=>id!==f.id):a.top.length<10?[...a.top,f.id]:a.top}));
  const share=async()=>{try{await navigator.clipboard.writeText(location.href);p.announce("Enlace copiado");}catch{p.announce("No se pudo copiar el enlace");}};
  return (
    <div className="details-page">
      <div
        className="detail-hero page-intro"
        style={{ backgroundColor: f.color + "25" }}
      >
        <img className="detail-backdrop" src={image(f, "backdrop")} alt="" />
        <div className="detail-shade" />
        <button className="back-link" onClick={() => p.navigate("explorar")}>
          <ArrowLeft size={17} />
          Volver a explorar
        </button>
        <div className="detail-content">
          <motion.div
            className="detail-poster"
            layoutId={`poster-catalog-${f.id}`}
          >
            <img src={image(f)} alt={`Póster de ${f.title}`} />
          </motion.div>
          <div>
            <p className="eyebrow">
              {f.category}{f.director !== "No disponible" && f.director !== "Por confirmar" ? ` / ${f.director}` : ""}
            </p>
            <h1>{f.title}</h1>
            {f.original && <p className="original-title">{f.original}</p>}
            <div className="hero-meta">
              <span>{f.year || "—"}</span>
              <i />
              <span>{f.duration}</span>
              <i />
              <span>{f.genre}</span>
            </div>
            <p className="detail-synopsis">{f.synopsis}</p>
            <div className="hero-buttons">
              {f.trailer && <Button primary onClick={() => p.setTrailer(f)}>
                <Play size={16} fill="currentColor" />
                Ver tráiler
              </Button>}
              <Button onClick={() => p.togglePlanned(f.id)}>
                {item ? <Check size={17} /> : <Plus size={17} />}{" "}
                {item ? "En mi biblioteca" : "Mi biblioteca"}
              </Button>
              <IconButton
                label={
                  item?.favorite
                    ? "Quitar de favoritas"
                    : "Marcar como favorita"
                }
                aria-pressed={!!item?.favorite}
                onClick={() => p.toggleFavorite(f.id)}
              >
                <Heart
                  size={18}
                  fill={item?.favorite ? "currentColor" : "none"}
                />
              </IconButton>
            </div>
            <div className="detail-rating">
              <span>
                <Star size={16} fill="currentColor" />
                <b>{f.score ? f.score.toFixed(1) : "—"}</b>
                <small>/ 10 en {providerName}</small>
              </span>
              <div className="rating-separator" />
              <span className="film-badge">
                {f.type === "tv" ? "SERIE" : "PELÍCULA"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="detail-body">
        <div className="detail-action-rail" aria-label="Acciones para esta historia">
          <button onClick={()=>p.saveItem(f.id,{status:"planned"},"Añadida a Por ver")}><Bookmark size={17}/>{item?.status==="planned"?"En Por ver":"Quiero verla"}</button>
          <button onClick={markWatched}><CheckCircle2 size={17}/>{item?.status==="completed"?"Ya la viste":"Ya la vi"}</button>
          <button onClick={()=>{if(!p.archive.top.includes(f.id)&&p.archive.top.length>=10){p.announce("Tu Top 10 está completo");return;}toggleTop();p.announce(p.archive.top.includes(f.id)?"Quitada del Top 10":"Añadida a tu Top 10");}}><Star size={17}/>{p.archive.top.includes(f.id)?"En mi Top 10":"Añadir al Top 10"}</button>
          <button onClick={()=>p.openMemory(f.id)}><PenLine size={17}/>Escribir recuerdo</button>
          <button onClick={share}><ArrowUpRight size={17}/>Compartir</button>
        </div>
        <div className="detail-tabs">
          {[
            "Información",
            ...(f.cast.length || f.director !== "No disponible" ? ["Reparto"] : []),
            ...(f.type === "tv" && f.source!=="jikan" ? ["Episodios"] : []),
            ...(f.characters?.length ? ["Personajes"] : []),
            "Similares",
            "Tráiler",
            "Reseñas",
            "Recuerdos",
          ].map((v) => (
            <button
              key={v}
              className={tab === v ? "active" : ""}
              onClick={() => setTab(v)}
            >
              {v}
            </button>
          ))}
        </div>
        {tab === "Información" ? (
          <div className="information-grid">
            <div>
              <h2>Detrás de la historia</h2>
              <dl className="facts">
                <div>
                  <dt>{f.type === "tv" ? "Creación" : "Dirección"}</dt>
                  <dd>{f.director}</dd>
                </div>
                <div>
                  <dt>Género</dt>
                  <dd>{f.genre}</dd>
                </div>
                <div>
                  <dt>País</dt>
                  <dd>{f.country}</dd>
                </div>
                {f.studio && (
                  <div>
                    <dt>Estudio</dt>
                    <dd>{f.studio}</dd>
                  </div>
                )}
                <div>
                  <dt>Estreno</dt>
                  <dd>{f.year || "—"}</dd>
                </div>
              </dl>
              {f.episodeCount != null && <p>{f.episodeCount} episodios · {f.airingStatus}</p>}
              {tvdb && <div className="source-facts"><p>TheTVDB · {tvdb.status}{tvdb.network ? ` · ${tvdb.network}` : ""}</p><a className="text-link" href={tvdb.sourceUrl} target="_blank" rel="noreferrer">Ver registro vinculado en TheTVDB <ExternalLink size={14}/></a></div>}
              {f.cast.length>0&&<><h2>Reparto principal</h2>
              <CastCards film={f} navigate={p.navigate}/></>}
              <a
                className="text-link"
                href={sourceLink(f)}
                target="_blank"
                rel="noreferrer"
              >
                Ver ficha en {providerName} <ExternalLink size={14} />
              </a>
            </div>
            <div className="personal-film-panel">
              <p className="eyebrow">ESTA HISTORIA Y TÚ</p>
              <h3>Un lugar en tu archivo.</h3>
              <label>
                Estado de visualización
                <select
                  aria-label="Estado de visualización"
                  value={item?.status || ""}
                  onChange={(e) =>
                    p.saveItem(
                      f.id,
                      { status: e.target.value },
                      "Estado actualizado",
                    )
                  }
                >
                  <option value="" disabled>
                    Elegir estado
                  </option>
                  {Object.entries(statuses).map(([key, name]) => (
                    <option key={key} value={key}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Tu calificación
                <div className="star-rating">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <button
                      key={n}
                      title={`${n} de 10`}
                      aria-label={`Calificar con ${n} de 10`}
                      aria-pressed={item?.rating === n}
                      onClick={() =>
                        p.saveItem(
                          f.id,
                          { rating: n },
                          `Tu calificación: ${n}/10`,
                        )
                      }
                    >
                      <Star
                        size={16}
                        fill={
                          n <= (item?.rating || 0) ? "currentColor" : "none"
                        }
                      />
                    </button>
                  ))}
                </div>
                <small>
                  {item?.rating
                    ? `${item.rating} de 10 · Tu mirada también cuenta.`
                    : "Todavía no la has calificado."}
                </small>
              </label>
              <Button onClick={() => p.openMemory(f.id)}>
                <PenLine size={16} />
                Escribir un recuerdo
              </Button>
              <label>Guardar en una colección
                <select value="" onChange={e=>{const collectionId=e.target.value;if(!collectionId)return;p.update(a=>({...a,collections:a.collections.map(c=>c.id===collectionId?{...c,films:c.films.includes(f.id)?c.films:[...c.films,f.id]}:c)}));p.announce("Añadida a tu colección");}}>
                  <option value="">{p.archive.collections.length?"Elige una colección":"Crea una colección desde Biblioteca"}</option>
                  {p.archive.collections.map(c=><option key={c.id} value={c.id} disabled={c.films.includes(f.id)}>{c.name}</option>)}
                </select>
              </label>
              <label>Recordarme esta historia<input aria-label="Fecha de recordatorio" type="date" value={item?.reminder||""} onChange={e=>p.saveItem(f.id,{reminder:e.target.value},e.target.value?"Recordatorio guardado":"Recordatorio eliminado")}/></label>
              <div className="where-to-watch">
                <Globe size={20} />
                <h4>¿Dónde verla?</h4>
                <p>{animeProvider ? `Consulta la ficha original en ${providerName}; la fuente no incluye disponibilidad por plataforma.` : "Consulta las opciones legales y su disponibilidad actual en tu región."}</p>
                <a
                  href={animeProvider ? sourceLink(f) : `https://www.themoviedb.org/${f.type}/${f.tmdb}/watch?locale=${p.archive.settings.country}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {animeProvider ? "Ver ficha original" : "Consultar plataformas"} <ArrowUpRight size={15} />
                </a>
                <small>{animeProvider ? `Información de ${providerName}` : "Disponibilidad por JustWatch / TMDB"}</small>
              </div>
            </div>
          </div>
        ) : tab === "Personajes" ? (
          <><h2>Personajes de esta historia</h2><div className="character-grid">{f.characters?.map(c=><article key={c.id}>{c.photo&&<img src={c.photo} alt={c.name} loading="lazy"/>}<h3>{c.name}</h3><details><summary>Descripción · puede contener spoilers</summary><p>{c.description||"La fuente no incluye una descripción."}</p></details></article>)}</div><small>Personajes e imágenes de Kitsu.</small></>
        ) : tab === "Reparto" ? (
          <>
            <h2>Las personas detrás de la historia</h2>
            <CastCards film={f} full navigate={p.navigate}/>
          </>
        ) : tab === "Similares" ? (
          <FilmRow
            {...p}
            context="similar"
            ids={(related.length?related:films
              .filter(
                (v) =>
                  v.id !== f.id &&
                  (v.genre === f.genre || v.director === f.director),
              )
              .slice(0, 6))
              .map((v) => v.id)}
          />
        ) : tab === "Tráiler" ? (
          <div className="detail-trailer-panel"><h2>Un vistazo a la historia</h2>{f.trailer?<div className="trailer-frame"><iframe src={`https://www.youtube-nocookie.com/embed/${f.trailer}?rel=0`} title={`Tráiler de ${f.title}`} allowFullScreen/></div>:<div className="empty-state"><Play/><p>Esta fuente todavía no ofrece un tráiler para {f.title}.</p><a className="btn" href={sourceLink(f)} target="_blank" rel="noreferrer">Ver ficha oficial <ExternalLink size={14}/></a></div>}</div>
        ) : tab === "Reseñas" ? (
          <TitleReviews filmId={f.id} filmTitle={f.title} userId={p.userId} displayName={p.archive.profile.name}
            personalRating={item?.rating} onLogin={() => p.navigate("login")}
            onRated={rating => p.saveItem(f.id, { rating }, "Reseña publicada y nota guardada")} />
        ) : tab === "Recuerdos" ? (
          <>
            <SectionHeading
              title="Lo que esta historia dejó en ti"
              action="Nuevo recuerdo"
              onAction={() => p.openMemory(f.id)}
            />
            {p.archive.memories.filter((m) => m.film === f.id).length ? (
              <div className="memory-grid">
                {p.archive.memories
                  .filter((m) => m.film === f.id)
                  .map((m) => (
                    <MemoryCard
                      key={m.id}
                      memory={m}
                      onEdit={() => p.navigate("recuerdos")}
                    />
                  ))}
              </div>
            ) : (
              <div className="empty-state">
                <BookOpen />
                <h3>La película termina. El recuerdo empieza.</h3>
                <p>Conserva lo que sentiste al ver {f.title}.</p>
                <Button onClick={() => p.openMemory(f.id)}>
                  Escribir un recuerdo
                </Button>
              </div>
            )}
          </>
        ) : (
          <div>
            <div className="episode-toolbar">
              <h2>{(f.source === "kitsu" || f.source === "mal") ? "Episodios · página " + season : "Temporadas y episodios"}</h2>
              <select
                value={season}
                onChange={(e) => setSeason(Number(e.target.value))}
                aria-label="Temporada"
              >
                {Array.from({ length: (f.source === "kitsu" || f.source === "mal") ? Math.max(season + (moreEpisodes ? 1 : 0), Math.ceil((f.episodeCount || 1)/20)) : f.seasons || 1 }, (_, i) => (
                  <option value={i + 1} key={i}>
                    {(f.source === "kitsu" || f.source === "mal") ? "Página" : "Temporada"} {i + 1}
                  </option>
                ))}
              </select>
            </div>
            {loading ? (
              <div className="loading">
                <LoaderCircle className="spin" />
                Buscando episodios...
              </div>
            ) : episodes.length ? (
              <div className="episode-list">
                {episodes.map((e) => {
                  const code = (f.source === "kitsu" || f.source === "mal") ? `${f.source}-${e.episode_number}` : `${season}-${e.episode_number}`,
                    done = item?.episodes?.includes(code);
                  return (
                    <div key={code}>
                      <span className="episode-number">{e.episode_number}</span>
                      <div>
                        <b>{e.name}</b>
                        <p>{e.overview || "Sin sinopsis disponible."}</p>
                      </div>
                      <button
                        className={`episode-check ${done ? "done" : ""}`}
                        aria-label={`${done ? "Marcar pendiente" : "Marcar visto"}: ${e.name}`}
                        aria-pressed={!!done}
                        onClick={() =>
                          p.saveItem(
                            f.id,
                            {
                              status: "watching",
                              episodes: done
                                ? item?.episodes?.filter((v) => v !== code)
                                : [...(item?.episodes || []), code],
                            },
                            done
                              ? "Episodio pendiente"
                              : "Episodio marcado como visto",
                          )
                        }
                      >
                        {done ? <Check /> : <Plus />}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <Tv />
                <h3>Consulta el listado completo de episodios</h3>
                <p>
                  No hay episodios disponibles en la fuente en este momento.
                </p>
                <a
                  className="btn"
                  href={sourceLink(f)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Consultar fuente <ExternalLink size={15} />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LibraryPage(p: Common & { favorites?: boolean }) {
  const [filter, setFilter] = useState(p.favorites ? "Favoritos" : "Todas"),
    [view, setView] = useState("grid"),
    [q, setQ] = useState(""),
    [category, setCategory] = useState("Todo"),
    [sort, setSort] = useState("added");
  const data = films
    .filter((f) => {
      const item = p.archive.library[f.id];
      return (
        item &&
        matches(f, q) &&
        categoryFits(f, category) &&
        (filter === "Todas" ||
          (filter === "Favoritos" && item.favorite) ||
          item.status === filter)
      );
    })
    .sort((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title)
        : sort === "rating"
          ? (p.archive.library[b.id].rating || 0) -
            (p.archive.library[a.id].rating || 0)
          : sort === "year"
            ? b.year - a.year
            : p.archive.library[b.id].added.localeCompare(
                p.archive.library[a.id].added,
              ),
    );
  const remove = (id: string) => {
    p.update((a) => {
      const library = { ...a.library };
      delete library[id];
      return { ...a, library };
    });
    p.announce(
      "Historia eliminada de tu biblioteca. Tus recuerdos y Tops se conservan.",
    );
  };
  return (
    <div className="standard-page">
      <section className="page-heading page-intro">
        <p className="eyebrow">UN ARCHIVO QUE SOLO PODRÍAS CREAR TÚ</p>
        <h1>
          Mi biblioteca<span>.</span>
        </h1>
        <p>Todas tus historias, en un solo lugar.</p>
      </section>
      <div className="library-stats">
        <div>
          <b>{Object.keys(p.archive.library).length}</b>
          <span>En tu archivo</span>
        </div>
        <div>
          <b>
            {
              Object.values(p.archive.library).filter(
                (i) => i.status === "completed",
              ).length
            }
          </b>
          <span>Historias vividas</span>
        </div>
        <div>
          <b>
            {Object.values(p.archive.library).filter((i) => i.favorite).length}
          </b>
          <span>Favoritas</span>
        </div>
        <div>
          <b>
            {
              Object.values(p.archive.library).filter(
                (i) => i.status === "planned",
              ).length
            }
          </b>
          <span>Por descubrir</span>
        </div>
      </div>
      <div className="library-tabs chips">
        {[
          ["Todas", "Todas"],
          ["watching", "Viendo"],
          ["planned", "Por ver"],
          ["completed", "Terminadas"],
          ["Favoritos", "Favoritos"],
          ["paused", "En pausa"],
          ["dropped", "Abandonadas"],
        ].map(([v, label]) => (
          <button
            key={v}
            className={`chip ${filter === v ? "active" : ""}`}
            onClick={() => setFilter(v)}
          >
            {v === "Favoritos" && <Heart size={13} />} {label}
          </button>
        ))}
      </div>
      <div className="library-tools">
        <div className="mini-search">
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar en mi biblioteca"
            aria-label="Buscar en mi biblioteca"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Tipo de contenido"
        >
          {cats.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Ordenar biblioteca"
        >
          <option value="added">Últimas añadidas</option>
          <option value="title">Título A–Z</option>
          <option value="rating">Mi calificación</option>
          <option value="year">Año de estreno</option>
        </select>
        <div className="view-toggle">
          <IconButton
            label="Vista de cuadrícula"
            aria-pressed={view === "grid"}
            onClick={() => setView("grid")}
          >
            <Grid2X2 size={17} />
          </IconButton>
          <IconButton
            label="Vista de lista"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            <List size={18} />
          </IconButton>
        </div>
      </div>
      <p className="muted result-count">
        {data.length} historias en esta vista
      </p>
      {data.length ? (
        view === "grid" ? (
          <div className="poster-grid catalog-grid">
            {data.map((f) => (
              <div key={f.id}>
                <Poster {...p} film={f} context="library" />
                <div className="library-card-status">
                  <span
                    className={`status-dot ${p.archive.library[f.id].status}`}
                  />
                  <select
                    value={p.archive.library[f.id].status}
                    onChange={(e) =>
                      p.saveItem(
                        f.id,
                        { status: e.target.value },
                        "Estado actualizado",
                      )
                    }
                    aria-label={`Estado de ${f.title}`}
                  >
                    {Object.entries(statuses).map(([v, n]) => (
                      <option key={v} value={v}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => remove(f.id)}
                    aria-label={`Eliminar ${f.title} de biblioteca`}
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="library-list">
            {data.map((f) => (
              <div key={f.id}>
                <button
                  className="library-list-film"
                  onClick={() => p.openFilm(f)}
                >
                  <img src={image(f)} alt="" />
                  <span>
                    <b>{f.title}</b>
                    <small>
                      {f.year || "—"} · {f.genre}
                    </small>
                  </span>
                </button>
                <span className="list-rating">
                  <Star size={13} />
                  {p.archive.library[f.id].rating || "—"}
                </span>
                <select
                  value={p.archive.library[f.id].status}
                  onChange={(e) =>
                    p.saveItem(
                      f.id,
                      { status: e.target.value },
                      "Estado actualizado",
                    )
                  }
                  aria-label={`Estado de ${f.title}`}
                >
                  {Object.entries(statuses).map(([v, n]) => (
                    <option key={v} value={v}>
                      {n}
                    </option>
                  ))}
                </select>
                <IconButton
                  label={`Favorito: ${f.title}`}
                  onClick={() => p.toggleFavorite(f.id)}
                >
                  <Heart
                    size={16}
                    fill={
                      p.archive.library[f.id].favorite ? "currentColor" : "none"
                    }
                  />
                </IconButton>
                <IconButton
                  label={`Eliminar ${f.title}`}
                  onClick={() => remove(f.id)}
                >
                  <Trash2 size={16} />
                </IconButton>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="empty-state">
          <Library size={32} />
          <h2>Hay espacio para otra gran historia.</h2>
          <p>Explora el catálogo y empieza a construir tu archivo.</p>
          <Button onClick={() => p.navigate("explorar")}>
            Más informacións <ArrowRight size={15} />
          </Button>
        </div>
      )}
      <Collections {...p} />
    </div>
  );
}

function Collections(p: Common) {
  const [open, setOpen] = useState(false),
    [name, setName] = useState(""),
    [selected, setSelected] = useState<string[]>([]),
    [edit, setEdit] = useState<string | null>(null);
  return (
    <section className="content-section">
      <SectionHeading
        title="Mis colecciones"
        action="Crear colección"
        onAction={() => {
          setName("");
          setSelected([]);
          setEdit(null);
          setOpen(true);
        }}
      />
      <div className="user-collections">
        {p.archive.collections.map((c) => (
          <button
            className="user-collection"
            key={c.id}
            onClick={() => {
              setName(c.name);
              setSelected(c.films);
              setEdit(c.id);
              setOpen(true);
            }}
          >
            <div className="collection-stack">
              {c.films.slice(0, 3).map((id) => (
                <img src={image(getFilm(id))} alt="" key={id} />
              ))}
              {!c.films.length && <Library size={30} />}
            </div>
            <div>
              <h3>{c.name}</h3>
              <p>{c.films.length} historias · Colección privada</p>
            </div>
            <ArrowUpRight size={19} />
          </button>
        ))}
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={edit ? "Editar colección" : "Una nueva colección"}
      >
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            const c = {
              id: edit || crypto.randomUUID(),
              name: name.trim(),
              films: selected,
            };
            p.update((a) => ({
              ...a,
              collections: edit
                ? a.collections.map((v) => (v.id === edit ? c : v))
                : [...a.collections, c],
            }));
            setOpen(false);
            p.announce("Colección guardada");
          }}
        >
          <label>
            Nombre de la colección
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={70}
              placeholder="Historias para un día de lluvia"
            />
          </label>
          <p className="muted">Elige las historias que la hacen especial.</p>
          <div className="collection-picker">
            {films.map((f) => (
              <label key={f.id}>
                <input
                  type="checkbox"
                  checked={selected.includes(f.id)}
                  onChange={(e) =>
                    setSelected((v) =>
                      e.target.checked
                        ? [...v, f.id]
                        : v.filter((id) => id !== f.id),
                    )
                  }
                />
                <img src={image(f)} alt="" />
                <span>{f.title}</span>
              </label>
            ))}
          </div>
          <div className="form-actions">
            {edit && (
              <Button
                type="button"
                onClick={() => {
                  p.update((a) => ({
                    ...a,
                    collections: a.collections.filter((v) => v.id !== edit),
                  }));
                  setOpen(false);
                  p.announce("Colección eliminada");
                }}
              >
                <Trash2 size={15} />
                Eliminar
              </Button>
            )}
            <Button primary type="submit">
              Guardar colección <Check size={16} />
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

function Tops(p: Common) {
  const [add, setAdd] = useState(false),
    [pick, setPick] = useState(""),
    [dragged, setDragged] = useState<string | null>(null);
  const move = (id: string, delta: number) => {
    p.update((a) => {
      const arr = [...a.top],
        i = arr.indexOf(id),
        j = i + delta;
      if (j < 0 || j >= arr.length) return a;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...a, top: arr };
    });
  };
  return (
    <div className="standard-page">
      <section className="page-heading page-intro">
        <p className="eyebrow">TU MIRADA. TU ORDEN.</p>
        <h1>
          Mis tops<span>.</span>
        </h1>
        <p>No son las mejores de todos. Son las que más significan para ti.</p>
      </section>
      <div className="tops-toolbar">
        <div>
          <span className="pill">MI TOP PERSONAL</span>
          <span className="muted">{p.archive.top.length} / 10 historias</span>
        </div>
        <Button
          onClick={() => {
            setPick(films.find((f) => !p.archive.top.includes(f.id))?.id || "");
            setAdd(true);
          }}
          disabled={p.archive.top.length >= 10}
        >
          <Plus size={16} />
          Añadir historia
        </Button>
      </div>
      <p className="sort-hint">
        <GripVertical size={16} />
        Arrastra para ordenar o utiliza las flechas de cada historia.
      </p>
      <div className="ranking-list">
        {p.archive.top.map((id, i) => {
          const f = getFilm(id);
          return (
            <motion.div
              layout
              key={id}
              draggable
              onDragStart={() => setDragged(id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (!dragged || dragged === id) return;
                p.update((a) => {
                  const top = [...a.top];
                  top.splice(top.indexOf(dragged), 1);
                  top.splice(i, 0, dragged);
                  return { ...a, top };
                });
                setDragged(null);
                p.announce("Tu Top tiene un nuevo orden.");
              }}
              className={`ranking-item ${dragged === id ? "dragging" : ""}`}
            >
              <GripVertical className="drag-handle" size={18} />
              <span className="ranking-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <button className="ranking-film" onClick={() => p.openFilm(f)}>
                <img src={image(f)} alt="" />
                <span>
                  <h3>{f.title}</h3>
                  <p>
                    {f.year || "—"} · {f.director}
                  </p>
                  <small>{f.genre}</small>
                </span>
              </button>
              <div className="ranking-note">
                <Star size={14} fill="currentColor" />
                {p.archive.library[id]?.rating || f.score}
                <small>
                  {p.archive.library[id]?.rating ? "TU NOTA" : "TMDB"}
                </small>
              </div>
              <div className="ranking-controls">
                <IconButton
                  label={`Subir ${f.title}`}
                  disabled={i === 0}
                  onClick={() => move(id, -1)}
                >
                  <ArrowUp size={16} />
                </IconButton>
                <IconButton
                  label={`Bajar ${f.title}`}
                  disabled={i === p.archive.top.length - 1}
                  onClick={() => move(id, 1)}
                >
                  <ArrowDown size={16} />
                </IconButton>
              </div>
              <IconButton
                label={`Quitar ${f.title} del Top`}
                onClick={() => {
                  p.update((a) => ({
                    ...a,
                    top: a.top.filter((v) => v !== id),
                  }));
                  p.announce("Historia eliminada de tu Top");
                }}
              >
                <X size={16} />
              </IconButton>
            </motion.div>
          );
        })}
      </div>
      {!p.archive.top.length && (
        <div className="empty-state">
          <ChartNoAxesColumn />
          <h2>Una lista tan única como tu mirada.</h2>
          <p>Añade tu primera historia para empezar tu Top personal.</p>
        </div>
      )}
      <Modal
        open={add}
        onClose={() => setAdd(false)}
        title="Una historia para tu Top"
      >
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!pick) return;
            p.update((a) => ({
              ...a,
              top:
                a.top.includes(pick) || a.top.length >= 10
                  ? a.top
                  : [...a.top, pick],
            }));
            setAdd(false);
            p.announce("Historia añadida a tu Top");
          }}
        >
          <label>
            Elige una historia
            <select value={pick} onChange={(e) => setPick(e.target.value)}>
              {films
                .filter((f) => !p.archive.top.includes(f.id))
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title} ({f.year || "—"})
                  </option>
                ))}
            </select>
          </label>
          <Button primary type="submit">
            Añadir a mi Top <Plus size={16} />
          </Button>
        </form>
      </Modal>
      <Collections {...p} />
    </div>
  );
}

function MemoryCard({
  memory: m,
  onEdit,
  onDelete,
}: {
  memory: Memory;
  onEdit: () => void;
  onDelete?: () => void;
}) {
  const f = getFilm(m.film);
  return (
    <article className="memory-card">
      <button className="memory-image" onClick={onEdit}>
        <img
          src={m.photo || image(f, "backdrop")}
          alt={m.photo ? "Fotografía de tu recuerdo" : f.title}
          loading="lazy"
        />
        <span>{m.emotion}</span>
      </button>
      <div className="memory-card-copy">
        <p className="memory-date">{dateLabel(m.date)}</p>
        <h3>{m.title}</h3>
        <p className="memory-text">{m.text}</p>
        <div className="memory-film">
          <img src={image(f)} alt="" />
          <span>
            {f.title}
            <small>
              {f.year || "—"}
              {m.people ? ` · Con ${m.people}` : ""}
            </small>
          </span>
          {m.rating > 0 && (
            <span>
              <Star size={11} />
              {m.rating}
            </span>
          )}
        </div>
        <div className="memory-card-actions">
          <button onClick={onEdit}>
            <PenLine size={13} />
            Editar recuerdo
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              aria-label={`Eliminar recuerdo ${m.title}`}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
function Memories(p: Common & { onEdit: (m: Memory) => void }) {
  const [view, setView] = useState("archive"),
    [category, setCategory] = useState("Todo");
  const data = [...p.archive.memories]
    .filter((m) => categoryFits(getFilm(m.film), category))
    .sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="standard-page memories-page">
      <section className="page-heading page-intro">
        <div>
          <p className="eyebrow">EL ARCHIVO PERSONAL</p>
          <h1>
            Mis recuerdos<span>.</span>
          </h1>
          <p>Las historias también viven en nosotros.</p>
        </div>
        <Button primary onClick={() => p.openMemory()}>
          <Plus size={16} />
          Nuevo recuerdo
        </Button>
      </section>
      <div className="memory-toolbar">
        <div className="chips">
          {cats.map((c) => (
            <button
              className={`chip ${category === c ? "active" : ""}`}
              key={c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="view-toggle">
          <button
            aria-pressed={view === "archive"}
            onClick={() => setView("archive")}
          >
            <Grid2X2 size={15} />
            Archivo
          </button>
          <button
            aria-pressed={view === "timeline"}
            onClick={() => setView("timeline")}
          >
            <CalendarDays size={15} />
            Línea temporal
          </button>
        </div>
      </div>
      {data.length ? (
        <div className={view === "archive" ? "memory-grid" : "memory-timeline"}>
          {data.map((m) => (
            <div key={m.id}>
              {view === "timeline" && (
                <p className="timeline-date">
                  <span />
                  {dateLabel(m.date)}
                </p>
              )}
              <MemoryCard
                memory={m}
                onEdit={() => p.onEdit(m)}
                onDelete={() => {
                  p.update((a) => ({
                    ...a,
                    memories: a.memories.filter((v) => v.id !== m.id),
                  }));
                  p.announce("Recuerdo eliminado de tu archivo");
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="memory-empty">
          <img src={image(getFilm("interstellar"), "backdrop")} alt="" />
          <div>
            <span className="memory-empty-star">✳</span>
            <p className="eyebrow">UN ESPACIO PARA LO QUE IMPORTA</p>
            <h2>
              ¿Recuerdas cómo
              <br />
              te hizo <em>sentir?</em>
            </h2>
            <p>
              Una película. Un lugar. Alguien a tu lado.
              <br />
              Empieza por ese instante que no quieres olvidar.
            </p>
            <Button primary onClick={() => p.openMemory()}>
              <PenLine size={16} />
              Escribir mi primer recuerdo
            </Button>
            <small>
              <Lock size={12} />
              Tus recuerdos son privados.
            </small>
          </div>
        </div>
      )}
      <p className="journal-end">
        No recordamos todas las escenas. Recordamos lo que nos hicieron sentir.
      </p>
    </div>
  );
}

function MemoryEditor({
  open,
  onClose,
  filmId,
  existing,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  filmId: string;
  existing: Memory | null;
  onSave: (m: Memory) => void;
}) {
  const [id, setId] = useState(filmId),
    [title, setTitle] = useState(""),
    [text, setText] = useState(""),
    [date, setDate] = useState(today()),
    [emotion, setEmotion] = useState("Nostalgia"),
    [people, setPeople] = useState(""),
    [rating, setRating] = useState(0),
    [photo, setPhoto] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    setId(existing?.film || filmId);
    setTitle(existing?.title || "");
    setText(existing?.text || "");
    setDate(existing?.date || today());
    setEmotion(existing?.emotion || "Nostalgia");
    setPeople(existing?.people || "");
    setRating(existing?.rating || 0);
    setPhoto(existing?.photo || "");
    setError("");
  }, [open, filmId, existing]);
  const loadPhoto = async (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Elige una fotografía JPG, PNG o WebP.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Elige una imagen de menos de 8 MB.");
      return;
    }
    try {
      const url = URL.createObjectURL(file),
        img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
      });
      const canvas = document.createElement("canvas");
      const ratio = Math.min(1, 1200 / img.width, 1200 / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      canvas
        .getContext("2d")!
        .drawImage(img, 0, 0, canvas.width, canvas.height);
      setPhoto(canvas.toDataURL("image/jpeg", 0.75));
      URL.revokeObjectURL(url);
      setError("");
    } catch {
      setError("No se pudo abrir esa imagen. Prueba con otra fotografía.");
    }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existing ? "Volver a ese instante" : "Un recuerdo para tu archivo"}
      wide
    >
      <form
        className="form memory-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim() || !text.trim()) {
            setError("Escribe un título y algo que quieras recordar.");
            return;
          }
          onSave({
            id: existing?.id || crypto.randomUUID(),
            film: id,
            title: title.trim(),
            text: text.trim(),
            date,
            emotion,
            people: people.trim(),
            rating,
            photo: photo || undefined,
          });
        }}
      >
        <div className="form-two">
          <label>
            La historia
            <select value={id} onChange={(e) => setId(e.target.value)}>
              {films.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Cuándo la viste
            <input
              type="date"
              required
              max={today()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
        </div>
        <label>
          Un título para este instante
          <input
            required
            maxLength={100}
            placeholder="Aquella noche en la que miramos las estrellas"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label>
          Lo que se quedó contigo
          <textarea
            required
            maxLength={6000}
            rows={5}
            placeholder="¿Dónde estabas? ¿Con quién? ¿Qué te hizo sentir? Este espacio es solo tuyo."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <div className="form-two">
          <label>
            La emoción
            <select
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
            >
              {[
                "Nostalgia",
                "Asombro",
                "Alegría",
                "Esperanza",
                "Tristeza",
                "Inspiración",
                "Amor",
                "Inquietud",
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            Con quién (opcional)
            <input
              placeholder="Conmigo, con alguien especial..."
              value={people}
              maxLength={120}
              onChange={(e) => setPeople(e.target.value)}
            />
          </label>
        </div>
        <div className="form-two">
          <label>
            Tu calificación
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              <option value={0}>Sin calificar</option>
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1} / 10
                </option>
              ))}
            </select>
          </label>
          <label className="photo-input">
            Una fotografía (opcional)
            <span>
              <Camera size={17} />
              {photo ? "Cambiar fotografía" : "Elegir fotografía"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => loadPhoto(e.target.files?.[0])}
              />
            </span>
          </label>
        </div>
        {photo && (
          <div className="photo-preview">
            <img src={photo} alt="Fotografía seleccionada" />
            <IconButton label="Quitar fotografía" onClick={() => setPhoto("")}>
              <X size={17} />
            </IconButton>
          </div>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <small>
            <Lock size={12} />
            Solo para ti. Siempre.
          </small>
          <Button primary type="submit">
            Guardar recuerdo <Check size={16} />
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function Profile(p: Common & {userId?:string}) {
  const [editing, setEditing] = useState(false);
  const items = Object.entries(p.archive.library),
    favorites = films.filter((f) => p.archive.library[f.id]?.favorite);
  const stats = [
    [
      "Películas",
      items.filter(([id]) => getFilm(id).category === "Películas").length,
    ],
    [
      "Series",
      items.filter(([id]) => getFilm(id).category === "Series").length,
    ],
    ["Anime", items.filter(([id]) => getFilm(id).category === "Anime").length],
    [
      "K-Dramas",
      items.filter(([id]) => getFilm(id).category === "K-dramas").length,
    ],
    ["Favoritos", favorites.length],
    ["Tops", p.archive.top.length],
    ["Recuerdos", p.archive.memories.length],
  ];
  const startEdit = () => setEditing(true);
  return (
    <div className="standard-page profile-reference" style={{"--profile-accent": p.archive.profile.accent || "#e4e4e7", backgroundImage: p.archive.profile.background ? `linear-gradient(#050608df,#050608ed),url(${p.archive.profile.background})` : undefined} as React.CSSProperties}>
      <section className="profile-hero page-intro" style={{backgroundImage:p.archive.profile.banner ? `linear-gradient(0deg,#050608ee,#05060822),url(${p.archive.profile.banner})` : undefined}}>
        <div className="profile-head">
          <div className="avatar profile-avatar">
            {p.archive.profile.avatar ? <img className="avatar-photo" src={p.archive.profile.avatar} alt="Tu foto de perfil"/> : <UserRound size={20}/>}
          </div>
          <div>
            <h1>{p.archive.profile.name}</h1>
            {p.archive.profile.handle && <span className="profile-handle">@{p.archive.profile.handle}</span>}
            <p>
              {p.archive.profile.bio}
              {p.archive.profile.location && <><br/>{p.archive.profile.location}</>}
            </p>
          </div>
          <Button onClick={startEdit}>Editar perfil</Button>
        </div>
      </section>
      <button className="btn" onClick={()=>p.navigate("actividad")}><ChartNoAxesColumn size={16}/>Ver mi actividad y resumen anual</button>
      <div className="chips">{p.archive.profile.genres?.map(g=><span className="chip" key={g}>{g}</span>)}</div>
      <PublishProfile archive={p.archive} userId={p.userId} navigate={p.navigate}/>
      <div className="profile-ref-stats">
        {stats.map(([label, count]) => (
          <div key={String(label)}>
            <b>{count}</b>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <section className="content-section">
        <SectionHeading
          title="Favoritos"
          action="Ver todos"
          onAction={() => p.navigate("biblioteca")}
        />
        {favorites.length ? (
          <div className="poster-grid">
            {favorites.slice(0, 6).map((f) => (
              <Poster key={f.id} film={f} {...p} context="profile" />
            ))}
          </div>
        ) : (
          <div className="profile-memory-empty">
            <Heart size={20} />
            Aquí vivirán tus historias favoritas.
            <Button onClick={() => p.navigate("explorar")}>Explorar</Button>
          </div>
        )}
      </section>
      <section className="content-section">
        <SectionHeading
          title="Tops"
          action="Ver todos"
          onAction={() => p.navigate("tops")}
        />
        {p.archive.top.length ? <div className="profile-tops-grid">
          {(["Películas","Series","Anime","K-dramas"] as const).map(category=>{
            const ranked=p.archive.top.map(getFilm).filter(f=>f.category===category);
            return ranked.length ? <button key={category} onClick={() => p.navigate("tops")}>
              <img src={image(ranked[0],"backdrop")} alt="" />
              <h3>Mi Top {category}</h3><p>{ranked.length} {ranked.length===1?"título":"títulos"}</p>
            </button> : null;
          })}
        </div> : <div className="profile-memory-empty"><Star size={20}/><span>Tu primer top empieza con una historia que te haya marcado.</span><Button onClick={()=>p.navigate("tops")}>Crear un top</Button></div>}
      </section>
      <section className="content-section">
        <SectionHeading
          title="Recuerdos"
          action="Ver todos"
          onAction={() => p.navigate("recuerdos")}
        />
        {p.archive.memories.length ? (
          <div className="memory-grid">
            {p.archive.memories.slice(0, 3).map((m) => (
              <MemoryCard
                key={m.id}
                memory={m}
                onEdit={() => p.navigate("recuerdos")}
              />
            ))}
          </div>
        ) : (
          <div className="profile-memory-empty">
            <BookOpen size={20} />
            <span>Guarda lo que viste. Recuerda lo que sentiste.</span>
            <Button onClick={() => p.openMemory()}>
              <Plus size={14} />
              Crear recuerdo
            </Button>
          </div>
        )}
      </section>
      <section className="content-section">
        <SectionHeading
          title="Mis cuatro historias"
          action="Editar"
          onAction={startEdit}
        />
        <div className="four-stories">
          {p.archive.profile.four.map((id, i) => {
            const f = getFilm(id);
            return (
              <button onClick={() => p.openFilm(f)} key={i}>
                <img src={image(f)} alt={f.title} />
                <div>
                  <h3>{f.title}</h3>
                  <p>{f.year || "—"}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title="Editar perfil"
        wide
      >
        <ProfileEditor profile={p.archive.profile} onSave={profile => {p.update(a=>({...a,profile}));setEditing(false);p.announce("Perfil actualizado");}}/>

      </Modal>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <div className="setting-row">
      <span>
        <b>{label}</b>
        <p>{description}</p>
      </span>
      <button
        className={`switch ${checked ? "on" : ""}`}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  );
}
function SettingsOverview(
  p: Common & {
    user: { id: string; email?: string } | null;
    setSection: (s: string) => void;
    onAuth: () => void;
  },
) {
  const rows = [
    {
      icon: UserRound,
      title: "Cuenta",
      description: "Tu información personal y seguridad",
      section: "Cuenta",
    },
    {
      icon: Bell,
      title: "Notificaciones",
      description: "Gestiona las novedades de tu archivo",
      section: "Notificaciones",
    },
    {
      icon: Globe,
      title: "Idioma",
      value: "Español (Latinoamérica)",
      section: "Idioma",
    },
    { icon: Monitor, title: "Tema", value: p.archive.settings.visualTheme === "storybook" ? "Bosque animado" : p.archive.settings.visualTheme === "kdrama" ? "K-drama" : "Cine nocturno", section: "Apariencia" },
    {
      icon: FilmIcon,
      title: "Reproducción de video",
      value: "Archivos propios",
      section: "Reproducción",
    },
    {
      icon: Lock,
      title: "Privacidad y datos",
      description: "Gestiona tu privacidad y descarga tus datos",
      section: "Privacidad y datos",
    },
    {
      icon: Download,
      title: "Descargas",
      description: "Exporta y conserva una copia de tu archivo",
      section: "Privacidad y datos",
    },
    {
      icon: Info,
      title: "Ayuda",
      description: "Acerca de AFTERSCENE y fuentes del catálogo",
      section: "Acerca de",
    },
  ];
  return (
    <div className="standard-page settings-reference">
      <section className="page-heading page-intro">
        <h1>Configuración</h1>
        <p>Personaliza tu experiencia en AFTERSCENE</p>
      </section>
      <div className="settings-reference-list">
        {rows.slice(0, 5).map((r) => (
          <button
            className="settings-reference-row"
            key={r.title}
            onClick={() => p.setSection(r.section)}
          >
            <r.icon size={21} />
            <span>
              <b>{r.title}</b>
              {r.description && <p>{r.description}</p>}
            </span>
            {r.value && <small>{r.value}</small>}
            <ChevronRight size={16} />
          </button>
        ))}
        <div className="settings-reference-row">
          <Play size={21} />
          <span>
            <b>Reproducción automática</b>
            <p>Rotar las historias destacadas automáticamente</p>
          </span>
          <button
            role="switch"
            className={`switch ${p.archive.settings.autoplay ? "on" : ""}`}
            aria-label="Reproducción automática"
            aria-checked={p.archive.settings.autoplay}
            onClick={() =>
              p.update((a) => ({
                ...a,
                settings: { ...a.settings, autoplay: !a.settings.autoplay },
              }))
            }
          >
            <span />
          </button>
        </div>
        {rows.slice(5).map((r) => (
          <button
            className="settings-reference-row"
            key={r.title}
            onClick={() => p.setSection(r.section)}
          >
            <r.icon size={21} />
            <span>
              <b>{r.title}</b>
              {r.description && <p>{r.description}</p>}
            </span>
            <ChevronRight size={16} />
          </button>
        ))}
        <button
          className={`settings-reference-row ${p.user ? "danger" : ""}`}
          onClick={async () => {
            if (p.user) {
              const c = await getSupabase();
              await c?.auth.signOut();
              p.announce("Sesión cerrada");
            } else p.onAuth();
          }}
        >
          {p.user ? <LogOut size={21} /> : <UserRound size={21} />}
          <span>
            <b>{p.user ? "Cerrar sesión" : "Iniciar sesión"}</b>
            {!p.user && (
              <p>Conecta tu cuenta o continúa con tu archivo local</p>
            )}
          </span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function SettingsPage(
  p: Common & {
    user: { id: string; email?: string } | null;
    cloudEnabled: boolean;
    syncError: boolean;
    onAuth: () => void;
  },
) {
  const [section, setSection] = useState("General"),
    [importError, setImportError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const exportArchive = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            version: 1,
            exportedAt: new Date().toISOString(),
            archive: p.archive,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `afterscene-archivo-${today()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    p.announce("Tu archivo está listo para llevarlo contigo.");
  };
  const importArchive = async (f?: File) => {
    if (!f) return;
    try {
      if (f.size > 20 * 1024 * 1024)
        throw Error("El archivo supera los 20 MB.");
      const parsed = JSON.parse(await f.text());
      if (parsed.version !== 1 || !isArchive(parsed.archive))
        throw Error(
          "Este archivo no contiene un archivo de AFTERSCENE válido.",
        );
      p.update(() => parsed.archive);
      setImportError("");
      p.announce("Tu archivo se importó correctamente.");
    } catch (e) {
      setImportError(
        e instanceof Error ? e.message : "No se pudo importar el archivo.",
      );
    }
    if (input.current) input.current.value = "";
  };
  if (section === "General")
    return <SettingsOverview {...p} setSection={setSection} />;
  if (section === "Notificaciones")
    return (
      <div className="standard-page">
        <button className="settings-back" onClick={() => setSection("General")}>
          <ArrowLeft size={16} />
          Configuración
        </button>
        <section className="page-heading">
          <h1>Notificaciones</h1>
          <p>Las novedades de tu archivo, a tu manera.</p>
        </section>
        <section className="settings-panel">
          <Toggle
            label="Novedades en la aplicación"
            description="Muestra el indicador de novedades junto a la campana."
            checked={p.archive.settings.notifications !== false}
            onChange={(notifications) =>
              p.update((a) => ({
                ...a,
                settings: { ...a.settings, notifications },
              }))
            }
          />
          <p className="settings-note">
            Los avisos de guardado y error permanecen visibles para confirmar
            tus acciones.
          </p>
        </section>
      </div>
    );
  if (section === "Idioma")
    return (
      <div className="standard-page">
        <button className="settings-back" onClick={() => setSection("General")}>
          <ArrowLeft size={16} />
          Configuración
        </button>
        <section className="page-heading">
          <h1>Idioma y región</h1>
          <p>Configura la región para consultar dónde ver cada historia.</p>
        </section>
        <section className="settings-panel">
          <div className="setting-row">
            <span>
              <b>Idioma de la interfaz</b>
              <p>Español (Latinoamérica)</p>
            </span>
            <Check size={17} />
          </div>
          <div className="setting-row">
            <span>
              <b>Tu región</b>
              <p>Disponibilidad de plataformas por país.</p>
            </span>
            <select
              value={p.archive.settings.country}
              onChange={(e) =>
                p.update((a) => ({
                  ...a,
                  settings: { ...a.settings, country: e.target.value },
                }))
              }
              aria-label="País"
            >
              <option value="MX">México</option>
              <option value="ES">España</option>
              <option value="AR">Argentina</option>
              <option value="CO">Colombia</option>
              <option value="US">Estados Unidos</option>
            </select>
          </div>
        </section>
      </div>
    );
  return (
    <div className="standard-page">
      <button className="settings-back" onClick={() => setSection("General")}>
        <ArrowLeft size={16} />
        Configuración
      </button>
      <section className="page-heading page-intro">
        <p className="eyebrow">HAZLO TUYO</p>
        <h1>
          Configuración<span>.</span>
        </h1>
        <p>Una experiencia de cine a tu manera.</p>
      </section>
      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Secciones de configuración">
          {[
            { n: "Apariencia", i: Monitor },
            { n: "Reproducción", i: Play },
            { n: "Cuenta", i: UserRound },
            { n: "Privacidad y datos", i: Lock },
            { n: "Acerca de", i: Info },
          ].map((v) => (
            <button
              className={section === v.n ? "active" : ""}
              key={v.n}
              onClick={() => setSection(v.n)}
            >
              <v.i size={17} />
              {v.n}
            </button>
          ))}
        </nav>
        <section className="settings-panel">
          <h2>{section}</h2>
          {section === "Apariencia" ? (
            <>
              <div className="setting-row"><span><b>Densidad del catálogo</b><p>Elige el tamaño de las tarjetas.</p></span><select aria-label="Densidad del catálogo" value={p.archive.settings.density||"gallery"} onChange={e=>p.update(a=>({...a,settings:{...a.settings,density:e.target.value as "gallery"|"compact"}}))}><option value="gallery">Galería</option><option value="compact">Compacto</option></select></div>
              <div className="setting-theme-group"><div><b>Elige tu ambiente</b><p>El tema cambia colores, texturas, tarjetas y movimiento en toda la app.</p></div><div className="theme-cards" role="radiogroup" aria-label="Estilo visual">
                {([{id:"cinema",title:"Cine nocturno",subtitle:"Negro, luz de proyector y contrastes",symbol:"✦"},{id:"storybook",title:"Bosque animado",subtitle:"Acuarela, verde musgo y cielo cálido",symbol:"✿"},{id:"kdrama",title:"K-drama",subtitle:"Pétalos, lavanda y romance",symbol:"❀"}] as const).map(t=><button type="button" role="radio" aria-checked={(p.archive.settings.visualTheme||"cinema")===t.id} className={`theme-card theme-card-${t.id} ${(p.archive.settings.visualTheme||"cinema")===t.id?"selected":""}`} key={t.id} onClick={()=>p.update(a=>({...a,settings:{...a.settings,visualTheme:t.id}}))}><span className="theme-symbol">{t.symbol}</span><b>{t.title}</b><small>{t.subtitle}</small><span className="theme-check">{(p.archive.settings.visualTheme||"cinema")===t.id?"✓":""}</span></button>)}</div></div>
              <Toggle
                label="Animaciones suaves"
                description="Transiciones de páginas, imágenes y microinteracciones."
                checked={p.archive.settings.motion}
                onChange={(motion) =>
                  p.update((a) => ({
                    ...a,
                    settings: { ...a.settings, motion },
                  }))
                }
              />
              <Toggle
                label="Rotación del destacado"
                description="Descubre otra historia del hero cada diez segundos."
                checked={p.archive.settings.autoplay}
                onChange={(autoplay) =>
                  p.update((a) => ({
                    ...a,
                    settings: { ...a.settings, autoplay },
                  }))
                }
              />
              <div className="setting-row">
                <span>
                  <b>Región para dónde ver</b>
                  <p>Consulta las opciones disponibles en tu país.</p>
                </span>
                <select
                  value={p.archive.settings.country}
                  onChange={(e) =>
                    p.update((a) => ({
                      ...a,
                      settings: { ...a.settings, country: e.target.value },
                    }))
                  }
                  aria-label="Región"
                >
                  <option value="MX">México</option>
                  <option value="ES">España</option>
                  <option value="AR">Argentina</option>
                  <option value="CO">Colombia</option>
                  <option value="US">Estados Unidos</option>
                </select>
              </div>
              <p className="settings-note">
                La preferencia de movimiento reducido de tu dispositivo siempre
                tiene prioridad.
              </p>
            </>
          ) : section === "Reproducción" ? (
            <LocalPlayer
              progress={p.archive.progress || {}}
              onWatchedSeconds={seconds => p.update(a=>({...a,watchTime:{...a.watchTime,[today()]:(a.watchTime?.[today()]||0)+seconds}}))}
              onProgress={(id, time) =>
                p.update((a) => ({
                  ...a,
                  progress: { ...a.progress, [id]: time },
                }))
              }
            />
          ) : section === "Cuenta" ? (
            <>
              <div className="account-summary">
                <div className="avatar">{p.archive.profile.name[0]}</div>
                <div>
                  <b>{p.archive.profile.name}</b>
                  <p>{p.user?.email || "Perfil local · Este navegador"}</p>
                </div>
              </div>
              <p className="settings-paragraph">
                {p.user
                  ? "Tu cuenta utiliza Supabase. Tu archivo es privado y solo tú puedes acceder a él."
                  : "Tu biblioteca, Tops, colecciones y recuerdos se guardan en este navegador. Puedes exportarlos para tener una copia."}
              </p>
              {p.syncError && (
                <p className="form-error">
                  La sincronización necesita atención. Los cambios se conservan
                  en este navegador.
                </p>
              )}
              {p.cloudEnabled ? (
                <Button
                  onClick={async () => {
                    if (p.user) {
                      const c = await getSupabase();
                      await c?.auth.signOut();
                      p.announce("Sesión cerrada");
                    } else p.onAuth();
                  }}
                >
                  {p.user ? <LogOut size={16} /> : <UserRound size={16} />}{" "}
                  {p.user ? "Cerrar sesión" : "Iniciar sesión / Crear cuenta"}
                </Button>
              ) : (
                <div className="connection-card">
                  <Globe size={22} />
                  <div>
                    <b>Tu archivo, en todos tus dispositivos</b>
                    <p>
                      La sincronización estará disponible al configurar Supabase
                      en el servidor. Esta versión funciona con almacenamiento
                      local.
                    </p>
                  </div>
                </div>
              )}
              <Button onClick={() => p.navigate("perfil")}>
                <PenLine size={15} />
                Editar perfil
              </Button>
            </>
          ) : section === "Privacidad y datos" ? (
            <>
              <div className="privacy-card">
                <Lock size={26} />
                <h3>Lo personal se queda personal.</h3>
                <p>
                  Tu archivo no se publica ni se comparte. Las fotografías se
                  optimizan y se guardan junto con tus recuerdos. Los datos
                  locales pertenecen a este navegador; exporta una copia para
                  conservarlos.
                </p>
              </div>
              <div className="setting-row">
                <span>
                  <b>Exportar mi archivo</b>
                  <p>
                    Incluye biblioteca, recuerdos, fotografías, Tops y perfil.
                  </p>
                </span>
                <Button onClick={exportArchive}>
                  <Download size={16} />
                  Exportar
                </Button>
              </div>
              <div className="setting-row">
                <span>
                  <b>Restaurar una copia</b>
                  <p>
                    Reemplaza el archivo actual con una copia de AFTERSCENE.
                  </p>
                </span>
                <Button onClick={() => input.current?.click()}>
                  <Upload size={16} />
                  Importar
                </Button>
                <input
                  ref={input}
                  type="file"
                  accept="application/json,.json"
                  hidden
                  onChange={(e) => importArchive(e.target.files?.[0])}
                />
              </div>
              {importError && (
                <p className="form-error" role="alert">
                  {importError}
                </p>
              )}
            </>
          ) : (
            <div className="about">
              <div className="brand">
                afterscene<span>.</span>
              </div>
              <p>THE PERSONAL FILM ARCHIVE</p>
              <h3>Las historias que se quedan contigo.</h3>
              <p>
                Una cinemateca personal para descubrir, guardar y recordar.
                Primera edición · 2026.
              </p>
              <hr />
              <p>
                Las imágenes y metadatos de la selección editorial proceden de
                TMDB. Este producto utiliza la API de TMDB, pero TMDB no lo
                respalda ni lo certifica.
              </p>
              <a
                className="tmdb-mark"
                href="https://www.themoviedb.org"
                target="_blank"
                rel="noreferrer"
              >
                THE MOVIE DB <ArrowUpRight size={16} />
              </a>
              <p>
                La disponibilidad regional se consulta en TMDB / JustWatch. Los
                tráileres se reproducen en YouTube. Las películas completas se
                ven en plataformas autorizadas.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
