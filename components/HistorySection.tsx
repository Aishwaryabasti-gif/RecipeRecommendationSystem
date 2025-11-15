import React from 'react';
import { HistoryItem } from '../types';
import HistoryIcon from './icons/HistoryIcon';
import TrashIcon from './icons/TrashIcon';

interface HistorySectionProps {
  history: HistoryItem[];
  onViewRecipe: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

const HistoryCard: React.FC<{ item: HistoryItem; onClick: () => void }> = ({ item, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white rounded-xl shadow-md hover:shadow-lg overflow-hidden transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border border-stone-100 flex items-center group"
  >
    <img 
      src={`data:image/png;base64,${item.recommendation.imageBase64}`} 
      alt={item.recommendation.dishName}
      className="w-20 h-20 object-cover" 
    />
    <div className="p-3">
      <h4 className="font-bold text-stone-800 text-sm">{item.recommendation.dishName}</h4>
      <p className="text-xs text-stone-500">{item.recommendation.description.substring(0, 40)}...</p>
    </div>
  </div>
);


const HistorySection: React.FC<HistorySectionProps> = ({ history, onViewRecipe, onClearHistory }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-stone-800 flex items-center">
          <HistoryIcon className="w-7 h-7 mr-3 text-green-600"/>
          Recently Viewed Recipes
        </h2>
        <button 
          onClick={onClearHistory}
          className="flex items-center gap-2 text-sm text-stone-500 hover:text-red-600 transition-colors font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50"
        >
          <TrashIcon className="w-4 h-4"/>
          Clear History
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {history.map((item, index) => (
          <HistoryCard 
            key={`${item.recommendation.dishName}-${index}`} 
            item={item}
            onClick={() => onViewRecipe(item)}
          />
        ))}
      </div>
    </div>
  );
};

export default HistorySection;
