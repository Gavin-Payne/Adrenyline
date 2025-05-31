import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowRight, FaArrowLeft, FaTimes, FaCheckCircle, 
  FaCoins, FaStore, FaChartLine, FaGavel, FaExchangeAlt,
  FaCalendarAlt, FaTrophy, FaChartBar, FaArrowDown, FaCog, FaEye, FaArrowUp
} from 'react-icons/fa';
import commonIcon from '../../assets/common.png';
import premiumIcon from '../../assets/premium.png';

const Tutorial = ({ onComplete, onChangeTab, activeTab }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [animationDirection, setAnimationDirection] = useState('next');
  const [showPointer, setShowPointer] = useState(false);
  const [pointerPosition, setPointerPosition] = useState({});
  const [waitingForTabChange, setWaitingForTabChange] = useState(false);
  const [showingElement, setShowingElement] = useState(false);
  const [fullTransparencyMode, setFullTransparencyMode] = useState(false);
  const [tutorialMinimized, setTutorialMinimized] = useState(false);
  const pointerRef = useRef(null);

  // Tutorial steps with associated tab indices and element selectors
  const steps = [
    // Welcome and introduction
    {
      title: "Welcome to Imperium",
      description: "Your gateway to sports prediction markets. Make predictions on player performances and win rewards based on real-world sports outcomes.",
      icon: <FaTrophy style={{ fontSize: '48px', color: '#6366F1' }} />,
      tab: 0,
      targetSelector: null,
    },
    // Currency system
    {
      title: "Dual Currency System",
      description: (
        <div>
          <p>Imperium uses two market-driven currencies:</p>
          <div style={styles.currencyContainer}>
            <div style={styles.currencyItem}>
              <img src={commonIcon} alt="SBM" style={styles.currencyIcon} />
              <div>
                <h4 style={styles.currencyName}>SBM (Soybean Meal)</h4>
                <p style={styles.currencyDesc}>Common currency for standard auctions. Market value fluctuates with real soybean meal futures.</p>
              </div>
            </div>
            <div style={styles.currencyItem}>
              <img src={premiumIcon} alt="ALU" style={styles.currencyIcon} />
              <div>
                <h4 style={styles.currencyName}>ALU (Aluminum)</h4>
                <p style={styles.currencyDesc}>Premium currency for high-value auctions. Market value tracks real aluminum futures.</p>
              </div>
            </div>
          </div>
          <p style={styles.disclaimer}>Note: In-game currencies have no real-world value and cannot be exchanged for money.</p>
        </div>
      ),
      icon: <FaCoins style={{ fontSize: '48px', color: '#FBBF24' }} />,
      tab: 0, // Dashboard
      targetSelector: "div[class*='balance'], div[class*='currency'], .wallet-section, .user-balance",
      pointerDirection: "top",
    },
    // Trading Interface
    {
      title: "Creating Predictions",
      description: (
        <div>
          <p>Let's go to the Trading Interface to create your own sports performance predictions:</p>
          <ol style={styles.stepsList}>
            <li><strong>Select a Game</strong> - Choose from upcoming NBA games</li>
            <li><strong>Pick a Player</strong> - Select any active player</li>
            <li><strong>Set Performance Metric</strong> - Points, rebounds, assists, etc.</li>
            <li><strong>Choose Condition</strong> - Over, under, exactly, not exactly</li>
            <li><strong>Set Bet Size</strong> - How much currency to stake</li>
            <li><strong>Adjust Multiplier</strong> - Higher risk = bigger rewards</li>
          </ol>
        </div>
      ),
      icon: <FaGavel style={{ fontSize: '48px', color: '#EC4899' }} />,
      tab: 1, // Trading Interface
      targetSelector: "form, div[class*='form'], div[class*='trading'], main > div, div[class*='auction-form']",
      pointerDirection: "top",
      promptTabChange: true,
    },
    // Auction House
    {
      title: "The Auction House",
      description: (
        <div>
          <p>Let's check out the Auction House where you can browse and buy predictions from other users.</p>
          <ul style={styles.featureList}>
            <li><strong>Filter predictions</strong> by currency type, date, player, and more</li>
            <li><strong>Check metrics</strong> like points, assists, rebounds</li>
            <li><strong>See odds</strong> displayed as multipliers</li>
            <li><strong>Buy predictions</strong> by taking the opposite position</li>
            <li><strong>Win the total pot</strong> if your prediction is correct</li>
          </ul>
          <p style={styles.tip}>Tip: Look for predictions with favorable odds for better profit potential!</p>
        </div>
      ),
      icon: <FaExchangeAlt style={{ fontSize: '48px', color: '#10B981' }} />,
      tab: 3, // Auction House
      targetSelector: "div[class*='filter'], div[class*='auction'], div[class*='listing'], main > div",
      pointerDirection: "top",
      promptTabChange: true,
    },
    // Active Auctions
    {
      title: "Your Active Auctions",
      description: (
        <div>
          <p>Once you've created or purchased predictions, they'll appear in your Active Auctions tab.</p>
          <ul style={styles.featureList}>
            <li><strong>Track your positions</strong> - See all your open predictions</li>
            <li><strong>Monitor updates</strong> - Watch real-time stat updates during games</li>
            <li><strong>Check status</strong> - See if your auctions have been sold</li>
          </ul>
        </div>
      ),
      icon: <FaChartBar style={{ fontSize: '48px', color: '#6366F1' }} />,
      tab: 2, // Active Auctions
      targetSelector: "div[class*='active'], div[class*='auction'], div[class*='listing'], main > div",
      pointerDirection: "top",
      promptTabChange: true,
    },
    // Results
    {
      title: "Box Scores & Results",
      description: (
        <div>
          <p>After games complete, view detailed box scores and see which predictions won.</p>
          <ul style={styles.featureList}>
            <li>Access complete player statistics</li>
            <li>See which predictions were successful</li>
            <li>Track historical performance data</li>
          </ul>
        </div>
      ),
      icon: <FaCalendarAlt style={{ fontSize: '48px', color: '#F59E0B' }} />,
      tab: 5, // Box Scores
      targetSelector: "div[class*='box'], div[class*='score'], div[class*='game'], main > div",
      pointerDirection: "top",
      promptTabChange: true,
    },
    // Shop
    {
      title: "Currency Shop",
      description: (
        <div>
          <p>Need more currency? Visit the Shop to purchase SBM and ALU.</p>
          <ul style={styles.featureList}>
            <li>Purchase SBM and ALU with various package sizes</li>
            <li>Prices fluctuate based on real commodity markets</li>
            <li>Look for special discounts on larger packages</li>
          </ul>
          <p>Remember: Prices update every few hours based on real-world commodity futures.</p>
        </div>
      ),
      icon: <FaStore style={{ fontSize: '48px', color: '#F59E0B' }} />,
      tab: 7, // Shop
      targetSelector: "div[class*='shop'], div[class*='store'], div[class*='package'], main > div",
      pointerDirection: "top",
      promptTabChange: true,
    },
    // Settings & Stats
    {
      title: "Account Settings",
      description: (
        <div>
          <p>Review your stats and account information in Settings.</p>
          <ul style={styles.featureList}>
            <li>See your win rate and trading history</li>
            <li>Track your earnings over time</li>
            <li>Access this tutorial again at any time</li>
          </ul>
        </div>
      ),
      icon: <FaCog style={{ fontSize: '48px', color: '#9333EA' }} />,
      tab: 4, // Settings
      targetSelector: "div[class*='settings'], div[class*='profile'], div[class*='account'], main > div",
      pointerDirection: "top",
      promptTabChange: true,
    },
    // Ready to Trade
    {
      title: "Ready to Start Trading",
      description: (
        <div>
          <p>You're all set to start making predictions in Imperium!</p>
          <p>Remember:</p>
          <ul style={styles.featureList}>
            <li>Collect your daily rewards from the Dashboard</li>
            <li>Create your own predictions in the Trading Interface</li>
            <li>Buy others' predictions in the Auction House</li>
            <li>Track your positions in Active Auctions</li>
          </ul>
          <p style={styles.disclaimer}>Imperium is a prediction market for entertainment purposes only. All in-game currencies have no real-world value.</p>
        </div>
      ),
      icon: <FaCheckCircle style={{ fontSize: '48px', color: '#10B981' }} />,
      tab: 0, // Dashboard
      targetSelector: null,
      promptTabChange: true,
    },
  ];

  useEffect(() => {
    if (waitingForTabChange && activeTab === steps[currentStep].tab) {
      setWaitingForTabChange(false);
      setTimeout(() => {
        positionPointerForCurrentStep();
      }, 500);
    }
  }, [activeTab, waitingForTabChange, currentStep]);

  // Effect to position the pointer when steps change
  useEffect(() => {
    const step = steps[currentStep];
    
    // If this step prompts a tab change and we're not on the correct tab
    if (step.promptTabChange && activeTab !== step.tab) {
      setWaitingForTabChange(true);
      onChangeTab(step.tab);
      setShowPointer(false);
    } else {
      // We're already on the correct tab, position the pointer
      positionPointerForCurrentStep();
    }
  }, [currentStep]);

  // Effect to clean up highlights when component unmounts or step changes
  useEffect(() => {
    return () => {
      // Remove any highlight classes that might have been added
      document.querySelectorAll('.tutorial-highlighted-element').forEach(el => {
        el.classList.remove('tutorial-highlighted-element');
      });
    };
  }, [currentStep]);

  // Add CSS for the highlight effect (add in the useEffect that adds style tag)
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .tutorial-highlighted-element {
        position: relative;
        z-index: 999;
        animation: highlight-pulse 2s infinite ease-in-out;
        box-shadow: 0 0 0 4px rgba(108, 92, 231, 0.5);
      }
      
      @keyframes highlight-pulse {
        0% { box-shadow: 0 0 0 4px rgba(108, 92, 231, 0.5); }
        50% { box-shadow: 0 0 0 8px rgba(108, 92, 231, 0.3); }
        100% { box-shadow: 0 0 0 4px rgba(108, 92, 231, 0.5); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Replace the CSS in the second useEffect with this version

useEffect(() => {
  const style = document.createElement('style');
  style.innerHTML = `
    .tutorial-highlighted-element,
    [data-tutorial-highlight="true"] {
      position: relative !important;
      z-index: 9999 !important;
      outline: 8px solid #6C5CE7 !important;
      outline-offset: 8px !important;
      box-shadow: 0 0 70px 20px rgba(108, 92, 231, 0.9), inset 0 0 40px rgba(108, 92, 231, 0.5) !important;
      animation: super-highlight-pulse 1s infinite alternate !important;
    }
    
    @keyframes super-highlight-pulse {
      0% { 
        outline-color: #6C5CE7; 
        box-shadow: 0 0 70px 20px rgba(108, 92, 231, 0.9), inset 0 0 40px rgba(108, 92, 231, 0.5);
      }
      100% { 
        outline-color: #a29ff0; 
        box-shadow: 0 0 100px 30px rgba(108, 92, 231, 1), inset 0 0 60px rgba(108, 92, 231, 0.7);
      }
    }
    
    /* Make the pointer more visible */
    .tutorial-pointer {
      animation: float-attention 1.5s infinite ease-in-out !important;
      filter: drop-shadow(0 0 20px rgba(108, 92, 231, 1)) !important;
    }
    
    @keyframes float-attention {
      0% { transform: translateY(0px) scale(1); }
      50% { transform: translateY(-15px) scale(1.3); }
      100% { transform: translateY(0px) scale(1); }
    }

    @keyframes pulse-button {
      0% { transform: scale(1); box-shadow: 0 4px 15px rgba(108, 92, 231, 0.5); }
      50% { transform: scale(1.05); box-shadow: 0 8px 25px rgba(108, 92, 231, 0.7); }
      100% { transform: scale(1); box-shadow: 0 4px 15px rgba(108, 92, 231, 0.5); }
    }
  `;
  document.head.appendChild(style);
  
  // Remove any stray highlighted elements when component unmounts
  return () => {
    document.head.removeChild(style);
    document.querySelectorAll('.tutorial-highlighted-element, [data-tutorial-highlight="true"]').forEach(el => {
      el.classList.remove('tutorial-highlighted-element');
      el.removeAttribute('data-tutorial-highlight');
    });
  };
}, []);

  // Function to position the pointer for the current step
  const positionPointerForCurrentStep = () => {
    const step = steps[currentStep];
    if (!step.targetSelector) {
      setShowPointer(false);
      return;
    }
  
    // Try a few times with delay in case the element isn't rendered yet
    let attemptCount = 0;
    const maxAttempts = 5;
    
    const tryPositioning = () => {
      const targetElement = document.querySelector(step.targetSelector);
      if (!targetElement) {
        if (attemptCount < maxAttempts) {
          setTimeout(() => {
            attemptCount++;
            tryPositioning();
          }, 500);
        } else {
          setShowPointer(false);
        }
        return;
      }
  
      // Highlight the target element with a subtle overlay
      targetElement.classList.add('tutorial-highlighted-element');
      
      const rect = targetElement.getBoundingClientRect();
      const pointerSize = 60; // Size of the pointer in pixels
  
      // Calculate position based on direction
      let position = {};
      
      switch(step.pointerDirection) {
        case 'top':
          position = {
            left: rect.left + rect.width / 2 - pointerSize / 2,
            top: rect.top - pointerSize - 20, // More space
          };
          break;
        case 'bottom':
          position = {
            left: rect.left + rect.width / 2 - pointerSize / 2,
            top: rect.bottom + 20, // More space
          };
          break;
        case 'left':
          position = {
            left: rect.left - pointerSize - 10,
            top: rect.top + rect.height / 2 - pointerSize / 2,
          };
          break;
        case 'right':
          position = {
            left: rect.right + 10,
            top: rect.top + rect.height / 2 - pointerSize / 2,
          };
          break;
        default:
          position = {
            left: rect.left + rect.width / 2 - pointerSize / 2,
            top: rect.top - pointerSize - 10,
          };
      }
  
      setPointerPosition(position);
      setShowPointer(true);
      
      // Scroll the element into view if needed
      if (rect.top < 100 || rect.bottom > window.innerHeight - 100) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    
    tryPositioning();
  };

  // Update the handleShowMe function to be more robust

const handleShowMe = () => {
  console.log("Show Me clicked for selector:", steps[currentStep].targetSelector);
  const targetSelector = steps[currentStep].targetSelector;
  
  if (!targetSelector) {
    console.log("No target selector for this step");
    return;
  }
  
  // Try to find the element
  let targetElement = document.querySelector(targetSelector);
  
  // If not found, try without the dot (in case the selector was provided without it)
  if (!targetElement && targetSelector.startsWith('.')) {
    const selectorWithoutDot = targetSelector.substring(1);
    console.log("Trying selector without dot:", selectorWithoutDot);
    targetElement = document.querySelector(`.${selectorWithoutDot}`);
  }
  
  // Try to find any element with a class name containing the target
  if (!targetElement && targetSelector.startsWith('.')) {
    const baseClassName = targetSelector.substring(1);
    console.log("Trying to find element containing class:", baseClassName);
    const elementsWithPartialClass = document.querySelectorAll(`[class*="${baseClassName}"]`);
    if (elementsWithPartialClass.length > 0) {
      console.log(`Found ${elementsWithPartialClass.length} elements with partial class match`);
      targetElement = elementsWithPartialClass[0];
    }
  }
  
  if (!targetElement) {
    console.log("Could not find target element, trying to highlight parent container instead");
    // As a fallback, highlight the main content area
    switch(steps[currentStep].tab) {
      case 0: // Dashboard
        targetElement = document.querySelector('.dashboard-container') || 
                        document.querySelector('[class*="dashboard"]');
        break;
      case 1: // Trading Interface
        targetElement = document.querySelector('.trading-form') || 
                        document.querySelector('form');
        break;
      case 2: // Active Auctions
        targetElement = document.querySelector('.active-auctions') || 
                        document.querySelector('[class*="auction"]');
        break;
      case 3: // Auction House
        targetElement = document.querySelector('.auction-house') || 
                        document.querySelector('[class*="auction"]');
        break;
      // Similar fallbacks for other tabs
      default:
        targetElement = document.querySelector('main') || 
                        document.querySelector('.app-content') ||
                        document.body;
    }
  }
  
  if (targetElement) {
    console.log("Target element found, highlighting:", targetElement);
    
    // Add a data attribute to make the element easily identifiable
    targetElement.setAttribute('data-tutorial-highlight', 'true');
    
    // First make everything nearly transparent
    setShowingElement(true);
    setFullTransparencyMode(true);
    setTutorialMinimized(true);
    
    // Highlight the element with a more dramatic effect
    document.querySelectorAll('.tutorial-highlighted-element').forEach(el => {
      el.classList.remove('tutorial-highlighted-element');
      el.removeAttribute('data-tutorial-highlight');
    });
    
    targetElement.classList.add('tutorial-highlighted-element');
    
    // Add inline styles for more dramatic highlighting
    const originalOutline = targetElement.style.outline;
    const originalZIndex = targetElement.style.zIndex;
    const originalPosition = targetElement.style.position;
    
    targetElement.style.outline = '4px solid #6C5CE7';
    targetElement.style.position = 'relative';
    targetElement.style.zIndex = '9999';
    
    // Ensure element is visible in viewport
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Re-position the pointer
    positionPointerForCurrentStep();
    
    // After a delay, reset the overlay
    setTimeout(() => {
      // Reset inline styles
      targetElement.style.outline = originalOutline;
      targetElement.style.zIndex = originalZIndex;
      targetElement.style.position = originalPosition;
      
      setFullTransparencyMode(false);
      setTutorialMinimized(false);
      
      // Keep showing element with semi-transparent overlay
      setTimeout(() => {
        setShowingElement(false);
        targetElement.classList.remove('tutorial-highlighted-element');
        targetElement.removeAttribute('data-tutorial-highlight');
      }, 1000);
    }, 8000); // Show for 8 seconds to give more time
  } else {
    console.error("No target element found for selector:", targetSelector);
    
    // Show an alert message since we couldn't find the element
    alert(`Sorry, we couldn't find the UI element to highlight. Please continue with the tutorial.`);
  }
};

const handleNext = () => {
  if (currentStep < steps.length - 1) {
    setAnimationDirection('next');
    setCurrentStep(currentStep + 1);
  } else {
    // Tutorial complete
    onComplete();
  }
};

const handlePrevious = () => {
  if (currentStep > 0) {
    setAnimationDirection('prev');
    setCurrentStep(currentStep - 1);
  }
};

const handleSkip = () => {
  onComplete();
};

// Get appropriate text for the next button
const getNextButtonText = () => {
  if (currentStep === steps.length - 1) {
    return 'Get Started';
  }
  
  const step = steps[currentStep];
  if (step.promptTabChange && activeTab !== step.tab && waitingForTabChange) {
    return `Go to ${getTabName(step.tab)}`;
  }
  
  return 'Next';
};

// Helper function to get tab name from index
const getTabName = (tabIndex) => {
  switch(tabIndex) {
    case 0: return 'Dashboard';
    case 1: return 'Trading Interface';
    case 2: return 'Active Auctions';
    case 3: return 'Auction House';
    case 4: return 'Settings';
    case 5: return 'Box Scores';
    case 6: return 'Live Games';
    case 7: return 'Shop';
    default: return 'Tab';
  }
};

const handleOverlayClick = (e) => {
  // When in "showing element" mode, don't block clicks
  if (showingElement) {
    // Check if the click is not on the tutorial dialog
    const tutorialElement = document.querySelector('.tutorial-dialog');
    if (tutorialElement && !tutorialElement.contains(e.target)) {
      e.stopPropagation(); // Don't block the click
      return;
    }
  }
};

// Add a function to get the correct arrow component based on direction
const getArrowComponent = (direction) => {
  switch(direction) {
    case 'top': return <FaArrowUp size={30} color="#6C5CE7" />;
    case 'bottom': return <FaArrowDown size={30} color="#6C5CE7" />;
    case 'left': return <FaArrowLeft size={30} color="#6C5CE7" />;
    case 'right': return <FaArrowRight size={30} color="#6C5CE7" />;
    default: return <FaArrowDown size={30} color="#6C5CE7" />;
  }
};

return (
  <div style={{
    ...styles.overlay,
    backgroundColor: fullTransparencyMode ? 'rgba(0, 0, 0, 0)' : 
                   showingElement ? 'rgba(0, 0, 0, 0.2)' : 
                   'rgba(0, 0, 0, 0.5)',
    backdropFilter: fullTransparencyMode ? 'none' : 
                  showingElement ? 'blur(1px)' : 
                  'blur(3px)',
    pointerEvents: fullTransparencyMode ? 'none' : 'auto',
  }}
  onClick={handleOverlayClick}
  >
    {/* Floating "Return to Tutorial" button when in full transparency mode */}
    {fullTransparencyMode && (
      <motion.button
        style={styles.returnButton}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        onClick={() => {
          // Use setTimeout to ensure the state changes properly
          setTimeout(() => {
            setFullTransparencyMode(false);
            setTutorialMinimized(false);
            setShowingElement(false);
          }, 0);
          
          // Log for debugging
          console.log("Return to tutorial clicked");
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ← Return to Tutorial
      </motion.button>
    )}
    
    {/* Main tutorial dialog */}
    <motion.div 
      className="tutorial-dialog"
      style={{
        ...styles.tutorialContainer,
        ...(steps[currentStep].targetSelector ? styles.sidebarTutorial : {}),
        ...(tutorialMinimized ? styles.minimizedTutorial : {})
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: tutorialMinimized ? 0 : 1, 
        scale: tutorialMinimized ? 0.8 : 1,
        y: tutorialMinimized ? 50 : 0,
      }}
      transition={{ duration: 0.3 }}
    >
      <button 
        style={styles.closeButton} 
        onClick={handleSkip}
        aria-label="Skip tutorial"
      >
        <FaTimes />
      </button>
      
      <div style={styles.progressContainer}>
        {steps.map((_, index) => (
          <div 
            key={index} 
            style={{
              ...styles.progressDot,
              ...(index === currentStep ? styles.activeProgressDot : {}),
              ...(index < currentStep ? styles.completedProgressDot : {})
            }}
            onClick={() => {
              setAnimationDirection(index < currentStep ? 'prev' : 'next');
              setCurrentStep(index);
            }}
          />
        ))}
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ 
            x: animationDirection === 'next' ? 100 : -100, 
            opacity: 0 
          }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ 
            x: animationDirection === 'next' ? -100 : 100, 
            opacity: 0 
          }}
          transition={{ duration: 0.3 }}
          style={styles.contentContainer}
        >
          <div style={styles.iconContainer}>
            {steps[currentStep].icon}
          </div>
          
          <h2 style={styles.title}>{steps[currentStep].title}</h2>
          
          <div style={styles.description}>
            {steps[currentStep].description}
          </div>
          
          {steps[currentStep].targetSelector && (
            <motion.div 
              style={styles.showMeNote}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <strong>Can't see it?</strong> Click "Show Me" to highlight the element.
            </motion.div>
          )}

          {steps[currentStep].image && (
            <div style={styles.imageContainer}>
              <img 
                src={steps[currentStep].image} 
                alt={steps[currentStep].title}
                style={styles.image}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      
      <div style={styles.buttonContainer}>
        {currentStep > 0 && (
          <motion.button
            style={styles.prevButton}
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevious}
          >
            <FaArrowLeft style={{ marginRight: '8px' }} /> Previous
          </motion.button>
        )}
        
        <motion.button
          style={styles.nextButton}
          whileHover={{ backgroundColor: '#5a4bc8' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const step = steps[currentStep];
            if (step.promptTabChange && activeTab !== step.tab) {
              onChangeTab(step.tab);
              setWaitingForTabChange(true);
            } else {
              handleNext();
            }
          }}
          disabled={waitingForTabChange}
        >
          {getNextButtonText()}
          {currentStep < steps.length - 1 && !waitingForTabChange && (
            <FaArrowRight style={{ marginLeft: '8px' }} />
          )}
        </motion.button>

        {steps[currentStep].targetSelector && (
          <motion.button
            style={styles.showMeButton}
            whileHover={{ backgroundColor: 'rgba(108, 92, 231, 0.2)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShowMe}
          >
            <FaEye style={{ marginRight: '8px' }} /> Show Me
          </motion.button>
        )}
      </div>
      
      {currentStep < steps.length - 1 && (
        <motion.button
          style={styles.skipButton}
          whileHover={{ color: '#fff' }}
          onClick={handleSkip}
        >
          Skip Tutorial
        </motion.button>
      )}
    </motion.div>
    
    {/* Animated Pointer */}
    {showPointer && (
      <motion.div
        ref={pointerRef}
        className="tutorial-pointer"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: 1, 
          scale: [1, 1.2, 1],
          transition: { scale: { repeat: Infinity, duration: 2 } }
        }}
        exit={{ opacity: 0, scale: 0 }}
        style={{
          ...styles.pointer,
          left: pointerPosition.left,
          top: pointerPosition.top,
          position: 'fixed',
          zIndex: 9999,
        }}
      >
        {getArrowComponent(steps[currentStep].pointerDirection)}
      </motion.div>
    )}
  </div>
);
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent
    backdropFilter: 'blur(3px)', // Lighter blur
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'auto', // Allow clicks on the overlay
  },
  tutorialContainer: {
    width: '90%',
    maxWidth: '700px',
    backgroundColor: 'rgba(40, 40, 60, 0.95)',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 15px 50px rgba(0, 0, 0, 0.3)',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid rgba(108, 92, 231, 0.3)',
    backdropFilter: 'blur(10px)',
  },
  closeButton: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#aaa',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    transition: 'all 0.2s ease',
  },
  progressContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '30px',
    gap: '8px',
  },
  progressDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  activeProgressDot: {
    backgroundColor: '#6C5CE7',
    transform: 'scale(1.2)',
    boxShadow: '0 0 10px rgba(108, 92, 231, 0.5)',
  },
  completedProgressDot: {
    backgroundColor: 'rgba(108, 92, 231, 0.5)',
  },
  contentContainer: {
    textAlign: 'center',
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconContainer: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    border: '1px solid rgba(108, 92, 231, 0.2)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#FFFFFF',
    background: 'linear-gradient(45deg, #6C5CE7, #a29ff0)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  description: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#B0B0C0',
    maxWidth: '600px',
    marginBottom: '25px',
    textAlign: 'left',
  },
  imageContainer: {
    width: '100%',
    marginBottom: '25px',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  image: {
    width: '100%',
    display: 'block',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginTop: '20px',
  },
  prevButton: {
    padding: '12px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  nextButton: {
    padding: '12px 24px',
    backgroundColor: '#6C5CE7',
    border: 'none',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)',
  },
  skipButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#aaa',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '20px',
    padding: '5px',
    transition: 'all 0.2s ease',
  },
  currencyContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    margin: '20px 0',
  },
  currencyItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
    padding: '15px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  currencyIcon: {
    width: '40px',
    height: '40px',
  },
  currencyName: {
    margin: '0 0 5px',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  currencyDesc: {
    margin: 0,
    fontSize: '14px',
    color: '#B0B0C0',
  },
  disclaimer: {
    fontSize: '13px',
    fontStyle: 'italic',
    color: '#aaa',
    marginTop: '20px',
    padding: '8px 12px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '6px',
    borderLeft: '3px solid #6C5CE7',
  },
  stepsList: {
    textAlign: 'left',
    paddingLeft: '20px',
  },
  featureList: {
    textAlign: 'left',
    paddingLeft: '20px',
    listStyleType: 'disc',
  },
  tip: {
    fontSize: '14px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: '#10B981',
    padding: '10px',
    borderRadius: '6px',
    marginTop: '15px',
    borderLeft: '3px solid #10B981',
  },
  pointer: {
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 0 20px rgba(108, 92, 231, 0.6)',
    border: '2px solid #6C5CE7',
  },
  sidebarTutorial: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    width: '400px',
    maxWidth: '35%',
    alignSelf: 'flex-start',
    maxHeight: '90vh',
    overflowY: 'auto',
    zIndex: 1001,
  },
  showMeButton: {
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    color: '#FFFFFF',
    border: '1px solid rgba(108, 92, 231, 0.5)',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '15px',
    marginBottom: '10px',
    transition: 'all 0.2s ease',
    animation: 'pulse-button 2s infinite',
    width: '100%',
    maxWidth: '300px',
    background: 'linear-gradient(45deg, #6C5CE7, #a29ff0)',
    boxShadow: '0 4px 15px rgba(108, 92, 231, 0.5)',
  },
  showMeNote: {
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    border: '1px solid rgba(108, 92, 231, 0.3)',
    padding: '10px 15px',
    borderRadius: '8px',
    fontSize: '14px',
    marginTop: '10px',
    color: '#a29ff0',
    fontStyle: 'italic',
  },
  minimizedTutorial: {
    opacity: 0,
    pointerEvents: 'none',
    transform: 'translateY(50px) scale(0.8)',
  },
  
  returnButton: {
    position: 'fixed',
    bottom: '40px',
    right: '40px',
    padding: '15px 25px',
    backgroundColor: '#6C5CE7',
    color: 'white',
    borderRadius: '10px',
    border: 'none',
    boxShadow: '0 0 30px rgba(0, 0, 0, 0.5)',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    zIndex: 100000, // Extra high z-index
    animation: 'pulse-button 2s infinite', // Add the pulsing animation
  },
};

export default Tutorial;