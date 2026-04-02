import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, TrendingDown, ChevronRight, Zap, Filter, Layers, Layout, Globe, DollarSign, Wallet, Cpu, Coins, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCoins } from '../services/coinService';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../context/LanguageContext';
import clsx from 'clsx';

const Market = () => {
  const [coins, setCoins] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);
  const { t, currency, formatPrice } = useLanguage();

  const tabs = [
    { id: 'all', label: t('allSuffix'), icon: Layout },
    { id: 'gainers', label: t('gainers'), icon: TrendingUp },
    { id: 'losers', label: t('losers'), icon: TrendingDown },
    { id: 'layer-1', label: t('layer1'), icon: Layers },
    { id: 'layer-2', label: t('layer2'), icon: Cpu },
    { id: 'meme-token', label: t('meme'), icon: Coins },
    { id: 'artificial-intelligence', label: t('aiCoins'), icon: Zap },
    { id: 'decentralized-finance-defi', label: t('defiCoins'), icon: Filter },
    { id: 'gaming', label: t('gamingCoins'), icon: Globe },
    { id: 'metaverse', label: t('metaverse'), icon: Globe },
    { id: 'cybersecurity', label: "Güvenlik / Web3", icon: Globe },
    { id: 'stablecoins', label: t('stablecoins'), icon: DollarSign },
    { id: 'liquid-staking-tokens', label: t('liquidStaking'), icon: Wallet },
    { id: 'real-world-assets-rwa', label: t('rwa'), icon: Wallet },
  ];

  const fetchCoinsData = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else {
        setLoading(true);
        setApiError(null);
    }

    const currentPage = isLoadMore ? page + 1 : 1;
    const fetchLimit = activeTab === 'gainers' || activeTab === 'losers' ? 100 : limit;
    const category = (activeTab === 'gainers' || activeTab === 'losers') ? '' : activeTab;
    
    const result = await getCoins(currency, fetchLimit, category, currentPage);
    
    if (result.error) {
        setApiError(result.message);
    }

    let processedData = [...result.data];
    if (activeTab === 'gainers') {
      processedData = processedData.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 50);
    } else if (activeTab === 'losers') {
      processedData = processedData.sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 50);
    }

    if (isLoadMore) {
      setCoins(prev => [...prev, ...processedData]);
      setPage(currentPage);
    } else {
      setCoins(processedData);
      setPage(1);
    }

    setLoading(false);
    setLoadingMore(false);
  }, [currency, activeTab, limit, page]);

  useEffect(() => {
    fetchCoinsData(false);
  }, [currency, activeTab, limit]);

  const filteredCoins = coins.filter(coin => 
    coin.name.toLowerCase().includes(search.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">{t('marketOverview')}</h1>
          <p className="text-muted">{t('topCoins')}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={20} />
            <input 
                type="text" 
                placeholder={t('searchPlaceholder')}
                className="bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-6 w-full sm:w-64 focus:outline-none focus:border-primary/50 transition-all text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            </div>

            <div className="bg-white/5 border border-white/10 p-1 rounded-xl flex self-start sm:self-auto">
                {[20, 100, 250].map(val => (
                    <button 
                        key={val}
                        onClick={() => setLimit(val)}
                        className={clsx(
                            "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                            limit === val ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-muted hover:text-white"
                        )}
                    >
                        {val}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Warning Message for API Limit */}
      <AnimatePresence>
        {apiError && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
            >
                <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                    <div className="flex items-center gap-3">
                        <AlertCircle size={18} />
                        {apiError}
                    </div>
                    <button 
                        onClick={() => fetchCoinsData(false)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-black font-bold text-xs hover:scale-105 transition-transform"
                    >
                        <RefreshCw size={12} /> Tekrar Dene
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs / Categories - Wrapped & Sticky */}
      <div className="sticky top-[120px] z-30 bg-black/80 backdrop-blur-3xl -mx-6 px-6 pb-6 mb-8 border-b border-white/5">
        <div className="flex flex-wrap gap-2 pt-4">
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

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-muted text-sm uppercase">
                <th className="px-6 py-4 font-semibold">#</th>
                <th className="px-6 py-4 font-semibold">{t('coin')}</th>
                <th className="px-6 py-4 font-semibold text-right">{t('price')}</th>
                <th className="px-6 py-4 font-semibold text-right">{t('change24h')}</th>
                <th className="px-6 py-4 font-semibold text-right hidden lg:table-cell">{t('marketCap')}</th>
                <th className="px-6 py-4 font-semibold w-40 hidden md:table-cell">{t('last7Days')}</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading && page === 1 ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-white/5">
                    <td colSpan="7" className="px-6 py-6"><div className="h-8 bg-white/5 rounded w-full" /></td>
                  </tr>
                ))
              ) : filteredCoins.length > 0 ? (
                filteredCoins.map((coin, index) => (
                  <motion.tr 
                    key={coin.id + index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (index % limit) * 0.01 }}
                    className="group border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-6 text-muted font-medium text-xs">{index + 1}</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <div className="font-bold text-white uppercase text-sm">{coin.symbol}</div>
                          <div className="text-[10px] text-muted truncate max-w-[100px]">{coin.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right font-semibold text-sm">
                      {formatPrice(coin.current_price)}
                    </td>
                    <td className={`px-6 py-6 text-right font-medium`}>
                      <div className={`inline-flex items-center gap-1 text-xs ${coin.price_change_percentage_24h > 0 ? 'text-primary' : 'text-red-500'}`}>
                        {coin.price_change_percentage_24h > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right text-muted text-xs hidden lg:table-cell">
                      {new Intl.NumberFormat(undefined, { 
                        style: 'currency', 
                        currency: currency.toUpperCase(), 
                        notation: 'compact' 
                      }).format(coin.market_cap)}
                    </td>
                    <td className="px-6 py-6 hidden md:table-cell">
                      <div className="h-10 w-28 ml-auto">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={coin.sparkline_in_7d?.price?.map((p, i) => ({ v: p })) || []}>
                            <Line 
                              type="monotone" 
                              dataKey="v" 
                              stroke={coin.price_change_percentage_24h >= 0 ? "#00ff9d" : "#ef4444"} 
                              strokeWidth={1.5} 
                              dot={false} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <Link 
                        to={`/coin/${coin.id}`} 
                        className="p-2 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 inline-block"
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center text-muted">
                    {t('noCoinsFound')} "{search}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeTab === 'all' && (
        <div className="mt-12 flex justify-center">
            <button 
                onClick={() => fetchCoinsData(true)}
                disabled={loadingMore}
                className="group flex items-center gap-3 px-10 py-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all font-bold text-sm"
            >
                {loadingMore ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                    <>
                        {t('loadMore')}
                        <Zap size={18} className="text-primary group-hover:scale-125 transition-transform" />
                    </>
                )}
            </button>
        </div>
      )}
    </div>
  );
};

export default Market;
