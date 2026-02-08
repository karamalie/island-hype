import { Toaster } from "sonner";

export const metadata = {
  title: {
    default: "Admin | Island Hype",
    template: "%s | Admin | Island Hype",
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
