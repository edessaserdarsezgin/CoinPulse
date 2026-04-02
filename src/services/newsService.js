import axios from 'axios';

// We use official RSS feeds converted to JSON via a public service
// FEEDS are grouped by source name and URL
const NEWS_SOURCES = [
    { name: 'CoinTelegraph', url: 'https://cointelegraph.com/rss', lang: 'en' },
    { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', lang: 'en' },
    { name: 'CryptoSlate', url: 'https://cryptoslate.com/feed/', lang: 'en' },
    { name: 'Uzmancoin', url: 'https://uzmancoin.com/feed/', lang: 'tr' },
    { name: 'Coinkolik', url: 'https://coinkolik.com/feed/', lang: 'tr' }
];

export const getNews = async () => {
    try {
        console.log("Fetching global and Turkish news from official RSS feeds...");
        
        // Fetch from all sources in parallel
        const responses = await Promise.all(
            NEWS_SOURCES.map(source => 
                axios.get(`https://api.rss2json.com/v1/api.json?rss_url=${source.url}`)
                    .catch(err => {
                        console.warn(`Failed to fetch from ${source.name}:`, err);
                        return { data: { items: [] } };
                    })
            )
        );

        // Combine and map to our format
        let combinedNews = [];
        
        responses.forEach((response, index) => {
            if (response.data && response.data.items) {
                const source = NEWS_SOURCES[index];
                const items = response.data.items.map(item => {
                    // Smart image extraction
                    let imageurl = item.thumbnail || item.enclosure?.link;
                    
                    // If no image, try to find one in content/description
                    const searchContent = (item.description || '') + (item.content || '');
                    if ((!imageurl || imageurl.length < 5) && searchContent) {
                        const imgMatch = searchContent.match(/<img[^>]+src=["']([^"'>]+)["']/i);
                        if (imgMatch && imgMatch[1]) {
                            imageurl = imgMatch[1];
                        }
                    }

                    // Uzmancoin & CORS Limitation: We can't fetch OG tags from client-side easily.
                    // Let's provide a much better thematic fallback for Uzmancoin instead of a generic one.
                    if ((!imageurl || imageurl.length < 5) && source.url.includes('uzmancoin')) {
                        const title = item.title.toLowerCase();
                        if (title.includes('bitcoin') || title.includes('btc')) {
                            imageurl = 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=800';
                        } else if (title.includes('ethereum') || title.includes('eth')) {
                            imageurl = 'https://images.unsplash.com/photo-1622790694515-6d7ef9e945d0?q=80&w=800';
                        } else if (title.includes('ripple') || title.includes('xrp')) {
                            imageurl = 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=800';
                        } else if (title.includes('binance') || title.includes('bnb')) {
                            imageurl = 'https://images.unsplash.com/photo-1621416953228-86838848777e?q=80&w=800';
                        } else if (title.includes('elon') || title.includes('musk') || title.includes('doge')) {
                            imageurl = 'https://images.unsplash.com/photo-1611974714008-662354f3630f?q=80&w=800';
                        } else {
                            // High quality crypto background
                            imageurl = 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800';
                        }
                    }

                    if (imageurl && imageurl.startsWith('/')) {
                        imageurl = (source.url.startsWith('https://uzmancoin.com') ? 'https://uzmancoin.com' : '') + imageurl;
                    }

                    // Fallback
                    if (!imageurl || imageurl.length < 5) {
                        imageurl = source.lang === 'tr' 
                            ? 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800' 
                            : 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=800';
                    }

                    return {
                        id: item.guid || item.link,
                        title: item.title,
                        url: item.link,
                        imageurl: imageurl,
                        body: item.description?.replace(/<[^>]*>?/gm, '').slice(0, 200) + '...',
                        published_on: new Date(item.pubDate).getTime() / 1000,
                        source: source.name,
                        lang: source.lang
                    };
                });
                combinedNews = [...combinedNews, ...items];
            }
        });

        // Sort by date (newest first)
        const sortedNews = combinedNews.sort((a, b) => b.published_on - a.published_on);
        
        console.log(`Successfully fetched ${sortedNews.length} news items from ${NEWS_SOURCES.length} sources.`);
        return sortedNews;

    } catch (error) {
        console.warn("Global News Error. Using fallback data.", error);
        return [
            {
                id: '1',
                title: 'Bitcoin Hits All-Time High as Institutional Adoption Surges',
                url: 'https://cointelegraph.com/news/bitcoin-hits-all-time-high-as-institutional-adoption-surges',
                imageurl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=800&q=80',
                body: 'The leading cryptocurrency has once again broken through major resistance levels...',
                published_on: Date.now() / 1000,
                source: 'CoinTelegraph',
                lang: 'en'
            }
        ];
    }
};
