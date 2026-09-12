import { Toaster } from "sonner";

// Two different rules apply here, which is why the tab kept reading
// "Admin | Island Hype | Island Hype":
//
//   `default` IS subject to the ROOT layout's "%s | Island Hype" template, so it
//   must name only this segment and let the root add the site.
//
//   `template` applies to the titles of pages BELOW this layout, and the root's
//   template does not then apply on top of it — so this one has to spell the
//   site name out itself.
//
// noindex matters more than it looks: the authenticated pages redirect anonymous
// visitors to /admin/login, but the login page itself would otherwise be indexed
// on a site whose root layout sets index: true for everything.
export const metadata = {
  title: {
    default: "Admin",
    template: "%s | Admin | Island Hype",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster position="top-right" richColors />
    </>
  );
}
