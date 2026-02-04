import React from 'react';
import { TabType } from '../types';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'effects', label: 'Effects', icon: '✨' },
    { id: 'console', label: 'Console', icon: '💻' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="bg-dark-card border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-6 py-4 font-semibold transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'text-accent-primary border-accent-primary'
                  : 'text-gray-400 border-transparent hover:text-white hover:border-gray-600'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;
