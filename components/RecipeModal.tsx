import React, { useState, useEffect } from 'react';
import { Recommendation, UserPreferences } from '../types';
import { getFullRecipe } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import AlertTriangleIcon from './icons/AlertTriangleIcon';

interface RecipeModalProps {
  recommendation: Recommendation;
  onClose: () => void;
  preferences: UserPreferences;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ recommendation, onClose, preferences }) => {
  const [fullRecipe, setFullRecipe] = useState<Pick<Recommendation, 'ingredients' | 'instructions'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const recipeData = await getFullRecipe(recommendation.dishName, recommendation.description, preferences);
        setFullRecipe(recipeData);
      } catch (err: any) {
        setError(err.message || 'Could not load the recipe.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [recommendation.dishName, recommendation.description, preferences]);

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-modal-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-modal-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-5 border-b border-stone-200 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-2xl font-bold text-stone-800">{recommendation.dishName}</h2>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="overflow-y-auto p-6 space-y-6">
            <img 
                src={`data:image/png;base64,${recommendation.imageBase64}`} 
                alt={recommendation.dishName}
                className="w-full h-64 object-cover rounded-xl"
            />
            
            {isLoading && <LoadingSpinner />}
            
            {error && (
                <div className="text-center p-4 bg-red-100/60 text-red-700 rounded-lg flex items-center justify-center gap-2">
                    <AlertTriangleIcon className="w-5 h-5" />
                    <p>{error}</p>
                </div>
            )}
            
            {fullRecipe && (
                <div className="animate-fade-in">
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-stone-800 mb-3 border-b pb-2">Ingredients</h3>
                        <ul className="list-disc list-inside space-y-1.5 text-stone-700 text-sm">
                            {fullRecipe.ingredients?.map((ing, i) => <li key={i}>{ing}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-stone-800 mb-3 border-b pb-2">Instructions</h3>
                        <ol className="list-decimal list-inside space-y-3 text-stone-700 text-sm">
                            {fullRecipe.instructions?.map((step, i) => <li key={i}>{step}</li>)}
                        </ol>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default RecipeModal;