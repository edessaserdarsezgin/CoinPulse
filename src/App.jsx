import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Market from './pages/Market';
import CoinDetail from './pages/CoinDetail';
import Portfolio from './pages/Portfolio';
import News from './pages/News';
import Heatmap from './pages/Heatmap';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="market" element={<Market />} />
        <Route path="heatmap" element={<Heatmap />} />
        <Route path="coin/:id" element={<CoinDetail />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="news" element={<News />} />
      </Route>
    </Routes>
  );
}

export default App;
