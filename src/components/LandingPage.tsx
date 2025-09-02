import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { AuthModal } from './AuthModal';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from './LanguageContext';
import { 
  Leaf, 
  Shield, 
  TrendingUp, 
  Users, 
  Truck, 
  Store, 
  User, 
  ChevronDown,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { motion, useScroll, useTransform, useInView } from 'motion/react';

interface LandingPageProps {
  onAuthSuccess: (user: any) => void;
}

export function LandingPage({ onAuthSuccess }: LandingPageProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentStage, setCurrentStage] = useState(0);
  const { t } = useLanguage();
  
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  const roadRef = useRef(null);
  const aboutRef = useRef(null);
  const chainRef = useRef(null);
  
  const isHeroInView = useInView(heroRef);
  const isAboutInView = useInView(aboutRef);
  const isChainInView = useInView(chainRef);

  // Parallax effects
  const logoY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const cropsX = useTransform(scrollYProgress, [0, 1], [0, -200]);
  
  // Supply chain progress based on scroll
  const chainProgress = useTransform(scrollYProgress, [0.5, 0.95], [0, 100]);

  // Mouse tracking for hover effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Update current stage based on scroll progress
  useEffect(() => {
    const unsubscribe = chainProgress.on('change', (value) => {
      if (value < 22) setCurrentStage(0);
      else if (value < 45) setCurrentStage(1);
      else if (value < 70) setCurrentStage(2);
      else setCurrentStage(3);
    });
    
    return unsubscribe;
  }, [chainProgress]);

  const cropVariants = {
    initial: { rotate: -5 },
    animate: { 
      rotate: [5, -5, 5],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const logoVariants = {
    initial: { scale: 1, y: 0 },
    hover: { 
      scale: 1.05, 
      y: -10,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-blue-50 to-green-100 overflow-hidden particle-bg">
      {/* Language Switcher */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center">
        {/* Background Images */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-green-50/90 via-blue-50/90 to-green-100/90 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1713272195609-93ca51c20062?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGVhdCUyMGZpZWxkJTIwZ29sZGVufGVufDF8fHx8MTc1NjY1MDk3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Wheat field"
            className="absolute left-0 top-0 w-1/2 h-full object-cover opacity-20"
          />
          <img 
            src="https://images.unsplash.com/photo-1655903724829-37b3cd3d4ab9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwcGFkZHklMjBmaWVsZCUyMGdyZWVufGVufDF8fHx8MTc1NjY1MDk4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Rice paddy field"
            className="absolute right-0 top-0 w-1/2 h-full object-cover opacity-20"
          />
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 z-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(34, 197, 94, 0.3) 2px, transparent 0)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Floating Crops Animation */}
        <div className="absolute inset-0 pointer-events-none z-30">
          {/* Wheat stalks */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`wheat-${i}`}
              className="absolute text-6xl drop-shadow-lg"
              style={{
                left: `${10 + (i * 6)}%`,
                top: `${20 + Math.sin(i) * 25}%`,
                color: '#fbbf24'
              }}
              variants={cropVariants}
              initial="initial"
              animate="animate"
              Style={{
                animationDelay: `${i * 0.2}s`,
                x: cropsX
              }}
            >
              🌾
            </motion.div>
          ))}
          
          {/* Rice/Paddy */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`rice-${i}`}
              className="absolute text-5xl drop-shadow-lg"
              style={{
                right: `${5 + (i * 8)}%`,
                top: `${60 + Math.cos(i) * 20}%`,
                color: '#22c55e'
              }}
              variants={cropVariants}
              initial="initial"
              animate="animate"
              Style={{
                animationDelay: `${i * 0.3}s`,
                x: cropsX
              }}
            >
              🌾
            </motion.div>
          ))}

          {/* Additional floating elements */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`extra-${i}`}
              className="absolute text-4xl opacity-60"
              style={{
                left: `${15 + (i * 12)}%`,
                top: `${40 + Math.sin(i * 2) * 30}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5
              }}
            >
              {['🌱', '🍃', '🌿', '🌾', '🌽', '🥬'][i]}
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <motion.div 
          className="text-center z-40 px-4 md:px-6 max-w-6xl mx-auto overflow-hidden"
          style={{ y: logoY }}
        >
          <motion.div
            className="inline-flex items-center gap-1 mb-8 w-full justify-center"
            variants={logoVariants}
            initial="initial"
            whileHover="hover"
          >
            <motion.div 
              className="bg-green-600 text-white p-3 md:p-4 rounded-2xl shadow-lg flex-shrink-0"
              whileHover={{ 
                boxShadow: "0 20px 40px rgba(34, 197, 94, 0.3)",
                y: -5
              }}
            >
              <Leaf className="size-8 md:size-12" />
            </motion.div>
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold shimmer-text text-center flex-1 min-w-0"
              animate={{
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {t('smartbhoomi')}
            </motion.h1>
          </motion.div>

          <motion.p 
            className="text-lg md:text-xl lg:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {t('transparentSupplyChain')} - {t('trackProduce')}
          </motion.p>

          <motion.div 
            className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12 px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <Badge variant="secondary" className="text-sm md:text-lg px-4 md:px-6 py-2 md:py-3 bg-white/80 backdrop-blur">
              <Shield className="size-4 md:size-5 mr-2" />
              {t('secure')}
            </Badge>
            <Badge variant="secondary" className="text-sm md:text-lg px-4 md:px-6 py-2 md:py-3 bg-white/80 backdrop-blur">
              <CheckCircle className="size-4 md:size-5 mr-2" />
              {t('verified')}
            </Badge>
            <Badge variant="secondary" className="text-sm md:text-lg px-4 md:px-6 py-2 md:py-3 bg-white/80 backdrop-blur">
              <TrendingUp className="size-4 md:size-5 mr-2" />
              {t('fairPricing')}
            </Badge>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            <Button 
              size="lg" 
              className="text-xl px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 glowing hover-lift"
              onClick={() => setAuthModalOpen(true)}
            >
              {t('getStarted')}
              <ArrowRight className="size-5 ml-2" />
            </Button>
          </motion.div>

          <motion.div 
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="size-8 text-gray-500" />
          </motion.div>
        </motion.div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} className="relative py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isAboutInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 px-4 text-center">
              {t('aboutSmartBhoomi')}
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {t('aboutDescription1')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: t('blockchainTransparency'),
                description: t('blockchainDesc'),
                color: "text-blue-600",
                bgColor: "bg-blue-100"
              },
              {
                icon: Users,
                title: t('fairPricingSystem'),
                description: t('fairPricingDesc'),
                color: "text-green-600",
                bgColor: "bg-green-100"
              },
              {
                icon: CheckCircle,
                title: t('qualityAssurance'),
                description: t('qualityDesc'),
                color: "text-purple-600",
                bgColor: "bg-purple-100"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={isAboutInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${feature.bgColor} mb-6`}>
                      <feature.icon className={`size-8 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supply Chain Animation Section */}
      <section ref={chainRef} className="relative py-20 bg-gradient-to-b from-green-50 to-blue-50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isChainInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 px-4 text-center">
              {t('journeyFarmToFork')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
              {t('followTransparentPath')}
            </p>
            
            {/* Progress Indicator */}
            <motion.div 
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-3 md:px-4 py-2 rounded-full shadow-lg mx-4"
              initial={{ opacity: 0 }}
              animate={isChainInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 }}
            >
              <div className="text-xs md:text-sm font-medium text-center">
                {t('currentStage')}: {[t('farmer'), t('wholesaler'), t('retailer'), t('consumer')][currentStage]}
              </div>
              <div className={`w-2 h-2 rounded-full ${
                currentStage === 0 ? 'bg-green-500' :
                currentStage === 1 ? 'bg-blue-500' :
                currentStage === 2 ? 'bg-purple-500' : 'bg-orange-500'
              } animate-pulse`} />
            </motion.div>
            
            {/* Scroll Hint */}
            <motion.div
              className="mt-4 text-xs md:text-sm text-gray-500 flex items-center justify-center gap-2 px-4"
              initial={{ opacity: 0 }}
              animate={isChainInView ? { opacity: 1 } : {}}
              transition={{ delay: 1 }}
            >
              <span className="text-center">{t('scrollHint')}</span>
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ⬇️
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Road and Supply Chain */}
          <div ref={roadRef} className="relative h-96 mb-16">
            {/* Road Background - More visible with darker center line */}
            <div className="absolute bottom-0 w-full h-12 bg-gray-400/70 rounded-lg overflow-hidden shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-300/60 to-gray-500/70 rounded-lg" />
              {/* Road center line - darker and more visible */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800/90 transform -translate-y-1/2" />
              {/* Road markings with moving animation - dashed center line */}
              <div 
                className="absolute top-1/2 left-0 w-full h-1 bg-white/50 transform -translate-y-1/2 road-animation"
                style={{ 
                  backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(255,255,255,0.9) 15px, rgba(255,255,255,0.9) 30px)',
                  backgroundSize: '45px 100%'
                }}
              />
              {/* Road edges */}
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-600/40" />
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-600/40" />
            </div>

            {/* Delivery Truck - Continuous looping animation to consumer */}
            <motion.div
              className="absolute bottom-[2.5rem] z-5"
              animate={{ 
                x: ['0%', '95%', '95%', '0%']
              }}
              transition={{ 
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.7, 0.9, 1]
              }}
            >
              <motion.div
                className="relative text-5xl tractor-bounce"
                style={{
                  filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.4))'
                }}
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 50,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                ⛟
                
                {/* Dust particles behind vehicle */}
                <motion.div
                  className="absolute -left-6 top-1/2 transform -translate-y-1/2"
                  animate={{
                    opacity: [0.4, 0.7, 0.4],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="text-2xl opacity-50">💨</div>
                </motion.div>
                
                {/* Celebration particles when reaching stages */}
                {[0, 1, 2, 3].map((stage) => (
                  currentStage >= stage && (
                    <motion.div
                      key={stage}
                      className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: [0, 1.5, 0],
                        opacity: [0, 1, 0],
                        y: [0, -20, -40]
                      }}
                      transition={{ 
                        duration: 1.5,
                        ease: "easeOut"
                      }}
                    >
                      <div className="text-lg">✨</div>
                    </motion.div>
                  )
                ))}
              </motion.div>
            </motion.div>

            {/* Supply Chain Points */}
            {[
              { icon: Leaf, label: t('farmer'), position: "5%", color: "bg-green-600", description: t('farmerDesc') },
              { icon: Truck, label: t('wholesaler'), position: "30%", color: "bg-blue-600", description: t('wholesalerDesc') },
              { icon: Store, label: t('retailer'), position: "60%", color: "bg-purple-600", description: t('retailerDesc') },
              { icon: User, label: t('consumer'), position: "95%", color: "bg-orange-600", description: t('consumerDesc') }
            ].map((point, index) => (
              <motion.div
                key={index}
                className="absolute z-20"
                style={{ left: point.position, top: '20%' }}
                initial={{ opacity: 0, scale: 0 }}
                animate={isChainInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: index * 0.3 }}
              >
                {/* Connection Line */}
                {index < 3 && (
                  <div className={`absolute top-1/2 left-full h-1 transform -translate-y-1/2 z-10 ${
                    index === 0 ? 'w-20' : index === 1 ? 'w-24' : 'w-32'
                  }`}>
                    {/* Background line */}
                    <div className="w-full h-full bg-gray-300 rounded-full" />
                    {/* Progress line */}
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-green-500 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ 
                        width: index < currentStage ? '100%' : 
                               index === currentStage ? '50%' : '0%'
                      }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    />
                  </div>
                )}
                
                {/* Point */}
                <div className={`relative ${point.color} text-white p-4 rounded-full shadow-lg z-20`}>
                  <point.icon className="size-8" />
                </div>
                
                {/* Label */}
                <div className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 text-center z-20">
                  <h4 className="font-semibold text-sm md:text-lg">{point.label}</h4>
                  <p className="text-xs md:text-sm text-gray-600 max-w-20 md:max-w-24 break-words">{point.description}</p>
                </div>

                {/* Hot Point Animation with Notes */}
                <motion.div
                  className={`absolute -top-2 -right-2 w-4 h-4 rounded-full pulse-dot z-30 ${
                    index <= currentStage ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  animate={{ 
                    scale: [1, 1.5, 1], 
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    delay: index * 0.2 
                  }}
                >
                  {/* Ripple effect */}
                  <motion.div
                    className={`absolute inset-0 rounded-full ${
                      index <= currentStage ? 'bg-green-400' : 'bg-red-400'
                    }`}
                    animate={{ scale: [1, 2, 3], opacity: [0.8, 0.3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  />
                  
                  {/* Success checkmark for completed stages */}
                  {index <= currentStage && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center text-white text-xs"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      ✓
                    </motion.div>
                  )}
                  
                  {/* Info tooltip */}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-40">
                    {point.description}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "324+", subtitle: t('verifiedFarmers'), icon: "👨‍🌾" },
              { title: "94%", subtitle: t('priceTransparency'), icon: "💰" },
              { title: "85%", subtitle: t('supplyChainEfficiency'), icon: "📈" },
              { title: "3.2", subtitle: "Avg. Days Farm to Table", icon: "⏱️" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isChainInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-3">{stat.icon}</div>
                  <div className="text-3xl font-bold text-green-600 mb-2">{stat.title}</div>
                  <div className="text-gray-600">{stat.subtitle}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Ready to Transform Agriculture?
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 opacity-90"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Join thousands of farmers, retailers, and consumers creating a transparent food ecosystem
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button 
              size="lg" 
              variant="secondary"
              className="text-xl px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => setAuthModalOpen(true)}
            >
              Join SmartBhoomi Today
              <ArrowRight className="size-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        onAuthSuccess={onAuthSuccess}
      />
    </div>
  );
}