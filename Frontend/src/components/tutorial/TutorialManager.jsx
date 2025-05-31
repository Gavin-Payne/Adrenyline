import React, { useState, useEffect } from 'react';
import Tutorial from './Tutorial';

// Add default values for props to prevent errors
const TutorialManager = ({ onChangeTab = () => {}, activeTab = 0 }) => {
  const [showTutorial, setShowTutorial] = useState(false);
  
  useEffect(() => {
    // Check if this is the user's first time
    const tutorialCompleted = localStorage.getItem('tutorialCompleted');
    if (!tutorialCompleted) {
      // Show tutorial after a short delay to let the app load
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const handleCompleteTutorial = () => {
    localStorage.setItem('tutorialCompleted', 'true');
    setShowTutorial(false);
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