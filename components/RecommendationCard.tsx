import React, { useState, useEffect, useRef } from 'react';
import { Recommendation } from '../types';

interface RecommendationCardProps {
  recommendation: Recommendation;
  index: number;
  onViewRecipe: () => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, index, onViewRecipe }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(`data:image/png;base64,${recommendation.imageBase64}`);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [recommendation.imageBase64]);

  return (
    <div 
      ref={cardRef}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl overflow-hidden transform hover:-translate-y-1 transition-all duration-300 ease-in-out border border-stone-100 flex flex-col group animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative w-full h-48 overflow-hidden bg-stone-200">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={recommendation.dishName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 animate-fade-in"
            style={{ animationDuration: '0.3s' }}
          />
        ) : (
          <div className="w-full h-full bg-stone-200 animate-pulse"></div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-stone-800 mb-2">{recommendation.dishName}</h3>
        <p className="text-stone-600 text-sm mb-4 flex-grow">{recommendation.description}</p>
        <div className="mt-auto">
           <button
            onClick={onViewRecipe}
            className="w-full text-center bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 ease-in-out"
          >
            View Recipe
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;