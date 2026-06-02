import React from 'react';
import { motion } from 'framer-motion';

export const CATEGORIES = [
  { id: 'all', label: 'All Resources' },
  { id: 'notes', label: 'Notes' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'lab-manuals', label: 'Lab Manuals' },
  { id: 'question-papers', label: 'Question Papers' },
  { id: 'question-bank', label: 'Question Bank' },
];

interface CategoryTabsProps {
  activeCategory: string;
  setActiveCategory: (id: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ activeCategory, setActiveCategory }) => {
  return (
    <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setActiveCategory(cat.id)}
          className={`relative px-6 py-3 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
            activeCategory === cat.id ? 'text-white' : 'text-textSecondary hover:bg-primary/5'
          }`}
        >
          {activeCategory === cat.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-primary rounded-full"
              transition={{ type: 'spring', duration: 0.5 }}
            />
          )}
          <span className="relative z-10">{cat.label}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
