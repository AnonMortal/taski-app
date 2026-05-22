import { User, Wallet, Shield, Bell, Globe, Save } from 'lucide-react';
import { useState } from 'react';
import { useWallet } from '../../lib/wallet-context';

export function Account() {
  const { address } = useWallet();
  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : 'Not connected';
  const [notifications, setNotifications] = useState({
    missionUpdates: true,
    juryVerdict: true,
    stakingRewards: true,
    newMissions: false,
    weeklyDigest: true
  });

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A1B25]">My Account</h2>
            <p className="text-sm text-gray-600">Manage your profile and preferences</p>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-[#1A1B25] mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-indigo-600" />
          Profile Information
        </h3>
        <div className="rounded-xl border border-indigo-200/40 bg-white/80 backdrop-blur-md p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Display Name</label>
              <input
                type="text"
                defaultValue="CryptoBuilder"
                className="w-full px-4 py-2.5 rounded-lg border border-indigo-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                defaultValue="builder@taskfi.ai"
                className="w-full px-4 py-2.5 rounded-lg border border-indigo-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
              <textarea
                rows={4}
                defaultValue="Building autonomous AI agents for the decentralized economy. Passionate about Web3 and AI innovation."
                className="w-full px-4 py-2.5 rounded-lg border border-indigo-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
              />
            </div>
          </div>

          <button className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Wallet Settings */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-[#1A1B25] mb-4 flex items-center gap-2">
          <Wallet className="h-5 w-5 text-indigo-600" />
          Wallet & Blockchain
        </h3>
        <div className="rounded-xl border border-indigo-200/40 bg-white/80 backdrop-blur-md p-6 shadow-lg">
          {/* Connected Wallet */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Connected Wallet</label>
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1A1B25] font-mono">{shortAddress}</p>
                  <p className="text-xs text-gray-600">Base Network</p>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-full bg-green-600 text-white text-xs font-bold">Connected</span>
            </div>
          </div>

          {/* Network Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Network</label>
            <select className="w-full px-4 py-2.5 rounded-lg border border-indigo-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
              <option>Base (Current)</option>
              <option>Ethereum</option>
              <option>Polygon</option>
              <option>Arbitrum</option>
            </select>
          </div>

          {/* Token Balances */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Token Balances</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
                <p className="text-xs text-gray-600 mb-1">$TASK Balance</p>
                <p className="text-2xl font-bold text-indigo-700">24,500</p>
                <p className="text-xs text-gray-500 mt-1">≈ $35,525 USD</p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                <p className="text-xs text-gray-600 mb-1">USDC Balance</p>
                <p className="text-2xl font-bold text-green-700">$8,750</p>
                <p className="text-xs text-gray-500 mt-1">Available for withdrawal</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-[#1A1B25] mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-indigo-600" />
          Notification Preferences
        </h3>
        <div className="rounded-xl border border-indigo-200/40 bg-white/80 backdrop-blur-md p-6 shadow-lg">
          <div className="space-y-4">
            {/* Mission Updates */}
            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-indigo-50/50 transition-colors">
              <div>
                <p className="font-semibold text-[#1A1B25]">Mission Updates</p>
                <p className="text-sm text-gray-600">Get notified when your missions have updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.missionUpdates}
                  onChange={(e) => setNotifications({ ...notifications, missionUpdates: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Jury Verdict */}
            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-indigo-50/50 transition-colors">
              <div>
                <p className="font-semibold text-[#1A1B25]">Jury Verdict</p>
                <p className="text-sm text-gray-600">Alerts when consensus jury reaches a verdict</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.juryVerdict}
                  onChange={(e) => setNotifications({ ...notifications, juryVerdict: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Staking Rewards */}
            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-indigo-50/50 transition-colors">
              <div>
                <p className="font-semibold text-[#1A1B25]">Staking Rewards</p>
                <p className="text-sm text-gray-600">Notifications for rewards and claim eligibility</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.stakingRewards}
                  onChange={(e) => setNotifications({ ...notifications, stakingRewards: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* New Missions */}
            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-indigo-50/50 transition-colors">
              <div>
                <p className="font-semibold text-[#1A1B25]">New Missions</p>
                <p className="text-sm text-gray-600">Get alerted about new marketplace missions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.newMissions}
                  onChange={(e) => setNotifications({ ...notifications, newMissions: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Weekly Digest */}
            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-indigo-50/50 transition-colors">
              <div>
                <p className="font-semibold text-[#1A1B25]">Weekly Digest</p>
                <p className="text-sm text-gray-600">Weekly summary of activity and earnings</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.weeklyDigest}
                  onChange={(e) => setNotifications({ ...notifications, weeklyDigest: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-[#1A1B25] mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-600" />
          Security Settings
        </h3>
        <div className="rounded-xl border border-indigo-200/40 bg-white/80 backdrop-blur-md p-6 shadow-lg">
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-[#4B3EEF]/10 to-[#3D32D9]/5 border border-[#4B3EEF]/30">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-[#4B3EEF] mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1A1B25] mb-1">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600 mb-3">Add an extra layer of security to your account</p>
                  <button className="px-4 py-2 rounded-lg bg-[#4B3EEF] text-white text-sm font-semibold hover:bg-[#3D32D9] transition-colors">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1A1B25] mb-1">Session Management</p>
                  <p className="text-sm text-gray-600 mb-2">Manage active sessions and devices</p>
                  <p className="text-xs text-gray-500">Last login: Today at 2:45 PM from Chrome on MacOS</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
