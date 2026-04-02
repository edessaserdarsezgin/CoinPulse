import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Home = () => {
  const { t } = useLanguage();

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {t('heroBadge')}
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
              {t('heroTitle')} <br />
              <span className="text-gradient">{t('heroTitlePro')}</span>
              {t('heroTitleTrack') && <span> <br /> {t('heroTitleTrack')}</span>}
            </h1>
            
            <p className="text-muted text-lg mb-8 max-w-lg leading-relaxed">
              {t('heroDesc')}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/market" className="btn-primary flex items-center gap-2">
                {t('startExploring')} <ArrowRight size={18} />
              </Link>
              <Link to="/portfolio" className="px-6 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-medium">
                {t('viewPortfolio')}
              </Link>
            </div>
          </motion.div>

          {/* Hero Visual/Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 glass-card p-6 transform rotate-[-5deg] hover:rotate-0 transition-transform duration-500">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold">₿</div>
                  <div>
                    <h3 className="font-bold">Bitcoin</h3>
                    <p className="text-xs text-muted">BTC/USD</p>
                  </div>
                </div>
                <span className="text-primary font-bold">+5.24%</span>
              </div>
              <div className="h-24 bg-linear-to-t from-primary/10 to-transparent rounded-lg border border-primary/10 flex items-end p-2 gap-1">
                {[40, 60, 45, 70, 65, 80, 75, 90, 85, 100].map((h, i) => (
                    <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="flex-1 bg-primary/50 rounded-sm"
                    />
                ))}
              </div>
            </div>

            <div className="absolute top-1/2 -right-10 glass-card p-4 w-64 transform rotate-[5deg] hover:rotate-0 transition-transform duration-500 z-0 opacity-80 scale-90">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">E</div>
                    <div><h4 className="font-bold">Ethereum</h4><p className="text-xs text-muted">ETH</p></div>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[70%] bg-blue-500" />
                </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-surface/30">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: t('realTimeUpdates'), desc: t('realTimeUpdatesDesc') },
            { icon: Shield, title: t('securePortfolio'), desc: t('securePortfolioDesc') },
            { icon: TrendingUp, title: t('advancedAnalytics'), desc: t('advancedAnalyticsDesc') },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="glass-card p-6 hover:border-primary/30 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <feature.icon />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
