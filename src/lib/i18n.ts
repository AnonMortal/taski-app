import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

/**
 * Lightweight i18n: the translation KEY is the English string itself, so any
 * unwrapped/untranslated string simply falls back to English. To add Chinese
 * for a string, wrap it with t('English text') in the component and add an
 * entry below. New pages can be translated incrementally without breaking.
 */

const LANG_KEY = 'taskfi_lang';
export type Lang = 'en' | 'zh';

const zh: Record<string, string> = {
  // --- Sidebar / shell ---
  'Agentic Economy': '智能体经济',
  'Post a Mission': '发布任务',
  'Create Agent': '创建智能体',
  Overview: '概览',
  Marketplace: '市场',
  'For Agents': '面向智能体',
  'Agent Hub': '智能体中心',
  'Staking & Rewards': '质押与奖励',
  'For Enterprises': '面向企业',
  'Mission Control': '任务控制台',
  Account: '账户',
  'My Account': '我的账户',
  Links: '链接',

  // --- Top header ---
  'Search missions...': '搜索任务…',
  'Active Agents': '活跃智能体',
  Live: '在线',
  'Lock wallet': '锁定钱包',
  'Wallet address copied': '钱包地址已复制',

  // --- Post Mission ---
  'Find the perfect Agent for your task': '为你的任务找到合适的智能体',
  'Secure escrow • Quality guaranteed by consensus jury': '安全托管 • 由共识陪审团保证质量',
  "Who's posting this mission?": '谁来发布这个任务？',
  Individual: '个人',
  'Personal project': '个人项目',
  Enterprise: '企业',
  'Company project': '公司项目',
  'Mission Details': '任务详情',
  'Mission Category': '任务类别',
  'Bounty Setup': '赏金设置',
  'Minimum bounty: 1 USDC': '最低赏金：1 USDC',
  'Bounty Distribution (Transparent Split)': '赏金分配（透明分成）',
  'Winning Agent': '获胜智能体',
  'Your Total Investment': '您的总投入',
  'Secure Escrow Protection': '安全托管保护',
  'Pay by card & post mission': '刷卡支付并发布任务',
  'Pay with USDC from my wallet': '用钱包中的 USDC 支付',
  'Lock Bounty & Post Mission': '锁定赏金并发布任务',
  'Funds will be held in escrow until mission completion is verified.':
    '资金将被托管，直至任务完成通过验证。',
  'Waiting for payment…': '等待支付…',
  'Approving USDC…': '正在授权 USDC…',
  'Locking bounty on Base…': '正在 Base 上锁定赏金…',
  'Saving mission…': '正在保存任务…',
  'Checking balances…': '正在检查余额…',
  '🎉 Mission posted on-chain': '🎉 任务已上链发布',

  // --- Onramp modal ---
  'Pay by card': '刷卡支付',
  'Fund your mission with USDC on Base': '在 Base 上用 USDC 为任务注资',
  'You pay': '您支付',
  '{{amount}} USDC to your wallet': '{{amount}} USDC 到您的钱包',
  'gas covered': '燃料费已覆盖',
  'Card number': '卡号',
  Expiry: '有效期',
  CVC: '安全码',
  'Pay ${{amount}}': '支付 ${{amount}}',
  'Continue to Coinbase': '前往 Coinbase',
  "You'll complete your card payment securely with Coinbase. The USDC lands directly in your wallet — we cover the network gas.":
    '您将通过 Coinbase 安全完成刷卡支付。USDC 将直接到达您的钱包——网络燃料费由我们承担。',
  'Processing your card…': '正在处理您的银行卡…',
  'Complete your card payment in the Coinbase window…': '请在 Coinbase 窗口中完成刷卡支付…',
  'Payment failed. Please try again.': '支付失败，请重试。',
  'Adding funds to your wallet…': '正在向您的钱包注资…',
  'Confirming funds on Base…': '正在 Base 上确认资金…',
  'Please keep this window open.': '请保持此窗口打开。',
  'Funds received — finishing your mission…': '资金已到账，正在完成您的任务…',
  'Your card was not accepted. Please contact the project team.':
    '您的银行卡未被接受。请联系项目团队。',
  'Contact the team': '联系团队',
  Close: '关闭',
  'Try again': '重试',
  'Wallet or USDC config not ready. Reload and try again.':
    '钱包或 USDC 配置尚未就绪。请刷新后重试。',
  'Funds did not arrive in time. If your card payment went through, wait a moment and retry.':
    '资金未能及时到账。如果您的银行卡已扣款，请稍候片刻后重试。',
};

const stored =
  (typeof localStorage !== 'undefined' && (localStorage.getItem(LANG_KEY) as Lang)) || 'en';

void i18n.use(initReactI18next).init({
  lng: stored,
  fallbackLng: 'en',
  resources: { zh: { translation: zh } },
  // The key IS the English text, so disable separators (strings contain ":", ".", etc.).
  keySeparator: false,
  nsSeparator: false,
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});

export function setLanguage(lng: Lang): void {
  void i18n.changeLanguage(lng);
  try {
    localStorage.setItem(LANG_KEY, lng);
  } catch {
    // localStorage unavailable — language won't persist, not fatal.
  }
}

export function currentLanguage(): Lang {
  return (i18n.language as Lang) === 'zh' ? 'zh' : 'en';
}

export default i18n;
