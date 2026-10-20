"use client";
import { useEffect, type RefObject } from "react";
import gsap from "gsap";
export default function CinematicMotion({scope,enabled,route}:{scope:RefObject<HTMLDivElement|null>;enabled:boolean;route:string}) {
  useEffect(()=>{
    if(!enabled||!scope.current)return;
    const root=scope.current, media=gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)",()=>{
      const seen=new WeakSet<Element>();
      const ctx=gsap.context(()=>{},root);
      const observer=new IntersectionObserver(entries=>{
        entries.filter(e=>e.isIntersecting).forEach((entry,i)=>{
          observer.unobserve(entry.target);
          ctx.add(()=>{gsap.fromTo(entry.target,{opacity:.15,y:22},{opacity:1,y:0,duration:.65,delay:Math.min(i*.045,.25),ease:"power3.out",clearProps:"opacity,transform"});});
        });
      },{threshold:.12});
      const scan=()=>root.querySelectorAll(".cast-person,.person-banner,.person-credits>button,.activity-card,.activity-stats>article,.social-hero,.release-list>button").forEach(el=>{if(!seen.has(el)){seen.add(el);observer.observe(el);}});
      scan();const mutations=new MutationObserver(scan);mutations.observe(root,{childList:true,subtree:true});
      return()=>{observer.disconnect();mutations.disconnect();ctx.revert();};
    });
    return()=>media.revert();
  },[enabled,route,scope]);
  return null;
}
