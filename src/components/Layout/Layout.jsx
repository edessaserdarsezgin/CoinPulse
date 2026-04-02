import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
    return (
        <div className="min-h-screen bg-background text-text font-sans selection:bg-primary/30">
            {/* Background decoration */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen opacity-20 animate-float" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] mix-blend-screen opacity-20 animate-float" style={{ animationDelay: '2s' }} />
            </div>

            <Navbar />

            <main className="pt-32 min-h-[calc(100vh-100px)]">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};

export default Layout;
