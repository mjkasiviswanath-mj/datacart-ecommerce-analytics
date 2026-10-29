import React, { useMemo } from 'react';
import { X, Star, ShoppingBag, CheckCircle, Sparkles, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { Product } from '../types';
import { getProductRecommendations } from '../utils/recommendationEngine';

interface ProductDetailModalProps {
  product: Product | null;
  allProducts: Product[];
  onClose: () => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  allProducts,
  onClose,
  onAddToCart,
  onSelectProduct,
}) => {
  if (!product) return null;

  // Compute Content-Based recommendations with TF-IDF and Cosine Similarity
  const recommendations = useMemo(() => {
    return getProductRecommendations(product, allProducts, 4);
  }, [product, allProducts]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
              {product.category}
            </span>
            <span className="text-xs text-slate-400">ID: {product.id}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto p-6 space-y-8">
          {/* Main Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Image */}
            <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs">
                <Star className="w-3.5 h-3.5 fill-slate-950" />
                <span>{product.rating} / 5.0</span>
              </span>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {product.name}
              </h2>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-slate-900">${product.price}</span>
                <span className="text-xs text-slate-400">USD</span>
                <span
                  className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${
                    product.stock > 10
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : product.stock > 0
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
                </span>
              </div>

              <div className="text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                {product.description}
              </div>

              {/* Specifications / Features */}
              {product.features && product.features.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Key Features & Tags:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {product.features.map((feature, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium"
                      >
                        <Tag className="w-3 h-3 text-slate-400" />
                        <span>{feature}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart CTA */}
              <div className="pt-4">
                <button
                  onClick={() => {
                    onAddToCart(product, 1);
                  }}
                  disabled={product.stock === 0}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 13: Product Recommendation ⭐ */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Recommended For You
                  </h3>
                  <p className="text-xs text-slate-500">
                    Calculated using TF-IDF Vectorization & Cosine Similarity across category, specs & descriptions
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded self-start sm:self-auto">
                Content-Based ML Model
              </span>
            </div>

            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {recommendations.map(({ product: recProduct, similarityScore, matchingFeatures }) => (
                <div
                  key={recProduct.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between hover:border-indigo-300 transition group"
                >
                  <div>
                    <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-slate-200 mb-2.5">
                      <img
                        src={recProduct.image}
                        alt={recProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      {/* Similarity Score Badge */}
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white shadow-xs">
                        {Math.round(similarityScore * 100)}% match
                      </span>
                    </div>

                    <h4
                      onClick={() => onSelectProduct(recProduct)}
                      className="font-semibold text-slate-900 text-xs line-clamp-1 hover:text-indigo-600 cursor-pointer transition"
                      title={recProduct.name}
                    >
                      {recProduct.name}
                    </h4>

                    <div className="flex items-center justify-between mt-1 text-xs">
                      <span className="font-bold text-slate-900">${recProduct.price}</span>
                      <span className="text-[10px] text-slate-400">{recProduct.category}</span>
                    </div>

                    {matchingFeatures.length > 0 && (
                      <div className="mt-2 text-[10px] text-slate-500 flex flex-wrap gap-1">
                        <span className="font-semibold text-slate-600">Sim:</span>
                        {matchingFeatures.slice(0, 2).map((word, idx) => (
                          <span key={idx} className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {word}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-3 mt-2 border-t border-slate-200">
                    <button
                      onClick={() => onSelectProduct(recProduct)}
                      className="py-1.5 px-2 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition text-center cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onAddToCart(recProduct)}
                      className="py-1.5 px-2 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition text-center cursor-pointer"
                    >
                      Add +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
