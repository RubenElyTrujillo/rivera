import TopBar from "../navigation/TopBar";
import type { INavItem } from "@/domain/types";

interface MainLayoutProps {
  children: React.ReactNode;
  navItems?: INavItem[];
}

const MainLayout = ({ children, navItems }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <TopBar navItems={navItems} />
      {children}
    </div>
  );
};

export default MainLayout;
