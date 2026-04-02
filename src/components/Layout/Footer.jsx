import React from 'react';

const Footer = () => {
    return (
        <footer className="w-full py-8 mt-20 border-t border-white/5 bg-surface/30">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <p className="text-muted text-sm">
                    © {new Date().getFullYear()} CoinPulse. All rights reserved.
                    <span className="block mt-2 opacity-50 text-xs">Based on Data from CoinGecko</span>
                </p>
            </div>
        </footer>
    );
};

export default Footer;
