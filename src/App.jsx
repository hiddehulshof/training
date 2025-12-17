import React, { useState } from 'react';
import DataManagement from './components/DataManagement';
import CalorieTracker from './components/CalorieTracker';
import Insights from './components/Insights';
import TrainingLogModal from './components/TrainingLogModal';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomeTab from './tabs/HomeTab';
import CircuitTab from './tabs/CircuitTab';
import ListTab from './tabs/ListTab';
import { useData } from './hooks/useData';
import { getDayPlan, getTheme, getIcon } from './utils/planner';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modals
  const [showInsights, setShowInsights] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);

  // Data Hook
  const {
    loading,
    recipes, // Kept for now if needed by other components, but ListTab/HomeTab might need it? (Home -> Recipe Cards)
    events,
    exercises,
    habits,
    setHabits,
    shoppingListItems,
    setShoppingListItems,
    userStats,
    refreshData
  } = useData();

  // Helper Logic
  const toISODate = (d) => d.toISOString().split('T')[0];
  const dateStr = toISODate(currentDate);
  const plan = getDayPlan(dateStr, currentDate.getDay(), events);
  const theme = getTheme(plan.type);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl overflow-hidden relative flex flex-col">

        {/* Persistent Header */}
        <Header
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          userStats={userStats}
          setShowAdminModal={setShowSettings}
        />

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {activeTab === 'home' && (
            <HomeTab
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              userStats={userStats}
              plan={plan}
              theme={theme}
              habits={habits}
              setHabits={setHabits}
              setShowAdminModal={setShowSettings}
              setShowTrainingModal={setShowTrainingModal}
              setActiveTab={setActiveTab}
              getIcon={getIcon}
            />
          )}

          {activeTab === 'food' && (
            <div className="pb-24 pt-4 px-4">
              <CalorieTracker
                onShowInsights={() => setShowInsights(true)}
                date={currentDate}
              />
            </div>
          )}

          {activeTab === 'circuit' && (
            <CircuitTab exercises={exercises} />
          )}

          {activeTab === 'list' && (
            <ListTab
              shoppingListItems={shoppingListItems}
              setShoppingListItems={setShoppingListItems}
              onSwitchToFood={() => setActiveTab('food')}
            />
          )}
        </div>

        {/* Modals & Overlays */}
        {showSettings && <DataManagement onClose={() => { setShowSettings(false); refreshData(); }} />}

        {showTrainingModal && (
          <TrainingLogModal
            onClose={() => setShowTrainingModal(false)}
            trainingType={plan.type}
          />
        )}

        {showInsights && (
          <div className="absolute inset-0 z-[100] bg-white">
            <Insights onClose={() => setShowInsights(false)} />
          </div>
        )}

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}