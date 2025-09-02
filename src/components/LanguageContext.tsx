import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    'smartbhoomi': 'SmartBhoomi',
    'tagline': 'Blockchain Supply Chain Platform',
    'signin': 'Sign In',
    'signup': 'Sign Up',
    'signout': 'Sign Out',
    'refresh': 'Refresh',
    'scanqr': 'Scan QR',
    'addproduct': 'Add Product',
    'addtoinventory': 'Add to Inventory',
    
    // User Types
    'farmer': 'Farmer',
    'wholesaler': 'Wholesaler',
    'retailer': 'Retailer',
    'consumer': 'Consumer',
    
    // Landing Page
    'transparentSupplyChain': 'Transparent Agricultural Supply Chain',
    'trackProduce': 'Track your produce from farm to table with blockchain-powered transparency',
    'secure': 'Secure',
    'verified': 'Verified',
    'fairPricing': 'Fair Pricing',
    'journeyFarmToFork': 'Journey from Farm to Fork',
    'followTransparentPath': 'Follow the transparent path of your food through our blockchain-powered supply chain',
    'currentStage': 'Current Stage',
    'scrollHint': 'Scroll down to see the tractor journey',
    'getStarted': 'Get Started',
    'learnMore': 'Learn More',
    
    // Supply Chain Stages
    'farmerDesc': 'Fresh produce harvested',
    'wholesalerDesc': 'Bulk distribution',
    'retailerDesc': 'Local market sales',
    'consumerDesc': 'Final delivery',
    
    // Stats
    'activeProducts': 'Active Products',
    'verifiedFarmers': 'Verified Farmers',
    'priceTransparency': 'Avg. Price Transparency',
    'supplyChainEfficiency': 'Supply Chain Efficiency',
    
    // Tabs
    'products': 'Products',
    'tracking': 'Track',
    'purchases': 'My Purchases',
    'sales': 'My Sales',
    'blockchain': 'Blockchain',
    'analytics': 'Analytics',
    
    // Product Actions
    'trackJourney': 'Track Journey',
    'buy': 'Buy',
    'search': 'Search',
    'searching': 'Searching...',
    'searchPlaceholder': 'Search products, farmers, or product IDs...',
    
    // Product Details
    'productId': 'Product ID',
    'origin': 'Origin',
    'harvestDate': 'Harvest Date',
    'currentLocation': 'Current Location',
    'price': 'Price',
    'farmerPrice': 'Farmer',
    'handlingCharge': 'Handling',
    'blockchainHash': 'Blockchain Hash',
    'productImage': 'Product Image',
    
    // Supply Chain
    'supplyChainJourney': 'Supply Chain Journey',
    'trackComplete': 'Track the complete journey from farm to consumer',
    'productDetails': 'Product Details',
    'supplyChainProgress': 'Supply Chain Progress',
    'journeyProgress': 'Journey Progress',
    'steps': 'steps',
    
    // Blockchain
    'blockchainNetworkStatus': 'Blockchain Network Status',
    'network': 'Network',
    'status': 'Status',
    'active': 'Active',
    'blockHeight': 'Block Height',
    'transactionCount': 'Transaction Count',
    'smartContracts': 'Smart Contracts',
    'recentTransactions': 'Recent Transactions',
    'smartContractDetails': 'Smart Contract Details',
    'automatedVerification': 'Automated verification and tracking contracts',
    
    // Analytics
    'priceTrends': 'Price Trends',
    'averagePricesLast30Days': 'Average prices over the last 30 days',
    'regionalDistribution': 'Regional Distribution',
    'activeProductsByRegion': 'Active products by region in Odisha',
    
    // Messages
    'noProductSelected': 'No Product Selected',
    'selectProductMessage': 'Select a product from the Products tab to track its supply chain journey',
    'viewSampleProduct': 'View Sample Product',
    'noPurchasesYet': 'No Purchases Yet',
    'noSalesYet': 'No Sales Yet',
    'purchasesWillAppear': 'Your purchased products will appear here',
    'salesWillAppear': 'Your sold products will appear here',
    
    // About Section
    'aboutSmartBhoomi': 'About SmartBhoomi',
    'aboutDescription1': 'SmartBhoomi represents the future of agricultural transparency in India. Built specifically for the Government of Odisha, our blockchain-based platform ensures complete traceability of agricultural products from farm to consumer.',
    'aboutDescription2': 'Every transaction is recorded on an immutable blockchain, providing unprecedented transparency in pricing, quality verification, and supply chain tracking. Farmers receive fair compensation while consumers gain confidence in the quality and authenticity of their food.',
    'aboutDescription3': 'Our platform integrates seamlessly with Aadhaar validation, QR code technology, and smart contracts to create a trustworthy ecosystem that benefits all stakeholders in the agricultural value chain.',
    
    // Features
    'keyFeatures': 'Key Features',
    'blockchainTransparency': 'Blockchain Transparency',
    'blockchainDesc': 'Every transaction recorded on immutable blockchain for complete traceability',
    'qrIntegration': 'QR Code Integration',
    'qrDesc': 'Instant product verification and journey tracking with QR codes',
    'fairPricingSystem': 'Fair Pricing System',
    'fairPricingDesc': 'Transparent pricing ensures farmers get fair value for their produce',
    'qualityAssurance': 'Quality Assurance',
    'qualityDesc': 'Multi-stage quality verification with blockchain-backed certificates',
    
    // Additional App Translations
    'sales': 'My Sales',
    'searchFor': 'Search for',
    'farmerPrice': 'Farmer Price',
    'handlingCharge': 'Handling Charge',
    'quantity': 'Quantity',
    'totalAmount': 'Total Amount',
    'date': 'Date',
    'deliveryAddress': 'Delivery Address',
    'buyer': 'Buyer',
    'seller': 'Seller',
    'orderId': 'Order ID',
    'delivered': 'Delivered',
    'pending': 'Pending',
    'inTransit': 'In Transit',
    
    // Purchase and Product Form
    'buy': 'Buy',
    'purchase': 'Purchase',
    'purchaseProduct': 'Purchase Product',
    'selectQuantity': 'Select Quantity',
    'deliveryAddress': 'Delivery Address',
    'totalPrice': 'Total Price',
    'confirmPurchase': 'Confirm Purchase',
    'purchasing': 'Purchasing...',
    'enterAddress': 'Enter your delivery address',
    'quantityRequired': 'Quantity is required',
    'addressRequired': 'Delivery address is required',
    'productName': 'Product Name',
    'category': 'Category',
    'harvestDate': 'Harvest Date',
    'pricePerKg': 'Price per kg (₹)',
    'qualityGrade': 'Quality Grade',
    'productImage': 'Product Image (Optional)',
    'uploadImage': 'Upload product image',
    'chooseImage': 'Choose Image',
    'handlingCharge': 'Handling Charge per kg (₹)',
    'description': 'Description (Optional)',
    'addProduct': 'Add Product',
    'addingProduct': 'Adding Product...',
    'selectCategory': 'Select category',
    'selectQuality': 'Select quality grade',
    'productDetails': 'Additional details about your product...',
    'allFieldsRequired': 'All required fields must be filled',
    'validHandlingCharge': 'Please enter a valid handling charge',
    'gradeA': 'Grade A',
    'gradeB': 'Grade B',
    'premium': 'Premium',
    'vegetables': 'Vegetables',
    'fruits': 'Fruits',
    'grains': 'Grains',
    'spices': 'Spices',
    'addproduct': 'Add Product',
    'addtoinventory': 'Add to Inventory',
    'farmerPrice': 'Farmer Price',
    'totalAmount': 'Total Amount',
    'quantity': 'Quantity',
    'available': 'Available'
  },
  hi: {
    // Header
    'smartbhoomi': 'स्मार्टभूमि',
    'tagline': 'ब्लॉकचेन आपूर्ति श्रृंखला प्लेटफॉर्म',
    'signin': 'साइन इन',
    'signup': 'साइन अप',
    'signout': 'साइन आउट',
    'refresh': 'रिफ्रेश',
    'scanqr': 'QR स्कैन',
    'addproduct': 'उत्पाद जोड़ें',
    'addtoinventory': 'इन्वेंटरी में जोड़ें',
    
    // User Types
    'farmer': 'किसान',
    'wholesaler': 'थोक व्यापारी',
    'retailer': 'खुदरा विक्रेता',
    'consumer': 'उपभोक्ता',
    
    // Landing Page
    'transparentSupplyChain': 'पारदर्शी कृषि आपूर्ति श्रृंखला',
    'trackProduce': 'ब्लॉकचेन-संचालित पारदर्शिता के साथ अपनी उपज को खेत से मेज तक ट्रैक करें',
    'secure': 'सुरक्षित',
    'verified': 'सत्यापित',
    'fairPricing': 'उचित मूल्य निर्धारण',
    'journeyFarmToFork': 'खेत से कांटे तक की यात्रा',
    'followTransparentPath': 'हमारी ब्लॉकचेन-संचालित आपूर्ति श्रृंखला के माध्यम से अपने भोजन के पारदर्शी पथ का पालन करें',
    'currentStage': 'वर्तमान चरण',
    'scrollHint': 'ट्रैक्टर की यात्रा देखने के लिए नीचे स्क्रॉल करें',
    'getStarted': 'शुरू करें',
    'learnMore': 'और जानें',
    
    // Supply Chain Stages
    'farmerDesc': 'ताज़ी उपज की कटाई',
    'wholesalerDesc': 'थोक वितरण',
    'retailerDesc': 'स्थानीय बाज़ार बिक्री',
    'consumerDesc': 'अंतिम डिलीवरी',
    
    // Stats
    'activeProducts': 'सक्रिय उत्पाद',
    'verifiedFarmers': 'सत्यापित किसान',
    'priceTransparency': 'औसत मूल्य पारदर्शिता',
    'supplyChainEfficiency': 'आपूर्ति श्रृंखला दक्षता',
    
    // Tabs
    'products': 'उत्पाद',
    'tracking': 'ट्रैक',
    'purchases': 'मेरी खरीदारी',
    'sales': 'मेरी बिक्री',
    'blockchain': 'ब्लॉकचेन',
    'analytics': 'विश्लेषण',
    
    // Product Actions
    'trackJourney': 'यात्रा ट्रैक करें',
    'buy': 'खरीदें',
    'search': 'खोजें',
    'searching': 'खोज रहे हैं...',
    'searchPlaceholder': 'उत्पाद, किसान, या उत्पाद ID खोजें...',
    
    // Product Details
    'productId': 'उत्पाद ID',
    'origin': 'मूल स्थान',
    'harvestDate': 'कटाई की तारीख',
    'currentLocation': 'वर्तमान स्थान',
    'price': 'मूल्य',
    'farmerPrice': 'किसान',
    'handlingCharge': 'हैंडलिंग',
    'blockchainHash': 'ब्लॉकचेन हैश',
    'productImage': 'उत्पाद छवि',
    
    // Supply Chain
    'supplyChainJourney': 'आपूर्ति श्रृंखला यात्रा',
    'trackComplete': 'खेत से उपभोक्ता तक की पूर्ण यात्रा को ट्रैक करें',
    'productDetails': 'उत्पाद विवरण',
    'supplyChainProgress': 'आपूर्ति श्रृंखला प्रगति',
    'journeyProgress': 'यात्रा प्रगति',
    'steps': 'चरण',
    
    // Blockchain
    'blockchainNetworkStatus': 'ब्लॉकचेन नेटवर्क स्थिति',
    'network': 'नेटवर्क',
    'status': 'स्थिति',
    'active': 'सक्रिय',
    'blockHeight': 'ब्लॉक ऊंचाई',
    'transactionCount': 'लेनदेन संख्या',
    'smartContracts': 'स्मार्ट कॉन्ट्रैक्ट',
    'recentTransactions': 'हाल के लेनदेन',
    'smartContractDetails': 'स्मार्ट कॉन्ट्रैक्ट विवरण',
    'automatedVerification': 'स्वचालित सत्यापन और ट्रैकिंग कॉन्ट्रैक्ट',
    
    // Analytics
    'priceTrends': 'मूल्य रुझान',
    'averagePricesLast30Days': 'पिछले 30 दिनों की औसत कीमतें',
    'regionalDistribution': 'क्षेत्रीय वितरण',
    'activeProductsByRegion': 'ओडिशा में क्षेत्र के अनुसार सक्रिय उत्पाद',
    
    // Messages
    'noProductSelected': 'कोई उत्पाद चयनित नहीं',
    'selectProductMessage': 'आपूर्ति श्रृंखला यात्रा को ट्रैक करने के लिए उत्पाद टैब से एक उत्पाद चुनें',
    'viewSampleProduct': 'नमूना उत्पाद देखें',
    'noPurchasesYet': 'अभी तक कोई खरीदारी नहीं',
    'noSalesYet': 'अभी तक कोई बिक्री नहीं',
    'purchasesWillAppear': 'आपके खरीदे गए उत्पाद यहां दिखाई देंगे',
    'salesWillAppear': 'आपके बेचे गए उत्पाद यहां दिखाई देंगे',
    
    // About Section
    'aboutSmartBhoomi': 'स्मार्टभूमि के बारे में',
    'aboutDescription1': 'स्मार्टभूमि भारत में कृषि पारदर्शिता के भविष्य का प्रतिनिधित्व करता है। ओडिशा सरकार के लिए विशेष रूप से निर्मित, हमारा ब्लॉकचेन-आधारित प्लेटफॉर्म खेत से उपभोक्ता तक कृषि उत्पादों की पूर्ण ट्रेसेबिलिटी सुनिश्चित करता है।',
    'aboutDescription2': 'हर लेनदेन एक अपरिवर्तनीय ब्लॉकचेन पर रिकॉर्ड किया जाता है, जो मूल्य निर्धारण, गुणवत्ता सत्यापन और आपूर्ति श्रृंखला ट्रैकिंग में अभूतपूर्व पारदर्शिता प्रदान करता है। किसानों को उचित मुआवजा मिलता है जबकि उपभोक्ताओं को अपने भोजन की गुणवत्ता और प्रामाणिकता में विश्वास मिलता है।',
    'aboutDescription3': 'हमारा प्लेटफॉर्म आधार सत्यापन, QR कोड तकनीक और स्मार्ट कॉन्ट्रैक्ट्स के साथ सहजता से एकीकृत होकर एक भरोसेमंद पारिस्थितिकी तंत्र बनाता है जो कृषि मूल्य श्रृंखला में सभी हितधारकों को लाभान्वित करता है।',
    
    // Features
    'keyFeatures': 'मुख्य विशेषताएं',
    'blockchainTransparency': 'ब्लॉकचेन पारदर्शिता',
    'blockchainDesc': 'पूर्ण ट्रेसेबिलिटी के लिए अपरिवर्तनीय ब्लॉकचेन पर रिकॉर्ड किए गए हर लेनदेन',
    'qrIntegration': 'QR कोड एकीकरण',
    'qrDesc': 'QR कोड के साथ तत्काल उत्पाद सत्यापन और यात्रा ट्रैकिंग',
    'fairPricingSystem': 'उचित मूल्य निर्धारण प्रणाली',
    'fairPricingDesc': 'पारदर्शी मूल्य निर्धारण सुनिश्चित करता है कि किसानों को उनकी उपज का उचित मूल्य मिले',
    'qualityAssurance': 'गुणवत्ता आश्वासन',
    'qualityDesc': 'ब्लॉकचेन-समर्थित प्रमाणपत्रों के साथ बहु-चरणीय गुणवत्ता सत्यापन',
    
    // Additional App Translations
    'sales': 'मेरी बिक्री',
    'searchFor': 'खोजें',
    'farmerPrice': 'किसान मूल्य',
    'handlingCharge': 'हैंडलिंग शुल्क',
    'quantity': 'मात्रा',
    'totalAmount': 'कुल राशि',
    'date': 'तारीख',
    'deliveryAddress': 'डिलीवरी पता',
    'buyer': 'खरीदार',
    'seller': 'विक्रेता',
    'orderId': 'ऑर्डर ID',
    'delivered': 'वितरित',
    'pending': 'लंबित',
    'inTransit': 'ट्रांजिट में',
    
    // Purchase and Product Form
    'buy': 'खरीदें',
    'purchase': 'खरीदारी',
    'purchaseProduct': 'उत्पाद खरीदें',
    'selectQuantity': 'मात्रा चुनें',
    'deliveryAddress': 'डिलीवरी पता',
    'totalPrice': 'कुल मूल्य',
    'confirmPurchase': 'खरीदारी की पुष्टि करें',
    'purchasing': 'खरीदारी की जा रही है...',
    'enterAddress': 'अपना डिलीवरी पता दर्ज करें',
    'quantityRequired': 'मात्रा आवश्यक है',
    'addressRequired': 'डिलीवरी पता आवश्यक है',
    'productName': 'उत्पाद का नाम',
    'category': 'श्रेणी',
    'harvestDate': 'फसल की तारीख',
    'pricePerKg': 'प्रति किलो मूल्य (₹)',
    'qualityGrade': 'गुणवत्ता श्रेणी',
    'productImage': 'उत्पाद की छवि (वैकल्पिक)',
    'uploadImage': 'उत्पाद की छवि अपलोड करें',
    'chooseImage': 'छवि चुनें',
    'handlingCharge': 'प्रति किलो हैंडलिंग शुल्क (₹)',
    'description': 'विवरण (वैकल्पिक)',
    'addProduct': 'उत्पाद जोड़ें',
    'addingProduct': 'उत्पाद जोड़ा जा रहा है...',
    'selectCategory': 'श्रेणी चुनें',
    'selectQuality': 'गुणवत्ता श्रेणी चुनें',
    'productDetails': 'आपके उत्पाद के बारे में अतिरिक्त विवरण...',
    'allFieldsRequired': 'सभी आवश्यक फ़ील्ड भरे जाने चाहिए',
    'validHandlingCharge': 'कृपया एक वैध हैंडलिंग शुल्क दर्ज करें',
    'gradeA': 'श्रेणी A',
    'gradeB': 'श्रेणी B',
    'premium': 'प्रीमियम',
    'vegetables': 'सब्जियां',
    'fruits': 'फल',
    'grains': 'अनाज',
    'spices': 'मसाले',
    'addproduct': 'उत्पाद जोड़ें',
    'addtoinventory': 'इन्वेंटरी में जोड़ें',
    'farmerPrice': 'किसान मूल्य',
    'totalAmount': 'कुल राशि',
    'quantity': 'मात्रा',
    'available': 'उपलब्ध'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('smartbhoomi-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('smartbhoomi-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}