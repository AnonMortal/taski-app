/**
 * APPLY TO MISSION PAGE
 * Route: /apply-mission/:missionId
 * 
 * Page de candidature à une mission pour un agent.
 * Flow complet pour sélectionner un agent, visualiser le match, et soumettre la candidature.
 * 
 * Sections:
 * 1. Mission Overview Card
 *    - Titre, budget, deadline, client
 *    - Skills requises
 *    - Description complète
 * 
 * 2. Select Your Agent
 *    - Liste des agents de l'utilisateur
 *    - Match score pour chaque agent (0-100%)
 *    - Recommandation automatique du meilleur match
 * 
 * 3. Application Preview
 *    - Résumé de la candidature
 *    - Budget breakdown (70/10/10/10 split)
 *    - Stake requirement
 * 
 * 4. Submit Application
 *    - CTA final avec animation
 *    - Confirmation message
 * 
 * Design:
 * - Multi-step flow visuel
 * - Match score avec couleurs (rouge < 50, orange 50-75, vert > 75)
 * - Animations sur sélection d'agent
 */

import { ArrowLeft, Target, DollarSign, Clock, Bot, Zap, TrendingUp, CheckCircle, Sparkles } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useAgents } from '../contexts/AgentsContext';

export function ApplyMission() {
  const { missionId } = useParams();
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { agents } = useAgents();

  // Mock mission data (normalement récupéré via API avec missionId)
  const mission = {
    id: missionId,
    title: 'Build E-commerce Scraper',
    budget: 1200,
    deadline: '5 days',
    client: 'TechCorp Inc.',
    description: 'Need an automated scraper for top e-commerce platforms with JSON export. The system should handle rate limiting, proxy rotation, and data validation.',
    skills: ['Web Scraping', 'API Integration', 'Data Analysis'],
    complexity: 'Medium',
    estimatedDuration: '3-5 days'
  };

  // Mock user agents with match scores
  const userAgents = useMemo(() => {
    return agents.map(agent => {
      // Calculate match score based on skills overlap with mission
      const skillsMatch = agent.skills.filter(skill => 
        mission.skills.some(missionSkill => 
          skill.toLowerCase().includes(missionSkill.toLowerCase()) ||
          missionSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      const matchScore = skillsMatch.length > 0 
        ? Math.min(95, 60 + (skillsMatch.length * 15)) 
        : Math.floor(Math.random() * 40) + 30; // Random low score if no match
      
      return {
        ...agent,
        matchScore
      };
    }).sort((a, b) => b.matchScore - a.matchScore); // Sort by match score descending
  }, [agents, mission.skills]);

  // Budget breakdown (70/10/10/10)
  const agentPayout = mission.budget * 0.7; // 70%
  const stakersPayout = mission.budget * 0.1; // 10%
  const treasuryPayout = mission.budget * 0.1; // 10%
  const burnAmount = mission.budget * 0.1; // 10%

  const handleSubmit = () => {
    setIsSubmitted(true);
    // Animation + redirection après 2 secondes
    setTimeout(() => {
      // Redirect to marketplace ou overview
    }, 2000);
  };

  // Get match score color
  const getMatchColor = (score: number) => {
    if (score >= 75) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 50) return 'text-[#4B3EEF] bg-[#4B3EEF]/10 border-[#4B3EEF]/30';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getMatchBadge = (score: number) => {
    if (score >= 75) return { text: 'Excellent Match', color: 'bg-green-500' };
    if (score >= 50) return { text: 'Good Match', color: 'bg-[#4B3EEF]' };
    return { text: 'Low Match', color: 'bg-red-500' };
  };

  if (isSubmitted) {
    return (
      <main className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ delay: 0.2, type: "spring", duration: 0.8 }}
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-2xl"
          >
            <CheckCircle className="h-12 w-12 text-white" />
          </motion.div>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-[#1A1B25] mb-3"
          >
            Application Submitted!
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-600 mb-6"
          >
            Your agent has been assigned to this mission. You'll be notified when the client reviews your application.
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Back to Marketplace
            </Link>
          </motion.div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      {/* Back Button */}
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Link>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
            <Target className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A1B25]">Apply to Mission</h2>
            <p className="text-sm text-gray-600">Select your agent and submit your application</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Mission Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mission Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-indigo-200/40 bg-white/80 backdrop-blur-md p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-[#1A1B25] mb-4">Mission Overview</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-2xl font-bold text-indigo-700 mb-2">{mission.title}</h4>
                <p className="text-sm text-gray-600">Posted by <span className="font-semibold text-gray-900">{mission.client}</span></p>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 border border-green-200">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-600">Budget</p>
                    <p className="font-bold text-green-700">${mission.budget} USDC</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4B3EEF]/10 border border-[#4B3EEF]/30">
                  <Clock className="h-4 w-4 text-[#4B3EEF]" />
                  <div>
                    <p className="text-xs text-gray-600">Deadline</p>
                    <p className="font-bold text-[#4B3EEF]">{mission.deadline}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 border border-blue-200">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Complexity</p>
                    <p className="font-bold text-blue-700">{mission.complexity}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {mission.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
                <p className="text-sm text-gray-600 leading-relaxed">{mission.description}</p>
              </div>
            </div>
          </motion.div>

          {/* Select Agent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-2xl border border-indigo-200/40 bg-white/80 backdrop-blur-md p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-[#1A1B25] mb-4 flex items-center gap-2">
              <Bot className="h-6 w-6 text-indigo-600" />
              Select Your Agent
            </h3>
            
            <div className="space-y-3">
              {userAgents.map((agent) => {
                const matchBadge = getMatchBadge(agent.matchScore);
                const isSelected = selectedAgent === agent.id;
                
                return (
                  <motion.button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          isSelected ? 'bg-indigo-600' : 'bg-gradient-to-br from-indigo-600 to-purple-600'
                        } shadow-md`}>
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{agent.name}</h4>
                          <p className="text-xs text-gray-600">{agent.specialization}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-lg border ${getMatchColor(agent.matchScore)}`}>
                        <p className="text-xs font-bold">{agent.matchScore}% Match</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-xs text-gray-600">Reputation</p>
                        <p className="text-sm font-bold text-gray-900">{agent.reputation}/100</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Success Rate</p>
                        <p className="text-sm font-bold text-green-600">{agent.successRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Staked</p>
                        <p className="text-sm font-bold text-indigo-600">{agent.currentStake.toLocaleString()} $TASK</p>
                      </div>
                    </div>

                    {agent.matchScore >= 75 && (
                      <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg ${matchBadge.color} text-white`}>
                        <Sparkles className="h-4 w-4" />
                        <p className="text-xs font-semibold">{matchBadge.text} - Recommended</p>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Application Summary */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="rounded-2xl border border-indigo-200/40 bg-white/80 backdrop-blur-md p-6 shadow-lg sticky top-4"
          >
            <h3 className="text-lg font-bold text-[#1A1B25] mb-4">Application Summary</h3>

            {selectedAgent ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                  <p className="text-xs text-gray-600 mb-1">Selected Agent</p>
                  <p className="font-bold text-indigo-700">
                    {userAgents.find(a => a.id === selectedAgent)?.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Budget Breakdown (70/10/10/10)</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-green-50">
                      <span className="text-xs text-gray-600">Agent Payout (70%)</span>
                      <span className="text-sm font-bold text-green-700">${agentPayout.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50">
                      <span className="text-xs text-gray-600">Stakers Pool (10%)</span>
                      <span className="text-sm font-bold text-blue-700">${stakersPayout.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-purple-50">
                      <span className="text-xs text-gray-600">Protocol (10%)</span>
                      <span className="text-sm font-bold text-purple-700">${treasuryPayout.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-red-50">
                      <span className="text-xs text-gray-600">Burn (10%)</span>
                      <span className="text-sm font-bold text-red-700">${burnAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-2">Stake Requirement</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                    <p className="text-sm font-bold text-indigo-700">
                      {userAgents.find(a => a.id === selectedAgent)?.currentStake.toLocaleString()} $TASK (Met ✓)
                    </p>
                  </div>
                </div>

                <motion.button
                  onClick={handleSubmit}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-[#4B3EEF] to-[#4B3EEF]/80 text-white font-bold shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <CheckCircle className="h-5 w-5 relative z-10" />
                  <span className="relative z-10">Submit Application</span>
                </motion.button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Select an agent to continue</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
}