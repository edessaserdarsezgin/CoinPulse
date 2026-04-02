import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Clock, Share2, Newspaper, Loader2, Globe, MapPin, Hash, Filter } from 'lucide-react';
import { getNews } from '../services/newsService';
import { useLanguage } from '../context/LanguageContext';
import clsx from 'clsx';

const News = () => {
  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const { t, lang } = useLanguage();
  
  const loaderTrigger = useRef(null);
  const itemsPerPage = 6;

  const tabs = [
    { id: 'all', label: t('allSuffix'), icon: Newspaper },
    { id: 'tr', label: t('localSources'), icon: MapPin },
    { id: 'en', label: t('globalSources'), icon: Globe },
    { id: 'bitcoin', label: t('btcNews'), icon: Hash },
    { id: 'ethereum', label: t('ethNews'), icon: Hash },
    { id: 'altcoin', label: t('altcoinNews'), icon: Hash },
    { id: 'regulation', label: t('regulationNews'), icon: Filter },
  ];

  const fetchNews = useCallback(async () => {
    setLoading(true);
    const data = await getNews();
    setAllNews(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const filteredNewsList = useMemo(() => {
    if (activeTab === 'all') return allNews;
    if (activeTab === 'tr' || activeTab === 'en') {
        return allNews.filter(item => item.lang === activeTab);
    }

    const keywords = {
        bitcoin: ['bitcoin', 'btc', 'satoshi'],
        ethereum: ['ethereum', 'eth', 'vitalik'],
        altcoin: ['altcoin', 'solana', 'ripple', 'cardano', 'avax', 'meme', 'token', 'crypto'],
        regulation: ['regulation', 'sec', 'etf', 'law', 'legal', 'government', 'fed', 'regaülasyon', 'yasal']
    };

    const targetKeywords = keywords[activeTab] || [];
    return allNews.filter(item => {
        const content = (item.title + (item.body || '')).toLowerCase();
        return targetKeywords.some(kw => content.includes(kw));
    });
  }, [allNews, activeTab]);

  const visibleNews = useMemo(() => {
    return filteredNewsList.slice(0, page * itemsPerPage);
  }, [filteredNewsList, page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && visibleNews.length < filteredNewsList.length) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );
    if (loaderTrigger.current) observer.observe(loaderTrigger.current);
    return () => observer.disconnect();
  }, [loading, visibleNews.length, filteredNewsList.length]);

  useEffect(() => {
    setPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasMore = visibleNews.length < filteredNewsList.length;

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-6">
      {/* Sticky Category Section - sticks below the global ticker (top-[120px]) */}
      <div className="sticky top-[120px] z-30 pt-10 bg-black/80 backdrop-blur-3xl -mx-6 px-6 pb-6 mb-8 border-b border-white/5 shadow-2xl shadow-black/50">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 text-primary mb-2 font-black uppercase tracking-[0.2em] text-[10px]"
                >
                    <Newspaper size={14} />
                    {t('news')}
                </motion.div>
                <h1 className="text-3xl font-black">{t('latestNews')}</h1>
            </div>

            <div className="flex flex-wrap gap-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-xs font-bold",
                            activeTab === tab.id 
                                ? "bg-primary text-black border-primary shadow-lg shadow-primary/20" 
                                : "bg-white/5 border-white/10 text-muted hover:border-white/20 hover:text-white"
                        )}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
            {visibleNews.map((item, index) => (
                <motion.div
                  key={item.id + activeTab}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="glass-card group flex flex-col h-full overflow-hidden hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 relative cursor-pointer"
                  onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
                >
                  <div className="relative h-56 overflow-hidden bg-white/5">
                    <img 
                        src={item.imageurl} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                            e.target.src = item.lang === 'tr' 
                                ? 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800'
                                : 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=800';
                        }}
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                        <div className="px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-primary">
                            {item.source}
                        </div>
                        <div className="px-2 py-1.5 rounded-lg bg-black/70 backdrop-blur-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60">
                            {item.lang.toUpperCase()}
                        </div>
                    </div>
                  </div>

                  <div className="p-7 flex flex-col grow">
                    <div className="flex items-center gap-4 text-[10px] text-muted mb-4 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                        <Clock size={12} className="text-primary" /> {formatDate(item.published_on)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-4 line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">{item.title}</h3>
                    <p className="text-muted/80 text-sm line-clamp-3 mb-8 grow leading-relaxed font-medium">{item.body}</p>
                    <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/5">
                      <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary group-hover:text-white transition-all">
                        {t('readMore')} <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle share
                        }}
                        className="p-2 text-muted hover:text-white transition-colors"
                      >
                        <Share2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            }
        </AnimatePresence>
        {loading && Array.from({ length: 6 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="glass-card h-[450px] animate-pulse">
                <div className="h-56 bg-white/5 rounded-t-xl" /><div className="p-7 space-y-4"><div className="h-4 bg-white/5 rounded w-1/4" /><div className="h-8 bg-white/5 rounded w-3/4" /><div className="h-4 bg-white/5 rounded w-full" /><div className="h-4 bg-white/5 rounded w-full" /></div>
            </div>
        ))}
      </div>
      {filteredNewsList.length === 0 && !loading && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
              <Newspaper className="mx-auto text-muted mb-4 opacity-20" size={64} />
              <h3 className="text-xl font-bold text-muted mb-2">Bu kategoride haber bulunamadı.</h3>
              <p className="text-muted text-sm px-10">Farklı anahtar kelimeler içeren haberler için diğer kategorilere göz atabilirsin.</p>
          </div>
      )}
      <div ref={loaderTrigger} className="mt-20 flex flex-col items-center justify-center gap-4 py-10">
        {loading && allNews.length > 0 ? (
            <div className="flex flex-col items-center gap-3">
                <Loader2 size={32} className="text-primary animate-spin" /><span className="text-xs font-bold uppercase tracking-widest text-muted">Haberler taranıyor...</span>
            </div>
        ) : !hasMore && !loading && allNews.length > 0 && (
            <div className="flex flex-col items-center gap-2"><div className="w-12 h-1 bg-white/10 rounded-full mb-4" /><span className="text-sm font-bold text-muted">{t('allCaughtUp')}</span></div>
        )}
      </div>
    </div>
  );
};

export default News;
