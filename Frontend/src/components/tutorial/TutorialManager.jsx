import React, { useState, useEffect } from 'react';
import Tutorial from './Tutorial';

const TutorialManager = ({ onChangeTab = () => {}, activeTab = 0, forceShow = false, userData, refreshUserData }) => {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (forceShow) {
      setShowTutorial(true);
      return;
    }
    if (userData && userData.tutorialCompleted === false) {
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [forceShow, userData]);

  const handleCompleteTutorial = async () => {
    setShowTutorial(false);
    try {
      await import('../../services/userService').then(({ userService }) => userService.setTutorialCompleted());
      if (refreshUserData) await refreshUserData();
    } catch (err) {
      console.error('Failed to mark tutorial as completed:', err);
    }
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-20px); }
        60% { transform: translateY(-10px); }
      }
      
      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.7; }
        50% { transform: scale(1.3); opacity: 0.2; }
        100% { transform: scale(1); opacity: 0.7; }
      }
      
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }
      
      .tutorial-pointer {
        animation: float 2s infinite ease-in-out;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <>
      {showTutorial && (
        <Tutorial 
          onComplete={handleCompleteTutorial} 
          onChangeTab={onChangeTab}
          activeTab={activeTab}
        />
      )}
    </>
  );
};

export default TutorialManager;