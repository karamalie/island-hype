// app/legal-page-body.tsx
//
// Shared shell for terms and privacy. The footer links to both, so they had to
// exist; the content is whatever staff paste into SiteSetting.

import Link from "next/link";
import { Container, Label } from "@/components/ui";
import { Footer } from "@/components/layout/footer";
import { NavBar } from "@/components/layout/nav-bar";

export function LegalPageBody({
  title,
  body,
}: {
  title: string;
  body: string | null;
}) {
  return (
    <main>
      <NavBar surface="solid" cta={{ label: "Book now", href: "/packages" }} />
      <Container className="py-14">
        <div className="max-w-[34em]">
          <Label className="mb-5">Legal</Label>
          <h1 className="m-0 mb-8 text-display-m">{title}</h1>
          {body ? (
            body
              .split("\n\n")
              .filter(Boolean)
              .map((para, i) => (
                <p key={i} className="m-0 mb-5 text-[17px] leading-7 text-ink-700">
                  {para}
                </p>
              ))
          ) : (
            <div className="border-l-[3px] border-meta-inverse bg-ink-50 p-5">
              <div className="mb-1.5 font-mono text-label-sm uppercase text-meta">
                Not published yet
              </div>
              <p className="m-0 text-body-s text-ink-900">
                This page has no content yet. In the meantime,{" "}
                <Link href="/contact" className="text-teal-deep hover:text-ink-900">
                  ask us
                </Link>{" "}
                and a person in Male&rsquo; will answer.
              </p>
            </div>
          )}
        </div>
      </Container>
      <Footer />
    </main>
  );
}
