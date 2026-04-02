import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    RefreshCw, TrendingUp, TrendingDown, BarChart3, Zap, 
    Activity, MousePointer2, Info, Layers, PieChart 
} from 'lucide-react';
import { getCoins } from '../services/coinService';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

// --- Squarified Treemap Algorithm Implementation ---
const squarify = (rect, values) => {
    let remainder = values;
    let container = rect;
    let stack = [];
    let results = [];

    const getShortSide = (c) => Math.min(c.width, c.height);
    const getAspectRatio = (r, w) => {
        const s = r.reduce((a, b) => a + b, 0);
        if (s === 0 || w === 0) return Infinity;
        const s2 = s * s;
        const w2 = w * w;
        const maxV = Math.max(...r);
        const minV = Math.min(...r);
        if (minV === 0) return Infinity;
        return Math.max((w2 * maxV) / s2, s2 / (w2 * minV));
    };

    const layoutRow = (row, w, c, vertical) => {
        const rowSum = row.reduce((a, b) => a + b, 0);
        const rowThickness = w === 0 ? 0 : rowSum / w;
        let offset = 0;

        row.forEach((v) => {
            const length = rowThickness === 0 ? 0 : v / rowThickness;
            if (vertical) {
                results.push({ x: c.x + offset, y: c.y, width: length, height: rowThickness });
            } else {
                results.push({ x: c.x, y: c.y + offset, width: rowThickness, height: length });
            }
            offset += length;
        });

        if (vertical) {
            return { x: c.x, y: c.y + rowThickness, width: c.width, height: Math.max(0, c.height - rowThickness) };
        } else {
            return { x: c.x + rowThickness, y: c.y, width: Math.max(0, c.width - rowThickness), height: c.height };
        }
    };

    while (remainder.length > 0) {
        const w = getShortSide(container);
        const next = remainder[0];
        const newStack = [...stack, next];

        if (stack.length === 0 || getAspectRatio(newStack, w) <= getAspectRatio(stack, w)) {
            stack = newStack;
            remainder = remainder.slice(1);
        } else {
            container = layoutRow(stack, w, container, container.width === w);
            stack = [];
        }
    }
    if (stack.length > 0) {
        layoutRow(stack, getShortSide(container), container, container.width === Math.min(container.width, container.height));
    }
    return results;
};

const Heatmap = () => {
    const [coins, setCoins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('market_dominance');
    const { t, currency, formatPrice } = useLanguage();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [hoveredCoin, setHoveredCoin] = useState(null);

    const COIN_LIMIT = 100;

    const fetchHeatmapData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getCoins(currency, COIN_LIMIT, '', 1);
            if (result.error) {
                setError(result.message);
            } else {
                setCoins(result.data || []);
            }
        } catch (err) {
            setError(t('error_fetching_data') || "Veriler alınırken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    }, [currency, t]);

    useEffect(() => {
        fetchHeatmapData();
    }, [fetchHeatmapData]);

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setContainerSize({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };
        updateSize();
        const timeoutId = setTimeout(updateSize, 300);
        window.addEventListener('resize', updateSize);
        return () => {
            window.removeEventListener('resize', updateSize);
            clearTimeout(timeoutId);
        };
    }, [loading, coins]); // Re-calculate when coins load as scrollbars might appear/disappear

    const processedCoins = useMemo(() => {
        if (!coins || coins.length === 0) return [];
        const mapped = coins.map(c => ({
            ...c,
            symbol: (c.symbol || '').toUpperCase(),
            name: (c.name || '').toUpperCase()
        }));

        if (sortBy === 'market_dominance') {
            return mapped.sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0));
        } else {
            return mapped.sort((a, b) => Math.abs(b.price_change_percentage_24h || 0) - Math.abs(a.price_change_percentage_24h || 0));
        }
    }, [coins, sortBy]);

    const totalWeight = useMemo(() => {
        const sum = processedCoins.reduce((acc, coin) => {
            const val = sortBy === 'market_dominance' ? (coin.market_cap || 0) : Math.abs(coin.price_change_percentage_24h || 0);
            return acc + (val || 0);
        }, 0);
        return Math.max(sum, 1);
    }, [processedCoins, sortBy]);

    const treemapData = useMemo(() => {
        if (!processedCoins.length || containerSize.width === 0 || containerSize.height === 0) return [];
        
        const area = containerSize.width * containerSize.height;
        const values = processedCoins.map(c => {
            const val = sortBy === 'market_dominance' ? (c.market_cap || 0) : Math.abs(c.price_change_percentage_24h || 0);
            return Math.max((val / totalWeight) * area, 1);
        });

        const rects = squarify({ x: 0, y: 0, width: containerSize.width, height: containerSize.height }, values);
        
        return processedCoins.map((coin, i) => ({
            ...coin,
            ...rects[i],
            dominance: (sortBy === 'market_dominance' ? (coin.market_cap || 0) : Math.abs(coin.price_change_percentage_24h || 0)) / totalWeight * 100
        }));
    }, [processedCoins, containerSize, sortBy, totalWeight]);

    return (
        <div className="pt-24 w-full h-screen flex flex-col overflow-hidden bg-black select-none relative">
            <div className="absolute top-0 left-0 w-full h-full bg-primary/2 pointer-events-none" />

            {/* TOP MENU */}
            <div className="flex items-center justify-between px-8 py-4 shrink-0 relative z-20">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-primary font-bold text-[10px] tracking-[0.4em] mb-1">
                            <Activity size={14} className="animate-pulse" />
                            {t('heatmap') || 'ISI HARİTASI'}
                        </div>
                        <h1 className="text-2xl font-black text-white italic tracking-tighter leading-none uppercase">TERMİNAL</h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-zinc-900/80 border border-white/5 p-1 rounded-2xl backdrop-blur-3xl shadow-2xl">
                        <button
                            onClick={() => setSortBy('market_dominance')}
                            className={clsx(
                                "flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all",
                                sortBy === 'market_dominance' ? "bg-primary text-black" : "text-zinc-500 hover:text-white"
                            )}
                        >
                            <BarChart3 size={14} />
                            PİYASA BÜYÜKLÜĞÜ
                        </button>
                        <button
                            onClick={() => setSortBy('volatility')}
                            className={clsx(
                                "flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all",
                                sortBy === 'volatility' ? "bg-primary text-black" : "text-zinc-500 hover:text-white"
                            )}
                        >
                            <Zap size={14} />
                            24S DEĞİŞİM
                        </button>
                    </div>

                    <button 
                        onClick={fetchHeatmapData}
                        className="p-3 rounded-2xl bg-zinc-900/80 border border-white/5 text-zinc-500 hover:text-white transition-all shadow-xl active:scale-95"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* FULL SCREEN HEATMAP */}
            <div 
                ref={containerRef}
                className="flex-1 relative bg-black/40 border-t border-white/5 overflow-hidden"
                onMouseLeave={() => setHoveredCoin(null)}
            >
                {loading ? (
                    <div className="w-full h-full grid grid-cols-10 grid-rows-10 opacity-5">
                        {Array.from({ length: 100 }).map((_, i) => (
                            <div key={i} className="border border-white/10" />
                        ))}
                    </div>
                ) : (
                    <div className="w-full h-full relative">
                        {treemapData.map((coin) => {
                            const change = coin.price_change_percentage_24h || 0;
                            const isLarge = coin.width > 70 && coin.height > 70;
                            const isMedium = coin.width > 35 && coin.height > 35;

                            return (
                                <motion.div
                                    key={coin.id}
                                    layout
                                    onClick={() => navigate(`/coin/${coin.id}`)}
                                    onMouseEnter={() => setHoveredCoin(coin)}
                                    className={clsx(
                                        "absolute border-[0.2px] border-black/40 cursor-pointer overflow-hidden group transition-all duration-300 hover:z-30 hover:brightness-110",
                                        change >= 0 ? "bg-emerald-600/95" : "bg-rose-600/95"
                                    )}
                                    style={{
                                        left: `${coin.x}px`,
                                        top: `${coin.y}px`,
                                        width: `${coin.width}px`,
                                        height: `${coin.height}px`
                                    }}
                                >
                                    <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center pointer-events-none">
                                        <span className={clsx(
                                            "font-black text-white leading-none mb-1 drop-shadow-lg",
                                            isLarge ? "text-xl md:text-3xl" : isMedium ? "text-sm md:text-base" : "text-[8px] opacity-40"
                                        )}>
                                            {coin.symbol}
                                        </span>
                                        {(isMedium || isLarge) && (
                                            <span className={clsx(
                                                "font-bold text-white/70 leading-none",
                                                isLarge ? "text-xs md:text-sm" : "text-[9px]"
                                            )}>
                                                %{coin.dominance.toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* ADAPTIVE TOOLTIP - WHITE THEME */}
                <AnimatePresence mode="wait">
                    {hoveredCoin && (
                        <motion.div 
                            key={hoveredCoin.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className={clsx(
                                "absolute z-100 w-64 bg-white/95 border border-zinc-200 rounded-3xl p-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] pointer-events-none backdrop-blur-3xl",
                                hoveredCoin.y < containerSize.height * 0.5 ? "top-[5%]" : "bottom-[5%]",
                                hoveredCoin.x < containerSize.width * 0.3 ? "left-[5%]" : hoveredCoin.x > containerSize.width * 0.7 ? "right-[5%]" : "left-1/2 -translate-x-1/2"
                            )}
                        >
                            <div className="flex items-center gap-4 mb-5 border-b border-zinc-100 pb-4">
                                <img src={hoveredCoin.image} alt={hoveredCoin.name} className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 p-0.5 shadow-sm" />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-black text-zinc-900 uppercase leading-none mb-1.5 tracking-tight">{hoveredCoin.symbol}</span>
                                    <span className="text-[10px] font-black text-zinc-400 uppercase truncate">{hoveredCoin.name}</span>
                                </div>
                            </div>
                            <div className="space-y-3.5">
                                <div className="flex justify-between items-center text-[11px] font-black text-zinc-400 uppercase italic">
                                    <span>FİYAT</span>
                                    <span className="text-zinc-900 not-italic">{formatPrice(hoveredCoin.current_price)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px] font-black text-zinc-400 uppercase italic">
                                    <span>DOMİNANS</span>
                                    <span className="text-primary not-italic font-black">%{hoveredCoin.dominance.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px] font-black text-zinc-400 uppercase italic">
                                    <span>DEĞİŞİM</span>
                                    <span className={clsx("font-bold not-italic", (hoveredCoin.price_change_percentage_24h || 0) >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                        %{(hoveredCoin.price_change_percentage_24h || 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-5 flex items-center justify-center gap-2.5 text-[8px] font-black text-zinc-300 tracking-[0.6em] uppercase">
                                <MousePointer2 size={12} className="text-zinc-200" />
                                DETAYLAR
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* MINIMAL STATUS FOOTER (ADDED TO RESOLVE 2 REPORTED ERRORS) */}
            <div className="px-8 py-3 bg-zinc-950 border-t border-white/5 flex items-center justify-between shrink-0 h-10">
                <div className="flex items-center gap-6 text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                   <div className="flex items-center gap-2"><Layers size={10} /> POS: {treemapData.length} VARLIK</div>
                   <div className="flex items-center gap-2"><PieChart size={10} /> MOD: SQUARIFIED</div>
                </div>
                <div className="flex items-center gap-2 text-[8px] font-black text-zinc-800 tracking-[0.4em]">
                   <Info size={10} /> ANALYTICAL HUB
                </div>
            </div>
        </div>
    );
};

export default Heatmap;
