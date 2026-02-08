import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { AdminShell } from "@/components/admin/layout/admin-shell";

export default async function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/admin/login");
  }

  const user = {
    name: session.name,
    email: session.email,
    username: session.username,
  };

  return <AdminShell user={user}>{children}</AdminShell>;
}
