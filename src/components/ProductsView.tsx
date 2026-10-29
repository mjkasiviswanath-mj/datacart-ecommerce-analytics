import React, { useState, useMemo } from 'react';
import { Search, Filter, Star, ShoppingBag, Eye, SlidersHorizontal, Check } from 'lucide-react';
import { Product } from '../types';
import { CATEGORIES } from '../sampleData';
import { VoiceSearchBar } from './VoiceSearchBar';

interface ProductsViewProps {
  products: Product[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  onViewProduct,
  onAddToCart,
}) => {
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [stockOnly, setStockOnly] = useState<boolean>(false);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      const matchesCategory =
        selectedCategory === 'All' || product.category.toLowerCase() === selectedCategory.toLowerCase();

      // Search filter
      const matchesSearch =
        !searchQuery.trim() ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Stock filter
      const matchesStock = !stockOnly || product.stock > 0;

      return matchesCategory && matchesSearch && matchesStock;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // default featured order
    });
  }, [products, selectedCategory, searchQuery, stockOnly, sortBy]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Products Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse our complete inventory with live stock levels and ML-powered item recommendations.
          </p>
        </div>
        <div className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg self-start sm:self-auto font-medium">
          Showing <span className="font-bold text-slate-900">{filteredProducts.length}</span> of {products.length} products
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4 shadow-2xs">
        {/* Search bar with voice search and Sort controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <VoiceSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search products or click 🎙️ to speak..."
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500 flex items-center gap-1 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
            >
              <option value="featured">Featured / Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>

            <button
              onClick={() => setStockOnly(!stockOnly)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 cursor-pointer ${
                stockOnly
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {stockOnly && <Check className="w-3 h-3 text-emerald-600" />}
              <span>In Stock Only</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" />
            <span>Category:</span>
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No products matched your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or clearing the category filters to discover more items.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
              setStockOnly(false);
            }}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition flex flex-col justify-between group"
            >
              {/* Product Image */}
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

              {/* Product Info */}
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
                    <span className="text-xl font-bold text-slate-900">${product.price}</span>
                    <span className="text-[11px] text-slate-400 ml-1">USD</span>
                  </div>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                      product.stock > 10
                        ? 'bg-emerald-50 text-emerald-700'
                        : product.stock > 0
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => onViewProduct(product)}
                    className="w-full py-2 px-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Details & ML</span>
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
      )}
    </div>
  );
};
