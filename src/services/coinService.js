import axios from 'axios';

// NOTE: CoinGecko FREE API has strict rate limits. 
const API_KEY = "CG-xxZcfSuHpw9jRppPKmRcf8Ue"; 
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

const api = axios.create({
  baseURL: COINGECKO_API_URL,
  timeout: 10000,
  headers: API_KEY ? { 'x-cg-demo-api-key': API_KEY } : {}
});

const MOCK_COINS = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', current_price: 96540.23, price_change_percentage_24h: 2.45, market_cap: 1900000000000, sparkline_in_7d: { price: [94000, 95000, 94500, 96000, 95500, 96500, 96540] } },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', current_price: 2450.12, price_change_percentage_24h: -1.2, market_cap: 350000000000, sparkline_in_7d: { price: [2500, 2480, 2490, 2460, 2470, 2440, 2450] } },
  { id: 'solana', symbol: 'sol', name: 'Solana', image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png', current_price: 154.50, price_change_percentage_24h: 5.67, market_cap: 75000000000, sparkline_in_7d: { price: [140, 145, 142, 150, 148, 153, 154] } },
];

export const getCoins = async (currency = 'usd', perPage = 20, category = '', page = 1) => {
  try {
    const params = {
      vs_currency: currency,
      order: 'market_cap_desc',
      per_page: perPage,
      page: page,
      sparkline: true,
      price_change_percentage: '24h'
    };

    if (category && category !== 'all') {
      params.category = category;
    }

    const response = await api.get('/coins/markets', { params });
    localStorage.setItem(`coinpulse_market_cache_${currency}_${category}_${perPage}_${page}`, JSON.stringify(response.data));
    return { data: response.data, error: null };
  } catch (error) {
    const status = error.response?.status;
    const isRateLimit = status === 429;
    
    console.warn(isRateLimit ? "CoinGecko Rate Limit Reached." : "API Error. Fallback to cache.");
    
    const cache = localStorage.getItem(`coinpulse_market_cache_${currency}_${category}_${perPage}_${page}`);
    if (cache) return { data: JSON.parse(cache), error: null };
    
    // Return mock data for general errors, but flag rate limit specifically
    return { 
      data: page === 1 ? MOCK_COINS : [], 
      error: isRateLimit ? 'rate_limit' : 'generic',
      message: isRateLimit ? "API yoğunluğu (Rate Limit). Lütfen bir dakika sonra tekrar dene." : "Veri alınamadı."
    };
  }
};

export const getCoinDetail = async (id) => {
  try {
    const response = await api.get(`/coins/${id}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: true,
      }
    });
    localStorage.setItem(`coinpulse_detail_cache_${id}`, JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    const cache = localStorage.getItem(`coinpulse_detail_cache_${id}`);
    if (cache) return JSON.parse(cache);
    return null;
  }
};

export const getCoinHistory = async (id, days = 7, currency = 'usd') => {
  try {
    const response = await api.get(`/coins/${id}/market_chart`, {
      params: {
        vs_currency: currency,
        days: days,
      },
    });
    localStorage.setItem(`coinpulse_history_cache_${id}_${days}_${currency}`, JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    const cache = localStorage.getItem(`coinpulse_history_cache_${id}_${days}_${currency}`);
    if (cache) return JSON.parse(cache);
    return { prices: [] };
  }
};
