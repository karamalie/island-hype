import Image from "next/image";
import { ReactNode } from "react";
import { Navbar } from "@/components/layout/nav-bar";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  stats?: ReactNode;
  backgroundSrc: string;
  backgroundAlt: string;
  overlayTone?: "soft" | "medium" | "strong";
  showLogo?: boolean;
  minHeightClassName?: string;
}

export function PageHero({
  title,
  subtitle,
  badge,
  stats,
  backgroundSrc,
  backgroundAlt,
  overlayTone = "medium",
  showLogo = true,
  minHeightClassName,
}: PageHeroProps) {
  return (
    <section className={cn("page-hero", minHeightClassName)}>
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 parallax-bg">
          <Image
            src={backgroundSrc}
            alt={backgroundAlt}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className={cn("page-hero__overlay", `page-hero__overlay--${overlayTone}`)} />
      </div>

      <Navbar variant="overlay" showLogo={showLogo} />

      <Container className="page-hero__content">
        <div className="max-w-4xl">
          {badge}
          <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[1.08] text-white mb-6 max-w-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          ) : null}
          {stats ? <div className="mt-8">{stats}</div> : null}
        </div>
      </Container>
    </section>
  );
}
