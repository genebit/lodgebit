"use client";

import React from "react";

interface PageHeroProps extends React.HTMLAttributes<HTMLElement> {
  heading: string;
  leadingText?: string;
}

export default function PageHero({ heading, leadingText, className, ...props }: PageHeroProps) {
  return (
    <section
      className={`p-6 relative overflow-clip rounded-lg border border-white bg-slate-950 text-white shadow-xl ${className || ""}`}
      {...props}
    >
      <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
      {leadingText && <p className="text-muted-foreground mt-1 z-20">{leadingText}</p>}
      <div className="absolute -right-48 -bottom-16 scale-[0.4] z-0">
        <svg width="688" height="204" viewBox="0 0 688 204" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M116.491 0H461.991L643.491 203H240.491L116.491 0Z" fill="#4B39B0" />
          <path d="M0 203.5L117.491 0L242.491 203.5H0Z" fill="#1A265A" />
          <path d="M359.083 75.9999H574.387L687.491 202.502H436.356L359.083 75.9999Z" fill="#4B39B0" />
          <path d="M286.491 202.814L359.707 76L437.602 202.814H286.491Z" fill="#1A265A" />
        </svg>
      </div>
    </section>
  );
}
