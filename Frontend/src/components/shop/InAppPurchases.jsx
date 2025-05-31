import React, { useState, useEffect } from 'react';
import { FaCoins, FaInfoCircle, FaCheck, FaTimes, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useCurrency } from '../../hooks/useCurrency';
import api from '../../services/api';
import commonIcon from '../../assets/common.png';
import premiumIcon from '../../assets/premium.png';
import './InAppPurchases.css';

const InAppPurchases = () => {
  const { token, userData } = useAuth();
  const { updateCurrency } = useCurrency();
  const [selectedTab, setSelectedTab] = useState('silver');
  const [loading, setLoading] = useState(true);
  const [commodityPrices, setCommodityPrices] = useState(null);
  const [priceChange, setPriceChange] = useState({ SBM: 0, ALU: 0 });
  const [purchaseStatus, setPurchaseStatus] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch latest commodity prices
  useEffect(() => {
    const fetchCommodityPrices = async () => {
      try {
        const response = await api.get('/commodity/latest');
        
        if (response.data.success) {
          if (commodityPrices) {
            setPriceChange({
              SBM: ((response.data.prices.SBM - commodityPrices.SBM) / commodityPrices.SBM) * 100,
              ALU: ((response.data.prices.ALU - commodityPrices.ALU) / commodityPrices.ALU) * 100
            });
          }
          
          setCommodityPrices(response.data.prices);
          setLastUpdated(new Date(response.data.updated).toLocaleString());
        } else {
          console.error('Failed to fetch commodity prices');
        }
      } catch (error) {
        console.error('Error fetching commodity prices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommodityPrices();
    // Refresh prices every 5 minutes
    const interval = setInterval(fetchCommodityPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  // Calculate package prices based on commodity prices
  const getPackages = (currencyType) => {
    const defaultPrices = {
      silver: [
        { id: 'silver-1', amount: 1000, price: 4.99, discount: 0, popular: false },
        { id: 'silver-2', amount: 2500, price: 9.99, discount: 5, popular: true },
        { id: 'silver-3', amount: 5000, price: 19.99, discount: 10, popular: false },
        { id: 'silver-4', amount: 10000, price: 34.99, discount: 15, popular: false },
      ],
      gold: [
        { id: 'gold-1', amount: 100, price: 4.99, discount: 0, popular: false },
        { id: 'gold-2', amount: 250, price: 9.99, discount: 5, popular: true },
        { id: 'gold-3', amount: 500, price: 19.99, discount: 10, popular: false },
        { id: 'gold-4', amount: 1000, price: 34.99, discount: 15, popular: false },
      ]
    };

    if (!commodityPrices) {
      return defaultPrices[currencyType];
    }

    // Calculate prices based on commodity values
    const baseMultiplier = currencyType === 'silver' ? 
      (commodityPrices.SBM / 300) : 
      (commodityPrices.ALU / 2300);
    
    // Apply the commodity price ratio to the default prices
    return defaultPrices[currencyType].map(pkg => ({
      ...pkg,
      price: parseFloat((pkg.price * baseMultiplier).toFixed(2))
    }));
  };

  // Reset purchase status after 5 seconds
  useEffect(() => {
    if (purchaseStatus) {
      const timer = setTimeout(() => {
        setPurchaseStatus(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [purchaseStatus]);

  const handlePurchase = async () => {
    if (!selectedPackage || !token) return;

    setLoading(true);
    try {
      const response = await api.post('/currency/purchase', {
        packageId: selectedPackage.id,
        amount: selectedPackage.amount,
        currencyType: selectedTab,
        price: selectedPackage.price
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        updateCurrency(selectedTab, response.data.amount);
        setPurchaseStatus({ success: true, message: 'Purchase completed successfully!' });
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      setPurchaseStatus({ 
        success: false, 
        message: error.response?.data?.message || 'Failed to process purchase. Please try again.' 
      });
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const openConfirmation = (pkg) => {
    setSelectedPackage(pkg);
    setShowConfirmation(true);
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
    setSelectedPackage(null);
  };

  const getCurrencyName = (type) => {
    return type === 'gold' ? 'ALU' : 'SBM';
  };

  const packages = getPackages(selectedTab);

  const getPriceTrend = (currencyType) => {
    const change = currencyType === 'silver' ? priceChange.SBM : priceChange.ALU;
    if (Math.abs(change) < 0.1) return null;
    
    return change > 0 ? 
      <FaArrowUp style={{color: '#4CAF50', marginLeft: '5px'}} /> : 
      <FaArrowDown style={{color: '#F44336', marginLeft: '5px'}} />;
  };

  return (
    <div className="in-app-purchases">
      <div className="shop-header">
        <div className="shop-title">
          <FaCoins style={{ marginRight: 10 }} />
          Currency Shop
        </div>
        <div className="shop-subtitle">
          Get more SBM and ALU instantly!
        </div>
      </div>

      <div className="shop-balance-container">
        <div className="shop-balance-card">
          <span className="shop-balance-icon">
            <img src={commonIcon} alt="SBM" width={24} />
          </span>
          <div>
            <div className="shop-balance-label">SBM</div>
            <div className="shop-balance-amount">{userData?.silver?.toLocaleString() || 0}</div>
          </div>
        </div>
        <div className="shop-balance-card">
          <span className="shop-balance-icon">
            <img src={premiumIcon} alt="ALU" width={24} />
          </span>
          <div>
            <div className="shop-balance-label">ALU</div>
            <div className="shop-balance-amount">{userData?.gold?.toLocaleString() || 0}</div>
          </div>
        </div>
      </div>

      <div className="shop-tabs">
        <button
          className={`shop-tab${selectedTab === 'silver' ? ' active' : ''}`}
          onClick={() => setSelectedTab('silver')}
        >
          SBM Packages
        </button>
        <button
          className={`shop-tab${selectedTab === 'gold' ? ' active' : ''}`}
          onClick={() => setSelectedTab('gold')}
        >
          ALU Packages
        </button>
      </div>

      <div className="shop-packages-grid">
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading package options...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedTab}
              style={styles.packagesGrid}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {packages.map((pkg, index) => (
                <motion.div 
                  key={pkg.id}
                  style={{
                    ...styles.packageCard,
                    ...(pkg.popular ? styles.popularPackage : {})
                  }}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: '0 8px 25px rgba(108, 92, 231, 0.25)'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: index * 0.1 } 
                  }}
                  onClick={() => openConfirmation(pkg)}
                >
                  <div style={styles.glassBackground} />
                  {pkg.popular && (
                    <div style={styles.popularBadge}>
                      <span style={styles.popularText}>Most Popular</span>
                    </div>
                  )}
                  <div style={styles.packageHeader}>
                    <div style={styles.packageIconContainer}>
                      <img 
                        src={selectedTab === 'silver' ? commonIcon : premiumIcon}
                        alt={selectedTab === 'silver' ? 'SBM' : 'ALU'}
                        style={styles.packageIcon}
                      />
                    </div>
                    <h3 style={styles.packageTitle}>
                      {pkg.amount.toLocaleString()} {getCurrencyName(selectedTab)}
                    </h3>
                  </div>
                  
                  <div style={styles.priceTag}>
                    <div style={{display: 'flex', alignItems: 'baseline'}}>
                      <span style={styles.dollarSign}>$</span>
                      <span style={styles.priceAmount}>{pkg.price.toFixed(2)}</span>
                    </div>
                    {pkg.discount > 0 && (
                      <span style={styles.discount}>Save {pkg.discount}%</span>
                    )}
                  </div>
                  
                  <motion.button 
                    style={styles.buyButton}
                    whileHover={{ 
                      backgroundColor: pkg.popular ? '#5a4bc8' : '#6C5CE7',
                      boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)'
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Purchase Now
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Purchase confirmation modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div 
            style={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              style={styles.modalContent}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <h2 style={styles.modalTitle}>Confirm Purchase</h2>
              
              <div style={styles.confirmationDetails}>
                <div style={styles.confirmGraphic}>
                  <div style={styles.confirmIconWrapper}>
                    <img 
                      src={selectedTab === 'silver' ? commonIcon : premiumIcon}
                      alt={selectedTab === 'silver' ? 'SBM' : 'ALU'}
                      style={styles.confirmIcon}
                    />
                  </div>
                </div>
                <div style={styles.confirmAmount}>
                  {selectedPackage?.amount.toLocaleString()} {getCurrencyName(selectedTab)}
                </div>
                <div style={styles.packagePrice}>
                  Price: <span style={styles.confirmPrice}>${selectedPackage?.price.toFixed(2)}</span>
                </div>
              </div>

              <div style={styles.actionButtons}>
                <motion.button 
                  style={styles.cancelButton} 
                  onClick={closeConfirmation}
                  disabled={loading}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  <FaTimes style={{marginRight: '5px'}} /> Cancel
                </motion.button>
                <motion.button 
                  style={styles.confirmButton}
                  onClick={handlePurchase}
                  disabled={loading}
                  whileHover={{ backgroundColor: '#5a4bc8' }}
                  whileTap={{ scale: 0.97 }}
                >
                  {loading ? (
                    <>
                      <div style={styles.buttonSpinner}></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <FaCheck style={{marginRight: '5px'}} /> Confirm
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status message */}
      <AnimatePresence>
        {purchaseStatus && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              ...styles.statusMessage,
              backgroundColor: purchaseStatus.success ? '#4CAF5066' : '#F4433666',
              borderLeft: purchaseStatus.success ? '4px solid #4CAF50' : '4px solid #F44336'
            }}
          >
            {purchaseStatus.success ? 
              <FaCheck style={styles.statusIcon} /> : 
              <FaTimes style={styles.statusIcon} />}
            <span style={styles.statusText}>{purchaseStatus.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info section */}
      <motion.div 
        style={styles.infoSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div style={styles.infoBlock}>
          <FaInfoCircle style={styles.infoIcon} />
          <div style={styles.infoContent}>
            <h4 style={styles.infoTitle}>Market-Driven Currency</h4>
            <p style={styles.infoText}>
              Currency prices fluctuate based on real commodity futures:
              <br />
              • <strong>SBM</strong> (Soybean Meal Market) - Based on soybean meal futures (Note: in game currency has no real value)
              <br />
              • <strong>ALU</strong> (Aluminum) - Based on aluminum futures (Note: in game currency has no real value)
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const styles = {
  container: {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
    color: '#f0f0f0',
    backgroundColor: '#1E1E2E',
    borderRadius: '16px',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    overflow: 'hidden',
  },
  
  // Header section
  headerSection: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '38px',
    fontWeight: '700',
    margin: '0 0 10px',
    color: '#FFFFFF',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(45deg, #6C5CE7, #9b93ec)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '16px',
    marginBottom: '10px',
    color: '#B0B0C0',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Dashboard section
  dashboard: {
    marginBottom: '30px',
  },
  marketIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 16px',
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    borderRadius: '30px',
    fontSize: '14px',
    color: '#B0B0C0',
    marginBottom: '20px',
    width: 'fit-content',
    margin: '0 auto 20px',
    border: '1px solid rgba(108, 92, 231, 0.2)',
  },
  marketUpdated: {
    marginLeft: '8px',
    fontSize: '12px',
    opacity: 0.7,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: '2px 8px',
    borderRadius: '10px',
    marginLeft: '10px',
  },
  balanceContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  balanceItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px 20px',
    backgroundColor: 'rgba(30, 30, 46, 0.7)',
    borderRadius: '12px',
    minWidth: '220px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
  },
  balanceIconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  },
  currencyIcon: {
    height: '24px',
    width: 'auto',
  },
  balanceLabel: {
    margin: 0,
    fontSize: '14px',
    color: '#B0B0C0',
    fontWeight: '500',
  },
  balanceAmount: {
    margin: '5px 0 0',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  
  // Tab selector
  tabContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '25px',
    gap: '10px',
    padding: '5px',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: '12px',
    maxWidth: '500px',
    margin: '0 auto',
  },
  tab: {
    padding: '12px 24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    transition: 'all 0.2s ease',
    color: '#B0B0C0',
    borderRadius: '8px',
    flex: 1,
    fontWeight: '500',
    gap: '8px',
  },
  tabIcon: {
    width: '20px', 
    height: '20px',
  },
  activeTab: {
    color: '#FFFFFF',
    backgroundColor: 'rgba(108, 92, 231, 0.8)',
    boxShadow: '0 4px 10px rgba(108, 92, 231, 0.3)',
  },
  
  // Price indicators
  priceIndicator: {
    margin: '0 auto 30px',
    padding: '15px',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: '12px',
    maxWidth: '450px',
    border: '1px solid rgba(108, 92, 231, 0.2)',
  },
  loadingPrice: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    color: '#B0B0C0',
  },
  pricePulse: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#6C5CE7',
    animation: 'pulse 1.5s infinite',
    '@keyframes pulse': {
      '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(108, 92, 231, 0.7)' },
      '70%': { transform: 'scale(1)', boxShadow: '0 0 0 10px rgba(108, 92, 231, 0)' },
      '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(108, 92, 231, 0)' }
    }
  },
  priceDisplay: {
    textAlign: 'center',
  },
  priceLabel: {
    fontSize: '14px',
    color: '#B0B0C0',
    marginBottom: '5px',
  },
  priceValueContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  priceUnit: {
    fontSize: '14px',
    color: '#B0B0C0',
    marginLeft: '5px',
  },
  
  // Packages display
  packagesContainer: {
    marginBottom: '30px',
    minHeight: '350px',
    position: 'relative',
  },
  packagesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    padding: '40px',
    color: '#B0B0C0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(108, 92, 231, 0.1)',
    borderRadius: '50%',
    borderTop: '4px solid #6C5CE7',
    animation: 'spin 1s linear infinite',
    '@keyframes spin': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' }
    }
  },
  loadingText: {
    margin: '10px 0 0',
    fontSize: '16px',
  },
  
  // Package cards
  packageCard: {
    backgroundColor: 'rgba(40, 40, 60, 0.7)',
    borderRadius: '16px',
    padding: '25px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    height: '100%',
  },
  popularPackage: {
    backgroundColor: 'rgba(50, 50, 75, 0.9)',
    border: '1px solid rgba(108, 92, 231, 0.3)',
    boxShadow: '0 8px 20px rgba(108, 92, 231, 0.2)',
  },
  popularBadge: {
    position: 'absolute',
    top: '0',
    right: '0',
    backgroundColor: '#6C5CE7',
    borderBottomLeftRadius: '8px',
    padding: '5px 12px',
  },
  popularText: {
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  packageIconContainer: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px',
    border: '1px solid rgba(108, 92, 231, 0.2)',
  },
  packageIcon: {
    height: '35px',
    width: 'auto',
  },
  packageTitle: {
    margin: '12px 0 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  packageHeader: {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  priceTag: {
    margin: '15px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  dollarSign: {
    fontSize: '18px',
    fontWeight: '500',
    color: '#B0B0C0',
    marginRight: '2px',
    verticalAlign: 'top',
  },
  priceAmount: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#FFFFFF',
    background: 'linear-gradient(45deg, #6C5CE7, #a29ff0)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  discount: {
    marginTop: '8px',
    padding: '4px 10px',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    color: '#4CAF50',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid rgba(76, 175, 80, 0.3)',
  },
  buyButton: {
    width: '100%',
    padding: '12px 0',
    backgroundColor: '#6C5CE7',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: 'auto',
    boxShadow: '0 4px 8px rgba(108, 92, 231, 0.2)',
    transition: 'all 0.2s ease',
  },
  
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '90%',
    maxWidth: '450px',
    backgroundColor: 'rgba(40, 40, 60, 0.95)',
    borderRadius: '20px',
    padding: '30px',
    border: '1px solid rgba(108, 92, 231, 0.3)',
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3)',
  },
  modalTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    margin: '0 0 25px 0',
  },
  confirmationDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '10px',
    marginBottom: '25px',
  },
  confirmGraphic: {
    marginBottom: '15px',
  },
  confirmIconWrapper: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(108, 92, 231, 0.3)',
    boxShadow: '0 8px 20px rgba(108, 92, 231, 0.2)',
  },
  confirmIcon: {
    width: '40px',
    height: '40px',
  },
  confirmAmount: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: '5px',
  },
  confirmPrice: {
    color: '#6C5CE7',
    fontWeight: '700',
  },
  actionButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
  },
  cancelButton: {
    padding: '12px 0',
    backgroundColor: 'transparent',
    color: '#B0B0C0',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  confirmButton: {
    padding: '12px 0',
    backgroundColor: '#6C5CE7',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 8px rgba(108, 92, 231, 0.2)',
    transition: 'all 0.2s ease',
  },
  buttonSpinner: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: '#FFFFFF',
    animation: 'spin 1s linear infinite',
    marginRight: '8px',
  },
  
  // Status message
  statusMessage: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '15px 20px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
  },
  statusIcon: {
    marginRight: '10px',
    fontSize: '18px',
  },
  statusText: {
    fontSize: '14px',
    fontWeight: '500',
  },
  
  // Info section
  infoSection: {
    marginTop: '30px',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: '12px',
    padding: '20px',
  },
  infoBlock: {
    display: 'flex',
    gap: '15px',
  },
  infoIcon: {
    color: '#6C5CE7',
    fontSize: '20px',
    marginTop: '2px',
    flexShrink: 0,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#FFFFFF',
    margin: '0 0 10px 0',
  },
  infoText: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#B0B0C0',
    margin: 0,
  },
  // New style for better-looking cards
  glassBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)',
    zIndex: -1,
  }
};

export default InAppPurchases;