import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
    tr: {
        home: "Ana Sayfa",
        market: "Piyasalar",
        portfolio: "Portföy",
        news: "Haberler",
        connectWallet: "Cüzdanı Bağla",
        heroBadge: "Canlı Piyasa Verileri",
        heroTitle: "Kriptoyu Bir",
        heroTitlePro: "Profesyonel Gibi",
        heroTitleTrack: "Takip Et",
        heroDesc: "Gerçek zamanlı fiyatlar, gelişmiş grafikler ve portföy takibi. Kripto piyasasını takip etmenin en zarif yolu.",
        startExploring: "Keşfetmeye Başla",
        viewPortfolio: "Portföyü Görüntüle",
        realTimeUpdates: "Gerçek Zamanlı Güncellemeler",
        realTimeUpdatesDesc: "CoinGecko üzerinden doğrudan canlı fiyat akışı.",
        securePortfolio: "Güvenli Portföy",
        securePortfolioDesc: "Varlıklarınızı özel anahtarlarınızdan ödün vermeden yerel olarak takip edin.",
        advancedAnalytics: "Gelişmiş Analitik",
        advancedAnalyticsDesc: "Profesyonel düzeyde grafikler ve teknik göstergeler parmaklarınızın ucunda.",
        marketOverview: "Piyasaya Genel Bakış",
        topCoins: "Piyasa Değerine Göre En İyi Kripto Paralar",
        searchPlaceholder: "Coin ara...",
        coin: "Coin",
        price: "Fiyat",
        change24h: "24s Değişim",
        marketCap: "Piyasa Değeri",
        last7Days: "Son 7 Gün",
        noCoinsFound: "Eşleşen coin bulunamadı",
        rank: "Sıralama",
        activity: "Fiyat Grafiği",
        about: "Hakkında",
        totalBalance: "Toplam Bakiye",
        profitAndLoss: "Toplam Kar / Zarar",
        activeAssets: "Aktif Varlık",
        asset: "Varlık",
        balance: "Bakiye",
        value: "Değer",
        action: "İşlem",
        noAssets: "Henüz varlık yok. Takibe başlamak için \"Varlık Ekle\" butonuna tıklayın.",
        assetAllocation: "Varlık Dağılımı",
        addAsset: "Varlık Ekle",
        selectCoin: "Coin Seç",
        amountHeld: "Sahip Olunan Miktar",
        cancel: "İptal",
        save: "Ekle",
        comingSoon: "Pek Yakında",
        currency: "Para Birimi",
        allSuffix: "Hepsi",
        top20: "En İyi 20",
        top100: "En İyi 100",
        gainers: "En Çok Yükselenler",
        losers: "En Çok Düşenler",
        aiCoins: "Yapay Zeka (AI)",
        defiCoins: "DeFi",
        gamingCoins: "Gaming",
        metaverse: "Metaverse",
        layer1: "Katman 1 (L1)",
        layer2: "Katman 2 (L2)",
        meme: "Meme Coinler",
        web3: "Web3",
        stablecoins: "Stabil Coinler",
        liquidStaking: "Likit Stake",
        rwa: "RWA (Gerçek Dünya Varlıkları)",
        latestNews: "Son Dakika Haberleri",
        newsDesc: "Kripto dünyasından anlık gelişmeler ve analizler.",
        readMore: "Devamını Oku",
        source: "Kaynak",
        loadMore: "Tüm Haberleri Gör",
        allCaughtUp: "Tüm güncel haberleri gördünüz.",
        localSources: "Yerli Kaynaklar",
        globalSources: "Global Kaynaklar",
        btcNews: "Bitcoin Haberleri",
        ethNews: "Ethereum Haberleri",
        altcoinNews: "Altcoin Haberleri",
        regulationNews: "Regülasyon",
        heatmap: "Isı Haritası",
    },
    en: {
        home: "Home",
        market: "Market",
        portfolio: "Portfolio",
        news: "News",
        connectWallet: "Connect Wallet",
        heroBadge: "Live Market Data",
        heroTitle: "Track Crypto",
        heroTitlePro: "Like a Pro",
        heroTitleTrack: "",
        heroDesc: "Real-time prices, advanced charts, and portfolio tracking. The most beautiful way to stay updated with the crypto market.",
        startExploring: "Start Exploring",
        viewPortfolio: "View Portfolio",
        realTimeUpdates: "Real-Time Updates",
        realTimeUpdatesDesc: "Live prices streaming directly from major exchanges via CoinGecko.",
        securePortfolio: "Secure Portfolio",
        securePortfolioDesc: "Track your assets locally without compromising your private keys.",
        advancedAnalytics: "Advanced Analytics",
        advancedAnalyticsDesc: "Professional grade charts and technical indicators at your fingertips.",
        marketOverview: "Market Overview",
        topCoins: "Top Cryptocurrencies by Market Cap",
        searchPlaceholder: "Search coins...",
        coin: "Coin",
        price: "Price",
        change24h: "24h Change",
        marketCap: "Market Cap",
        last7Days: "Last 7 Days",
        noCoinsFound: "No coins found matching",
        rank: "Rank",
        activity: "Price Chart",
        about: "About",
        totalBalance: "Total Balance",
        profitAndLoss: "Total Profit / Loss",
        activeAssets: "Active Assets",
        asset: "Asset",
        balance: "Balance",
        value: "Value",
        action: "Action",
        noAssets: "No assets yet. Click \"Add Asset\" to start tracking.",
        assetAllocation: "Asset Allocation",
        addAsset: "Add Asset",
        selectCoin: "Select Coin",
        amountHeld: "Amount Held",
        cancel: "Cancel",
        save: "Add Asset",
        comingSoon: "Coming Soon",
        currency: "Currency",
        allSuffix: "All",
        top20: "Top 20",
        top100: "Top 100",
        gainers: "Gainers",
        losers: "Losers",
        aiCoins: "AI Coins",
        defiCoins: "DeFi",
        gamingCoins: "Gaming",
        metaverse: "Metaverse",
        layer1: "Layer 1 (L1)",
        layer2: "Layer 2 (L2)",
        meme: "Meme Coins",
        web3: "Web3",
        stablecoins: "Stablecoins",
        liquidStaking: "Liquid Staking",
        rwa: "RWA (Real World Assets)",
        latestNews: "Latest Crypto News",
        newsDesc: "Stay updated with real-time developments in the crypto space.",
        readMore: "Read More",
        source: "Source",
        loadMore: "View All News",
        allCaughtUp: "You're all caught up.",
        localSources: "Local Sources",
        globalSources: "Global Sources",
        btcNews: "Bitcoin News",
        ethNews: "Ethereum News",
        altcoinNews: "Altcoin News",
        regulationNews: "Regulation",
        heatmap: "Heatmap",
    }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(() => localStorage.getItem('coinpulse_lang') || 'tr');
    const [currency, setCurrency] = useState(() => localStorage.getItem('coinpulse_currency') || 'usd');

    useEffect(() => {
        localStorage.setItem('coinpulse_lang', lang);
    }, [lang]);

    useEffect(() => {
        localStorage.setItem('coinpulse_currency', currency);
    }, [currency]);

    const t = (key) => translations[lang][key] || key;

    const toggleLanguage = () => {
        setLang(prev => prev === 'tr' ? 'en' : 'tr');
    };

    const changeCurrency = (curr) => {
        setCurrency(curr.toLowerCase());
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
            minimumFractionDigits: 2,
            maximumFractionDigits: price < 1 ? 6 : 2
        }).format(price);
    };

    const currencySymbol = currency === 'try' ? '₺' : currency === 'eur' ? '€' : '$';

    return (
        <LanguageContext.Provider value={{ 
            lang, 
            t, 
            toggleLanguage, 
            currency, 
            changeCurrency, 
            formatPrice,
            currencySymbol 
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
