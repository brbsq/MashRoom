import { Shell } from "@/components/mashroom/shell";
export default function WorldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Shell>{children}</Shell>;
}
