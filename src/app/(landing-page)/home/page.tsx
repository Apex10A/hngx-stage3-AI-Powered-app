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

  // Floating animation for background elements
  const floatingAnimation = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-purple-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20"
          {...floatingAnimation}
          transition={{ delay: 0 }}
        >
          <Brain className="w-16 h-16 text-blue-400/20" />
        </motion.div>
        <motion.div
          className="absolute top-40 right-32"
          {...floatingAnimation}
          transition={{ delay: 0.5 }}
        >
          <Cpu className="w-20 h-20 text-purple-400/20" />
        </motion.div>
        <motion.div
          className="absolute bottom-32 left-40"
          {...floatingAnimation}
          transition={{ delay: 1 }}
        >
          <MessageSquare className="w-24 h-24 text-indigo-400/20" />
        </motion.div>
        <motion.div
          className="absolute bottom-40 right-20"
          {...floatingAnimation}
          transition={{ delay: 1.5 }}
        >
          <Sparkles className="w-16 h-16 text-pink-400/20" />
        </motion.div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-6 h-screen flex flex-col items-center justify-center">
        <motion.div
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
              AI-Powered Chat Interface
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto ">
              Experience seamless language translation, intelligent summarization, and real-time language detection in one powerful interface.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center px-6">
                <div className="w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-gray-300">Real-time Translation</p>
              </div>
              <div className="text-center px-6">
                <div className="w-16 h-16 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Brain className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-gray-300">Smart Summarization</p>
              </div>
              <div className="text-center px-6">
                <div className="w-16 h-16 bg-pink-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-8 h-8 text-pink-400" />
                </div>
                <p className="text-gray-300">Language Detection</p>
              </div>
            </div>

            <motion.button
              onClick={() => router.push('/chat')}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white font-semibold text-lg 
                         hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started →
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;