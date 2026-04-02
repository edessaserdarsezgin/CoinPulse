import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Plus, Trash2, TrendingUp, TrendingDown, PieChart as PieIcon, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getCoins } from '../services/coinService';
import { useLanguage } from '../context/LanguageContext';

const Portfolio = () => {
  const [assets, setAssets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({ id: 'bitcoin', amount: '' });
  const { t, formatPrice, currency } = useLanguage();

  const getConversionRate = () => {
    if (currency === 'try') return 30;
    if (currency === 'eur') return 0.92;
    return 1;
  };

  const availableCoins = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', price: 96540.23 },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', price: 2450.12 },
    { id: 'solana', name: 'Solana', symbol: 'SOL', price: 154.50 },
    { id: 'ripple', name: 'XRP', symbol: 'XRP', price: 0.5841 },
    { id: 'cardano', name: 'Cardano', symbol: 'ADA', price: 0.4215 },
  ].map(c => ({ ...c, price: c.price * getConversionRate() }));

  useEffect(() => {
    const savedAssets = JSON.parse(localStorage.getItem('coinpulse_portfolio') || '[]');
    setAssets(savedAssets);
  }, []);

  useEffect(() => {
    localStorage.setItem('coinpulse_portfolio', JSON.stringify(assets));
  }, [assets]);

  const addAsset = (e) => {
    e.preventDefault();
    if (!newAsset.amount || parseFloat(newAsset.amount) <= 0) return;

    const coin = availableCoins.find(c => c.id === newAsset.id);
    const existingIndex = assets.findIndex(a => a.id === newAsset.id);

    if (existingIndex > -1) {
      const updatedAssets = [...assets];
      updatedAssets[existingIndex].amount = parseFloat(updatedAssets[existingIndex].amount) + parseFloat(newAsset.amount);
      setAssets(updatedAssets);
    } else {
      setAssets([...assets, { ...coin, amount: parseFloat(newAsset.amount) }]);
    }

    setNewAsset({ id: 'bitcoin', amount: '' });
    setIsModalOpen(false);
  };

  const removeAsset = (id) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  const totalValue = assets.reduce((acc, curr) => {
    // In a real app we'd fetch the current price for each asset. 
    // Here we'll just mock it based on the conversion rate for simplicity.
    const price = availableCoins.find(c => c.id === curr.id)?.price || curr.price * getConversionRate();
    return acc + (price * curr.amount);
  }, 0);

  const chartData = assets.map(a => {
    const price = availableCoins.find(c => c.id === a.id)?.price || a.price * getConversionRate();
    return { name: a.name, value: price * a.amount };
  });

  const COLORS = ['#00ff9d', '#9d00ff', '#00d4ff', '#ff007a', '#facc15'];

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2">{t('portfolio')}</h1>
          <p className="text-muted">Net Worth & Allocation</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> {t('addAsset')}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="text-muted text-sm font-bold uppercase mb-2">{t('totalBalance')}</div>
          <div className="text-3xl font-bold">{formatPrice(totalValue)}</div>
          <div className="text-primary text-sm mt-2 flex items-center gap-1">
            <TrendingUp size={16} /> +2.4% last 24h
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="text-muted text-sm font-bold uppercase mb-2">{t('profitAndLoss')}</div>
          <div className="text-3xl font-bold text-primary">+{formatPrice(1245.80 * getConversionRate())}</div>
          <div className="text-muted text-sm mt-2">All time growth</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="text-muted text-sm font-bold uppercase mb-2">{t('activeAssets')}</div>
          <div className="text-3xl font-bold">{assets.length}</div>
          <div className="text-muted text-sm mt-2">Diversified holdings</div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Assets table */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="p-6 border-b border-white/5 font-bold flex items-center gap-2">
            <Wallet size={20} className="text-primary" /> {t('activeAssets')}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-muted text-xs uppercase border-b border-white/5">
                  <th className="px-6 py-4">{t('asset')}</th>
                  <th className="px-6 py-4">{t('balance')}</th>
                  <th className="px-6 py-4 text-right">{t('price')}</th>
                  <th className="px-6 py-4 text-right">{t('value')}</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {assets.length > 0 ? (
                  assets.map((asset) => {
                    const currentPrice = availableCoins.find(c => c.id === asset.id)?.price || asset.price * getConversionRate();
                    return (
                      <tr key={asset.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-6 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-xs uppercase text-primary">
                            {asset.symbol[0]}
                          </div>
                          <span className="font-bold">{asset.name}</span>
                        </td>
                        <td className="px-6 py-6">
                          <div className="font-medium">{asset.amount} <span className="text-xs text-muted font-normal">{asset.symbol}</span></div>
                        </td>
                        <td className="px-6 py-6 text-right">{formatPrice(currentPrice)}</td>
                        <td className="px-6 py-6 text-right font-bold text-primary">
                          {formatPrice(currentPrice * asset.amount)}
                        </td>
                        <td className="px-6 py-6 text-right">
                          <button 
                            onClick={() => removeAsset(asset.id)}
                            className="p-2 text-muted hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center text-muted">
                        {t('noAssets')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Allocation Chart */}
        <div className="lg:col-span-1 glass-card p-6">
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <PieIcon size={20} className="text-secondary" /> {t('assetAllocation')}
          </h3>
          <div className="h-64">
            {assets.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val) => formatPrice(val)}
                    contentStyle={{ backgroundColor: '#121212', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted italic text-sm">
                No data to display
              </div>
            )}
          </div>
          <div className="mt-6 space-y-3">
            {chartData.map((data, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-muted">{data.name}</span>
                </div>
                <span className="font-bold">{totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(1) : 0}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Asset Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-card p-8 bg-surface border-white/10"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{t('addAsset')}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-muted hover:text-white transition-colors">
                  <X />
                </button>
              </div>

              <form onSubmit={addAsset} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-muted uppercase mb-2">{t('selectCoin')}</label>
                  <select 
                    value={newAsset.id}
                    onChange={(e) => setNewAsset({ ...newAsset, id: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary/50 transition-all font-medium appearance-none"
                  >
                    {availableCoins.map(coin => (
                      <option key={coin.id} value={coin.id} className="bg-surface">{coin.name} ({coin.symbol})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-muted uppercase mb-2">{t('amountHeld')}</label>
                  <input 
                    type="number" 
                    step="0.0001"
                    placeholder="0.00"
                    value={newAsset.amount}
                    onChange={(e) => setNewAsset({ ...newAsset, amount: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary/50 transition-all font-medium"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors font-bold"
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    {t('save')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Portfolio;
