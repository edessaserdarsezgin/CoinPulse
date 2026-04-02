import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Wallet, TrendingUp, BarChart3, Home as HomeIcon, Globe, ChevronDown, Newspaper, LayoutGrid } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getNews } from '../../services/newsService';
import clsx from 'clsx';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [tickerNews, setTickerNews] = useState([]);
  const location = useLocation();
  const { lang, t, toggleLanguage, currency, changeCurrency } = useLanguage();

  const navLinks = [
    { name: t('home'), path: '/', icon: HomeIcon },
    { name: t('market'), path: '/market', icon: BarChart3 },
    { name: t('heatmap'), path: '/heatmap', icon: LayoutGrid },
    { name: t('portfolio'), path: '/portfolio', icon: Wallet },
    { name: t('news'), path: '/news', icon: Newspaper },
  ];

  const currencies = ['USD', 'EUR', 'TRY'];

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const fetchTickerNews = async () => {
        try {
            const news = await getNews();
            // Filter news based on current language
            const filteredNews = news.filter(item => item.lang === lang);
            const displayNews = filteredNews.length > 0 ? filteredNews : [{ title: t('heroBadge'), id: 'default' }];
            setTickerNews(displayNews.slice(0, 10));
        } catch (e) {
            console.warn("Ticker fetch failed");
        }
    };
    fetchTickerNews();
  }, [lang, t]);

  return (
    <nav className="fixed top-0 left-0 w-full z-50">
      {/* Top Main Navbar */}
      <div className="backdrop-blur-lg bg-surface/30 border-b border-white/5 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-primary to-accent flex items-center justify-center text-black shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp size={24} strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-bold font-serif bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
                CoinPulse
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={clsx(
                      "flex items-center gap-2 text-sm font-medium transition-all duration-300 relative px-3 py-1",
                      isActive(link.path) ? "text-primary" : "text-muted hover:text-white"
                    )}
                  >
                    {isActive(link.path) && (
                      <motion.div
                        layoutId="nav-bg"
                        className="absolute inset-0 bg-white/5 rounded-lg -z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon size={18} />
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-4">
              <div className="relative">
                <button 
                  onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase flex items-center gap-1.5 transition-all"
                >
                  {currency}
                  <ChevronDown size={14} className={clsx("transition-transform", isCurrencyOpen && "rotate-180")} />
                </button>
                
                <AnimatePresence>
                  {isCurrencyOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-24 bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      {currencies.map(curr => (
                        <button
                          key={curr}
                          onClick={() => {
                            changeCurrency(curr);
                            setIsCurrencyOpen(false);
                          }}
                          className={clsx(
                            "w-full px-4 py-2 text-left text-xs font-bold hover:bg-white/5 transition-colors uppercase",
                            currency === curr.toLowerCase() ? "text-primary" : "text-muted"
                          )}
                        >
                          {curr}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={toggleLanguage}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-muted hover:text-white transition-all flex items-center gap-2 text-xs uppercase"
              >
                <Globe size={16} />
                {lang === 'tr' ? 'EN' : 'TR'}
              </button>
              
              <button className="px-5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-all hover:scale-105 active:scale-95">
                {t('connectWallet')}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-4 md:hidden">
              <button 
                onClick={toggleLanguage}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-xs uppercase"
              >
                {lang === 'tr' ? 'EN' : 'TR'}
              </button>
              <button 
                className="text-white p-2"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X /> : <Menu />}
              </button>
            </div>
        </div>
      </div>

      {/* Breaking News Ticker Row */}
      <div className="bg-black/90 backdrop-blur-md border-b border-white/5 h-10 flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto w-full px-6 flex items-center">
            <div className="flex-none bg-primary/20 text-primary border border-primary/30 px-3 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter mr-6">
                {t('latestNews')}
            </div>
            <div className="flex-1 relative overflow-hidden h-full flex items-center">
                <div className="flex animate-[marquee_60s_linear_infinite] whitespace-nowrap gap-12 items-center hover:[animation-play-state:paused]">
                    {[...tickerNews, ...tickerNews].map((item, i) => (
                      <Link 
                          key={`${item.id}-${i}`} 
                          to="/news"
                          className="text-[11px] font-bold text-white/70 hover:text-primary transition-colors flex items-center gap-2"
                      >
                          <span className="w-1 h-1 rounded-full bg-primary/50" />
                          {item.title}
                      </Link>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-surface/95 border-b border-white/5"
          >
            <div className="p-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={clsx(
                    "flex items-center gap-4 text-lg font-medium p-3 rounded-xl",
                    isActive(link.path) ? "bg-primary/10 text-primary" : "text-muted"
                  )}
                >
                  <link.icon />
                  {link.name}
                </Link>
              ))}
              <div className="flex gap-4">
                {currencies.map(curr => (
                   <button 
                    key={curr}
                    onClick={() => changeCurrency(curr)}
                    className={clsx(
                      "flex-1 py-2 rounded-lg border border-white/10 uppercase text-xs font-bold",
                      currency === curr.toLowerCase() ? "bg-primary text-black" : "bg-white/5 text-muted"
                    )}
                   >
                     {curr}
                   </button>
                ))}
              </div>
              <button className="w-full mt-4 btn-primary">
                {t('connectWallet')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
