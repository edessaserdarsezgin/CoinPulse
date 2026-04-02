import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Info } from 'lucide-react';
import { getCoinDetail, getCoinHistory } from '../services/coinService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../context/LanguageContext';

const CoinDetail = () => {
  const { id } = useParams();
  const [coin, setCoin] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7');
  const { t, lang, currency, formatPrice } = useLanguage();

  const timeframes = [
    { label: '24h', value: '1' },
    { label: '7d', value: '7' },
    { label: '14d', value: '14' },
    { label: '30d', value: '30' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [detailData, historyData] = await Promise.all([
        getCoinDetail(id),
        getCoinHistory(id, timeframe, currency)
      ]);
      setCoin(detailData);
      setHistory(historyData?.prices?.map(p => ({ 
        time: new Date(p[0]).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { 
           day: 'numeric', 
           month: 'short',
           hour: timeframe === '1' ? '2-digit' : undefined,
           minute: timeframe === '1' ? '2-digit' : undefined
        }), 
        price: p[1] 
      })) || []);
      setLoading(false);
    };
    fetchData();
  }, [id, timeframe, lang, currency]);

  if (loading) return (
    <div className="pt-24 min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
    </div>
  );

  if (!coin) return (
    <div className="pt-24 min-h-screen text-center">
      <h2 className="text-2xl font-bold">Coin not found</h2>
      <Link to="/market" className="text-primary hover:underline mt-4 inline-block">Back to Market</Link>
    </div>
  );

  const marketData = coin.market_data;
  const currentPrice = marketData.current_price[currency] || marketData.current_price.usd;
  const marketCap = marketData.market_cap[currency] || marketData.market_cap.usd;
  const totalVolume = marketData.total_volume[currency] || marketData.total_volume.usd;

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-6">
      {/* Header */}
      <Link to="/market" className="inline-flex items-center gap-2 text-muted hover:text-white transition-colors mb-8 group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> {t('market')}
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <img src={coin.image.large} alt={coin.name} className="w-16 h-16 rounded-full" />
              <div>
                <h1 className="text-3xl font-bold">{coin.name}</h1>
                <span className="text-muted uppercase font-bold text-sm bg-white/5 px-2 py-0.5 rounded">{coin.symbol}</span>
              </div>
            </div>

            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl font-bold">
                {formatPrice(currentPrice)}
              </span>
              <span className={`text-lg font-medium ${marketData.price_change_percentage_24h > 0 ? 'text-primary' : 'text-red-500'}`}>
                {marketData.price_change_percentage_24h > 0 ? '+' : ''}{marketData.price_change_percentage_24h.toFixed(2)}%
              </span>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/5">
              <div className="flex justify-between">
                <span className="text-muted flex items-center gap-2"><Activity size={16} /> {t('rank')}</span>
                <span className="font-bold">#{coin.market_cap_rank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted flex items-center gap-2"><DollarSign size={16} /> {t('marketCap')}</span>
                <span className="font-bold">
                   {new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-US', { 
                     style: 'currency', currency: currency.toUpperCase(), notation: 'compact' 
                   }).format(marketCap)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted flex items-center gap-2"><BarChart3 size={16} /> 24h Vol</span>
                <span className="font-bold">
                   {new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-US', { 
                     style: 'currency', currency: currency.toUpperCase(), notation: 'compact' 
                   }).format(totalVolume)}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Info size={20} className="text-primary" /> {t('about')} {coin.name}</h3>
            <p className="text-muted text-sm leading-relaxed max-h-48 overflow-y-auto pr-2 custom-scrollbar"
               dangerouslySetInnerHTML={{ __html: coin.description[lang] || coin.description.en }} />
          </motion.div>
        </div>

        {/* Right Column: Chart */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 h-[500px]"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2"><Activity className="text-primary" /> {t('activity')}</h3>
              <div className="flex gap-2">
                {timeframes.map(tf => (
                   <button 
                    key={tf.value} 
                    onClick={() => setTimeframe(tf.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${timeframe === tf.value ? 'bg-primary text-black' : 'bg-white/5 text-muted hover:text-white'}`}
                   >
                     {tf.label.toUpperCase()}
                   </button>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height="80%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff9d" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00ff9d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip 
                  formatter={(value) => [formatPrice(value), t('price')]}
                  contentStyle={{ backgroundColor: '#121212', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#00ff9d' }}
                />
                <Area type="monotone" dataKey="price" stroke="#00ff9d" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h4 className="text-muted text-sm mb-1 uppercase font-bold tracking-wider">All Time High</h4>
              <p className="text-2xl font-bold">{formatPrice(marketData.ath[currency] || marketData.ath.usd)}</p>
              <p className="text-red-500 text-sm mt-1">{marketData.ath_change_percentage[currency] || marketData.ath_change_percentage.usd || '-'}% from peak</p>
            </div>
            <div className="glass-card p-6">
              <h4 className="text-muted text-sm mb-1 uppercase font-bold tracking-wider">Circulating Supply</h4>
              <p className="text-2xl font-bold">{marketData.circulating_supply.toLocaleString()} {coin.symbol.toUpperCase()}</p>
              <div className="w-full h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinDetail;
