# TaskFi Platform — Guidelines for Claude

## Projet
**TaskFi** ("Upwork for AI Agents") — dashboard Web3 sur Base Network.  
Token: **$TASK**. Standard d'identité agents: **ERC-5192 Soulbound Token**.  
Ne jamais écrire "Synergy", "$SYNR" ou référencer l'ancien branding.

---

## Design System

### Couleurs — règles strictes
- Fond principal: `#F4F5FF` (Frosted White)
- Accent lavender: `#EBEAFE`
- CTA / Primaire: `#4B3EEF` (violet)
- Texte principal: `#1A1B25` — **jamais de noir pur**
- Peach `#FF9E80`: **uniquement** pour le badge "Locked · Soulbound" ERC-5192
- Pas d'orange dans les CTA ou boutons

### Trust Score — code couleur obligatoire
| Score | Couleur |
|---|---|
| ≥ 90 | `text-green-600` / `bg-green-500` |
| 75–89 | `text-[#4B3EEF]` / `bg-[#4B3EEF]` |
| 55–74 | `text-amber-600` / `bg-amber-400` |
| < 55 | `text-red-600` / `bg-red-500` |

### Composants
- Cartes: `rounded-2xl border border-indigo-100 bg-white shadow-md`
- Backdrop: `bg-white/80 backdrop-blur-md`
- Hover: `hover:shadow-xl hover:scale-[1.02] transition-all duration-300`
- Pas de reset CSS global (Tailwind gère déjà)

---

## Logo
```tsx
import obeliskLogo from '@/imports/logo_fond_blanc_obelisk.png';
// Dans la Sidebar:
<img src={obeliskLogo} alt="TaskFi Logo" className="h-10 w-10 -mr-1" />
<h1 className="text-2xl font-bold text-[#1A1B25]">TaskFi</h1>
```
Ne jamais utiliser l'ancien import `figma:asset/...` pour le logo.

---

## ERC-5192 Agent Passports

### Champs on-chain à toujours afficher
```
tokenId        ex: "#0042"
locked()       toujours true
trustScore     0–100 avec code couleur
totalMissions  entier
slashCount     entier (0 = vert, 1–2 = amber, ≥3 = rouge)
primarySkill   texte (ex: "Solidity", "Python")
```

### Badge Soulbound (obligatoire sur chaque carte passeport)
```tsx
<div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1A1B25]">
  <Lock className="h-3 w-3 text-white" />
  <span className="text-[10px] font-bold text-white uppercase tracking-wide">Soulbound</span>
</div>
```

### Intégration dans les cartes agent
Les passeports ERC-5192 ne sont **pas** une section séparée — ils s'intègrent directement dans les cartes "Your Agent Portfolio" :
- Strip supérieur: Token ID mono + badge Soulbound
- Bloc Trust Score: barre colorée + slashes + Primary Skill
- Puis les métriques portfolio habituelles

---

## Page Agent Hub (`/agent-center`)

Structure obligatoire (dans l'ordre) :
1. Header avec icône `Shield`
2. Bandeau protocole ERC-5192 (fond `#EBEAFE/60`, texte `#4B3EEF`)
3. CTA "Create a New AI Agent" → sous-titre mentionne "mint your on-chain passport"
4. Section **"Your Agent Portfolio"** — cartes avec ERC-5192 intégrés
5. Section **"Smart Match Recommendations"** — cartes vertes par agent

---

## Page Create Agent (`/create-agent`)

### Bouton principal
```
"Deploy on @Base & Mint On-chain Passport"
```

### Minting Modal — 2 étapes
**Étape 1 (3s) — Loading** :
- `backdropFilter: blur(12px)`, fond `rgba(20,21,40,0.75)`
- Deux anneaux rotatifs (violet + peach) + icône `Shield`
- Titre: "Minting ERC-5192 Agent Passport..."
- Subtext: "Securing webhook endpoint and anchoring identity to @Base."
- 3 étapes animées séquentiellement
- Watermark code `agent.identity.mintPassport(...)` en fond

**Étape 2 — Passport Reveal** :
- Carte sombre `#1A1B25` avec barre holographique `from-[#4B3EEF] via-[#FF9E80] to-[#7C6FF7]`
- Mention "TaskFi Protocol" (pas "Synergy Protocol")
- Badge Locked · Soulbound en peach `#FF9E80`
- Trust 100/100, Missions 0, Slashes 0, Primary Skill = premier tag du formulaire
- `locked() → true // immutable · non-transferable`
- Boutons: "Go to Agent Hub" → `/agent-center` | "View on BaseScan"

---

## MissionsTable (`/` — Overview)

**5 colonnes obligatoires** :
1. Mission Name
2. Reward (USDC)
3. Status
4. **Executed By** (passeport compact)
5. Jury Consensus

### Colonne "Executed By"
```tsx
// Si agent assigné:
<div className="flex items-center gap-2.5">
  <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#4B3EEF]/10 to-[#EBEAFE] border border-[#4B3EEF]/20">
    <Cpu className="h-4 w-4 text-[#4B3EEF]" />
    {/* Mini lock badge */}
  </div>
  <div>
    <Hash className="h-2.5 w-2.5 text-gray-400" /> {tokenId}  {/* mono */}
    <TrustScorePill score={trustScore} slashCount={slashCount} />
  </div>
</div>
// Si non assigné:
<span className="text-xs text-gray-400 italic">Unassigned</span>
```

---

## Imports d'images
```tsx
// CORRECT — ES module import
import obeliskLogo from '@/imports/logo_fond_blanc_obelisk.png';
<img src={obeliskLogo} alt="TaskFi Logo" />

// INTERDIT — string path (casse en production)
<img src="/src/imports/logo_fond_blanc_obelisk.png" />
```

---

## Animations (Motion)
```tsx
// Import correct
import { motion, AnimatePresence } from 'motion/react';

// NE PAS importer depuis 'motion' seul pour AnimatePresence
// NE PAS utiliser useScroll/useTransform depuis 'motion'
```

---

## Token et branding
- Token: **$TASK** partout (staking, rewards, balances, UI)
- Nom du projet: **TaskFi** partout
- Email exemple: `builder@taskfi.ai`
- Dossier interne `/components/synergy/` peut rester tel quel (technique uniquement)
