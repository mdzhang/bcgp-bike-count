import SiteHeader from "./SiteHeader";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
