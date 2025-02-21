"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MessageSquare, Cpu, Brain, Sparkles } from 'lucide-react';

const LandingPage = () => {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const floatingAnimation = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut"
      }
    }
  };

  const features = [
    {
      icon: MessageSquare,
      text: "Real-time Translation",
      color: "blue"
    },
    {
      icon: Brain,
      text: "Smart Summarization",
      color: "purple"
    },
    {
      icon: Sparkles,
      text: "Language Detection",
      color: "pink"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-purple-900 relative overflow-hidden">
      {/* Animated background elements - hidden on small screens */}
      <div className="absolute inset-0 hidden sm:block">
        <motion.div
          className="absolute top-[10%] left-[10%] lg:top-20 lg:left-20"
          {...floatingAnimation}
          transition={{ delay: 0 }}
        >
          <Brain className="w-12 h-12 md:w-16 md:h-16 text-blue-400/20" />
        </motion.div>
        <motion.div
          className="absolute top-[20%] right-[15%] lg:top-40 lg:right-32"
          {...floatingAnimation}
          transition={{ delay: 0.5 }}
        >
          <Cpu className="w-16 h-16 md:w-20 md:h-20 text-purple-400/20" />
        </motion.div>
        <motion.div
          className="absolute bottom-[20%] left-[20%] lg:bottom-32 lg:left-40"
          {...floatingAnimation}
          transition={{ delay: 1 }}
        >
          <MessageSquare className="w-20 h-20 md:w-24 md:h-24 text-indigo-400/20" />
        </motion.div>
        <motion.div
          className="absolute bottom-[25%] right-[10%] lg:bottom-40 lg:right-20"
          {...floatingAnimation}
          transition={{ delay: 1.5 }}
        >
          <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-pink-400/20" />
        </motion.div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 h-screen flex flex-col items-center justify-center">
        <motion.div
          className="text-center w-full max-w-6xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="mb-6 space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4 px-2">
              AI-Powered Chat Interface
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto px-4">
              Experience seamless language translation, intelligent summarization, and real-time language detection in one powerful interface.
            </p>
          </motion.div>

          {/* Features Section */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-8 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center px-4 sm:px-6">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-${feature.color}-500/10 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <feature.icon className={`w-6 h-6 sm:w-8 sm:h-8 text-${feature.color}-400`} />
                  </div>
                  <p className="text-sm sm:text-base text-gray-300">{feature.text}</p>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.button
              onClick={() => router.push('/chat')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white 
                         font-semibold text-base sm:text-lg hover:from-blue-600 hover:to-purple-600 
                         transform hover:scale-105 transition-all duration-200
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 
                         focus:ring-offset-transparent shadow-lg hover:shadow-xl
                         w-[60%] sm:w-auto min-w-[200px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started →
            </motion.button>
          </motion.div>

          {/* Additional mobile-only content */}
          <motion.div 
            variants={itemVariants}
            className="mt-8 text-center text-gray-400 text-sm block sm:hidden"
          >
            <p>Swipe up to explore more</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;