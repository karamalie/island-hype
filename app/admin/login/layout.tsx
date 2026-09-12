// Just the page name. The admin layout's template adds "| Admin | Island Hype".
export const metadata = {
  title: "Login",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
