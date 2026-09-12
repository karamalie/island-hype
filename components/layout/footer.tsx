// components/layout/footer.tsx
//
// Identical on all nine pages.
//
// Every piece of text here is --color-meta-inverse (#AFAFAF), which is 7.8:1 on
// this ink ground. The light-ground meta grey (#707070) drops to 3.47:1 here and
// fails AA — that substitution is the single easiest mistake to make in this
// palette, which is why the two greys are named for their grounds.
//
// The three contact channels are the real ones and they live in SiteSetting, so
// this is a server component: staff change a number without a deploy.

import Link from "next/link";
import {
  getContactDetails,
  instagramHandle,
  instagramHref,
  telHref,
  whatsappHref,
} from "@/lib/data/settings";

const BROWSE = [
  { label: "Packages", href: "/packages" },
  { label: "Locations", href: "/locations" },
  { label: "Stays", href: "/accommodations" },
  { label: "Guide", href: "/guide" },
];

const COMPANY = [
  { label: "Contact", href: "/contact" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
];

export async function Footer() {
  const contact = await getContactDetails();

  return (
    <footer className="bg-ink-900 px-[var(--gutter)] pb-10 pt-16">
      <div className="mx-auto w-full max-w-[var(--container-page)]">
        <div className="flex flex-wrap justify-between gap-12 border-b border-ink-700 pb-10">
          <div className="max-w-[22em]">
            <div className="mb-4 font-display text-[24px] italic leading-[30px] text-white">
              Island Hype
            </div>
            <p className="m-0 text-body-xs leading-[22px] text-meta-inverse">
              Maldives packages with the stay, the transfers and the meals in one
              price. {contact.place}.
            </p>
          </div>

          <div className="flex flex-wrap gap-12 sm:gap-16">
            <FooterColumn heading="Browse" links={BROWSE} />
            <FooterColumn heading="Company" links={COMPANY} />

            <div>
              <div className="mb-4 font-mono text-label uppercase text-meta-inverse">
                Talk to us
              </div>
              <div className="flex flex-col gap-2.5">
                {/* Email first: it is the channel the contact form feeds, and the
                    one people expect to be clickable. */}
                <a
                  href={`mailto:${contact.email}`}
                  className="text-body-xs text-white transition-colors duration-[140ms] hover:text-meta-inverse"
                >
                  {contact.email}
                </a>
                <a
                  href={telHref(contact.phone)}
                  className="text-body-xs text-white transition-colors duration-[140ms] hover:text-meta-inverse"
                >
                  {contact.phone}
                </a>
                <a
                  href={whatsappHref(
                    contact.phone,
                    "Hello — I'm looking at your packages."
                  )}
                  className="text-body-xs text-white transition-colors duration-[140ms] hover:text-meta-inverse"
                >
                  WhatsApp
                </a>
                <a
                  href={instagramHref(contact.instagram)}
                  className="text-body-xs text-white transition-colors duration-[140ms] hover:text-meta-inverse"
                >
                  {instagramHandle(contact.instagram)}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 text-caption text-meta-inverse">
          &copy; {new Date().getFullYear()} Island Hype
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  heading,
  links,
}: {
  heading: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <div className="mb-4 font-mono text-label uppercase text-meta-inverse">
        {heading}
      </div>
      <div className="flex flex-col gap-2.5">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-body-xs text-white transition-colors duration-[140ms] hover:text-meta-inverse"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
