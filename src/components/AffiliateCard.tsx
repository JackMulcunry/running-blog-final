import React from "react";
import { Package, ExternalLink } from "lucide-react";

export interface AffiliateProduct {
  id: string;
  name: string;
  url: string;
  image: string;
  price: string;
  category: string;
}

const AffiliateCard: React.FC<{ product: AffiliateProduct }> = ({ product }) => {
  if (!product.url) return null;

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-brand-orange/40 hover:shadow-sm transition-all duration-150">
      {/* Image / placeholder */}
      <div className="w-14 h-14 flex-shrink-0 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden flex items-center justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-1"
          />
        ) : (
          <Package className="w-6 h-6 text-gray-300" />
        )}
      </div>

      {/* Name + price */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1a1a1a] leading-tight truncate">
          {product.name}
        </p>
        {product.price && (
          <p className="text-xs text-gray-400 mt-0.5">{product.price}</p>
        )}
      </div>

      {/* CTA */}
      <a
        href={product.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="flex-shrink-0 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] font-bold px-3.5 py-2 bg-brand-orange text-white rounded-full hover:bg-[#d4471a] transition-colors"
      >
        Check Price
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
};

export default AffiliateCard;
