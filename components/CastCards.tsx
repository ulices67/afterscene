"use client";
import { UserRound, ArrowUpRight } from "lucide-react";
import type { Film } from "@/lib/catalog";
export default function CastCards({ film, full = false, navigate }: { film: Film; full?: boolean; navigate: (route: string) => void }) {
  const cast = film.castMembers?.length ? film.castMembers : film.cast.map(name => ({ id: 0, name, photo: "", role: "Reparto" }));
  const members = full ? [...(film.crewMembers || []), ...cast] : cast.slice(0, 8);
  return <div className="cast-cards">{members.map((member, i) =>
    <button className="cast-person" key={`${member.id}-${member.role}-${i}`} onClick={() => navigate(member.id ? `persona/${member.id}` : `personas?q=${encodeURIComponent(member.name)}`)}>
      <span className="cast-photo">{member.photo ? <img src={member.photo} alt={member.name} loading="lazy" onError={e => { e.currentTarget.hidden = true; }}/>:<UserRound size={32}/>}</span>
      <b>{member.name}</b><small>{member.role}</small><span className="cast-profile-link">Ver perfil <ArrowUpRight size={13}/></span>
    </button>)}</div>;
}
