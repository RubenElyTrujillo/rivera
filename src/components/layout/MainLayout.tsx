import TopBar from "../navigation/TopBar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-background">
            <TopBar />
            {children}
        </div>
    );
};

export default MainLayout;