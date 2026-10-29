import React from 'react';
import { Search, ArrowRight, BarChart2, ShieldCheck, Zap, TrendingUp, Star, ShoppingBag, Eye } from 'lucide-react';
import { Product, SalesAnalytics } from '../types';
import { VoiceSearchBar } from './VoiceSearchBar';

interface HomeViewProps {
  products: Product[];
  analytics: SalesAnalytics;
  onSelectCategory: (category: string) => void;
  onExploreProducts: () => void;
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onExecuteSearch: () => void;
  onViewAnalytics: () => void;
}

const CATEGORY_ITEMS = [
  { name: 'Electronics', count: '4 Items', icon: '🎧', desc: 'Audio, mice & accessories' },
  { name: 'Laptops', count: '4 Items', icon: '💻', desc: 'Ultrabooks & workstations' },
  { name: 'Mobile Phones', count: '4 Items', icon: '📱', desc: 'Flagship smartphones' },
  { name: 'Accessories', count: '4 Items', icon: '⚡', desc: 'Chargers, stands & SSDs' },
  { name: 'Books', count: '4 Items', icon: '📚', desc: 'Data science & ML texts' },
  { name: 'Smart Devices', count: '4 Items', icon: '⌚', desc: 'Watches, plugs & hubs' },
];

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  analytics,
  onSelectCategory,
  onExploreProducts,
  onViewProduct,
  onAddToCart,
  searchQuery,
  setSearchQuery,
  onExecuteSearch,
  onViewAnalytics,
}) => {
  // Show 8 featured products on home page
  const featuredProducts = products.slice(0, 8);

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        {/* Decorative background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Smart Shopping & Analytics</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            DataCart
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-light">
            “Shop smarter with data-driven insights.”
          </p>

          {/* Voice Search Bar Component */}
          <div className="pt-2 max-w-xl">
            <VoiceSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={onExecuteSearch}
              placeholder="Search products or click 🎙️ to speak..."
              size="large"
            />
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={onExploreProducts}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Explore All Products</span>
            </button>
            <button
              onClick={onViewAnalytics}
              className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition flex items-center gap-2 cursor-pointer"
            >
              <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Sales Analytics</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Strip */}
        <div className="mt-8 pt-8 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-slate-300 text-xs">
          <div>
            <div className="text-white font-bold text-base sm:text-lg">${analytics.totalRevenue.toLocaleString()}</div>
            <div className="text-slate-400">Total Tracked Revenue</div>
          </div>
          <div>
            <div className="text-white font-bold text-base sm:text-lg">{analytics.totalOrders} Orders</div>
            <div className="text-slate-400">Database Order Records</div>
          </div>
          <div>
            <div className="text-white font-bold text-base sm:text-lg">TF-IDF & Cosine</div>
            <div className="text-slate-400">ML Recommendation Model</div>
          </div>
          <div>
            <div className="text-white font-bold text-base sm:text-lg">Pandas & NumPy</div>
            <div className="text-slate-400">Data Science Aggregations</div>
          </div>
        </div>
      </section>

      {/* Product Categories Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Product Categories</h2>
            <p className="text-sm text-slate-500">Explore top categories with smart features and best prices</p>
          </div>
          <button
            onClick={onExploreProducts}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORY_ITEMS.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onSelectCategory(cat.name)}
              className="p-4 bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition duration-150 flex flex-col justify-between group shadow-2xs cursor-pointer"
            >
              <div className="text-2xl mb-2">{cat.icon}</div>
              <div>
                <div className="font-semibold text-sm text-slate-900 group-hover:text-indigo-600 transition">
                  {cat.name}
                </div>
                <div className="text-[11px] text-slate-500">{cat.count}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products Section (6-8 items) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Featured Products</h2>
            <p className="text-sm text-slate-500">Hand-picked top-rated items with available stock</p>
          </div>
          <button
            onClick={onExploreProducts}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>See full catalog ({products.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition flex flex-col justify-between group"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-white/90 backdrop-blur-xs text-slate-700 shadow-xs">
                  {product.category}
                </span>
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs">
                  <Star className="w-3 h-3 fill-slate-950" />
                  <span>{product.rating}</span>
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3
                    onClick={() => onViewProduct(product)}
                    className="font-semibold text-slate-900 text-sm line-clamp-1 hover:text-indigo-600 cursor-pointer transition"
                    title={product.name}
                  >
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-slate-900">${product.price}</span>
                    <span className="text-[11px] text-slate-400 ml-1">USD</span>
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                    product.stock > 10 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {product.stock} in stock
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => onViewProduct(product)}
                    className="w-full py-2 px-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </button>
                  <button
                    onClick={() => onAddToCart(product)}
                    disabled={product.stock === 0}
                    className="w-full py-2 px-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Simple Sales/Data Analytics Section Preview (Requirement 4 & 10) */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Real-Time Sales Intelligence</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Live Data Science Metrics Overview
            </h2>
            <p className="text-sm text-slate-600">
              Computed from the database using Pandas-equivalent statistical aggregation.
            </p>
          </div>
          <button
            onClick={onViewAnalytics}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <span>Open Full Analytics Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Total Revenue</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              ${analytics.totalRevenue.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">
              From completed orders
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Average Order Value (AOV)</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              ${analytics.avgOrderValue}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 inline-block">
              Per placed customer order
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Total Orders</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {analytics.totalOrders}
            </div>
            <span className="text-[11px] text-indigo-600 font-medium mt-1 inline-block">
              Across 8 months of data
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Active Categories</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {analytics.categorySales.length}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 inline-block">
              Top: {analytics.categorySales[0]?.category || 'Electronics'}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
