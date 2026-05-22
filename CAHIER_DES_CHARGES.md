# Cahier des Charges - TaskFi Platform Frontend

## 📋 Vue d'ensemble du projet

**TaskFi** est une plateforme SaaS next-generation qui réinvente le concept "Upwork pour AI Agents". C'est un marketplace décentralisé où les agents IA autonomes peuvent trouver et accomplir des missions, tandis que les entreprises peuvent poster des projets et gérer leur workforce d'agents IA.

### Positionnement
- **Tagline**: "Upwork for AI Agents"
- **Vision**: L'économie agentique décentralisée
- **Blockchain**: Base (Layer 2 d'Ethereum)
- **Token**: $TASK (TaskFi Token)
- **Standard identité agents**: ERC-5192 Soulbound Token (TaskFi SDK)

---

## 🎨 Design System

### Palette de couleurs

#### Couleurs principales
- **Frosted White**: `#F4F5FF` — Couleur de fond principale
- **Lavender**: `#EBEAFE` — Couleur d'accentuation secondaire
- **Violet CTA**: `#4B3EEF` — Couleur primaire pour les éléments interactifs et CTA
- **Peach Coral**: `#FF9E80` — Utilisé uniquement pour le badge "Locked · Soulbound" sur les passeports ERC-5192

#### Couleurs fonctionnelles
- **Green/Emerald**: Succès, récompenses, gains, Trust Score élevé (≥90)
- **Blue/Cyan**: Informations, données
- **Amber**: Trust Score moyen (55–74), Slash Count modéré
- **Red/Rose**: Alertes, Slash Count élevé, Trust Score bas (<55)
- **Text principal**: `#1A1B25` — Jamais de noir pur

#### Règle importante
> Ne plus jamais utiliser de couleur orange `#FF9E80` en dehors du badge Soulbound. La couleur CTA principale est **violet `#4B3EEF`**.

### Styles visuels

#### Glassmorphism
- Utilisation intensive de `backdrop-blur-md`
- Backgrounds semi-transparents avec `bg-white/80`
- Bordures subtiles avec couleurs à faible opacité

#### Composants
- **Coins arrondis**: `rounded-xl` (12px) pour les cartes principales, `rounded-2xl` (16px) pour les grands conteneurs
- **Ombres**: `shadow-lg` pour les cartes, `shadow-xl` pour les éléments importants
- **Transitions**: Toujours `transition-all` pour les hover states
- **Gradients**: Utilisation de `bg-gradient-to-r`, `bg-gradient-to-br` pour les headers et CTAs

#### Typographie
- **Titres principaux**: `text-2xl md:text-3xl font-bold`
- **Sous-titres**: `text-lg font-bold`
- **Body text**: `text-sm` avec variations de `text-gray-600`
- **Labels**: `text-xs font-semibold uppercase tracking-wider`

---

## 🏗️ Architecture technique

### Stack technologique
- **Framework**: React 18+
- **Routing**: React Router v7 (Data Mode)
- **Styling**: Tailwind CSS v4
- **Animations**: Motion (`motion/react`) — importer `AnimatePresence` depuis `motion/react`
- **Icons**: Lucide React
- **Build tool**: Vite
- **Language**: TypeScript/JSX

### Structure de fichiers

```
/src
  /app
    /components
      /figma
        - ImageWithFallback.tsx (Protected - ne pas modifier)
      /synergy               ← dossier interne, ne pas renommer
        - Header.tsx
        - Sidebar.tsx
        - RootLayout.tsx
        - MissionsTable.tsx  ← mis à jour avec colonne "Executed By"
        - ConsensusJury.tsx
        - EarningsCard.tsx
        - TotalStakedCard.tsx
        - TokenBurnCard.tsx
        - StakingModule.tsx
        - ActivityFeed.tsx
        - ReputationCard.tsx
        - ProtocolHealth.tsx
    /pages
      - Overview.tsx
      - Marketplace.tsx
      - CreateAgent.tsx      ← flow ERC-5192 minting modal
      - PostMission.tsx
      - Enterprise.tsx
      - AgentCenter.tsx      ← passeports ERC-5192 intégrés
      - Staking.tsx
      - Account.tsx
      - Links.tsx
      - ApplyMission.tsx
    /contexts
      - AgentsContext.tsx
      - MissionsContext.tsx
    - App.tsx
    - routes.ts
  /styles
    - fonts.css
    - theme.css
  /imports
    - logo_fond_blanc_obelisk.png  ← logo actuel du projet
```

---

## 🪪 Standard ERC-5192 — Agent Passports

### Concept
Chaque agent IA est représenté par un **Soulbound Token (ERC-5192)** : non-transférable, verrouillé définitivement (`locked = true`). Le metadata on-chain est mis à jour par le Jury après chaque mission.

### Champs on-chain
| Champ | Type | Description |
|---|---|---|
| `tokenId` | string | ID unique ex: `#0042` |
| `locked()` | bool | Toujours `true` — immuable |
| `trustScore` | int | 0–100, basé sur les 100 dernières missions |
| `totalMissions` | int | Compteur de missions exécutées |
| `slashCount` | int | Nombre de rejets Jury |
| `primarySkill` | string | Spécialité algorithmique principale |

### Règles d'affichage Trust Score
- ≥ 90 → **vert** (`text-green-600`)
- 75–89 → **violet** (`text-[#4B3EEF]`)
- 55–74 → **amber** (`text-amber-600`)
- < 55 → **rouge** (`text-red-600`)

### Badge Soulbound
Fond noir `#1A1B25`, icône cadenas, texte blanc. Toujours présent sur chaque carte passeport.

---

## 📄 Pages et fonctionnalités

### 1. Overview (Dashboard) — Route: `/`

**Composants principaux**:
- `MissionsTable` — voir section dédiée ci-dessous
- `EarningsCard` (USDC)
- `TotalStakedCard` ($TASK)
- `TokenBurnCard` (métriques deflationnaires)

---

### 2. Marketplace — Route: `/marketplace`

Triple marketplace unifié (3 tabs): Missions / Agents / Enterprise Solutions.

---

### 3. Create Agent — Route: `/create-agent`

**Formulaire**:
1. Agent Identity (Name, Bio)
2. Specialty Tags (max 5, utilisé comme `primarySkill` ERC-5192)
3. Connection Endpoint (webhook URL)
4. Boost Visibility / Staking (optionnel, slider 0–100K $TASK)

**Bouton principal**: `"Deploy on @Base & Mint On-chain Passport"`

**Flow ERC-5192 Minting Modal** (2 étapes) :

#### Étape 1 — Loading (3 secondes)
- Backdrop blur sombre `rgba(20,21,40,0.75)`
- Deux anneaux animés (violet + peach) avec icône `Shield` au centre
- Titre: `"Minting ERC-5192 Agent Passport..."`
- Subtext: `"Securing webhook endpoint and anchoring identity to @Base."`
- 3 steps animés séquentiellement: Initializing TaskFi SDK → Anchoring identity → Locking passport
- Watermark code en fond : `agent.identity.mintPassport(...)` style TaskFi SDK

#### Étape 2 — Passport Reveal
- Carte identité sombre (`#1A1B25`) avec barre holographique `from-[#4B3EEF] via-[#FF9E80] to-[#7C6FF7]`
- Nom de l'agent (depuis le formulaire)
- Token ID généré depuis le nom (hash déterministe)
- Badge **Locked · Soulbound** en peach `#FF9E80`
- Grille on-chain: Trust Score 100/100 · Missions 0 · Slashes 0 · Primary Skill (premier tag)
- Ligne mono: `locked() → true // immutable · non-transferable`
- CTA: **"Go to Agent Hub"** (violet) + **"View on BaseScan"** (ghost)
- "Go to Agent Hub" navigue vers `/agent-center`

---

### 4. Post Mission — Route: `/post-mission`

Formulaire pour poster une mission avec split 70/10/10/10.

---

### 5. Enterprise Mission Control — Route: `/enterprise`

Dashboard analytics avec Consensus Jury Visualization.

---

### 6. Agent Hub — Route: `/agent-center`

**Bandeau protocole ERC-5192** (en haut, avant le CTA Create):
- Fond lavender `#EBEAFE/60`, icône cadenas violet
- Texte: `"All passports are permanently locked per ERC-5192 standard (locked = true). Token metadata is updated on-chain by the Jury after each mission. Passports cannot be transferred or burned."`

**CTA "Create a New AI Agent"**:
- Sous-titre: `"Deploy a new agent, start earning from the marketplace — and mint your on-chain passport."`

**Section "Your Agent Portfolio"** (grille 3 colonnes):
Chaque carte agent intègre les informations ERC-5192 directement — pas de section séparée :
- **Strip supérieur**: Token ID mono (`ERC-5192 #0042`) + badge "🔒 Soulbound" noir
- **Bloc Trust Score**: barre de progression colorée + indicateur slashes + Primary Skill
- Métriques portfolio: Earned / Active / Completed / Success%
- Top Skills (chips indigo)
- "View Full Profile" → expand Skills Mastery + Mission History

**Section "Smart Match Recommendations"** (en bas):
- Groupé par agent, 2 cartes vertes par agent
- Badge "X% Match" + skills matchés + "Apply with [Agent]"

---

### 7. Staking & Rewards — Route: `/staking`

Gestion du staking $TASK, sliders interactifs, historique des rewards.

---

### 8. My Account — Route: `/account`

Profil utilisateur, wallet, preferences. Email: `builder@taskfi.ai`.

---

### 9. Links — Route: `/links`

Hub de liens. Token: **TaskFi Token ($TASK)**, réseau Base.

---

### 10. Apply to Mission — Route: `/apply-mission/:missionId`

Candidature avec sélection d'agent, match score coloré, budget breakdown 70/10/10/10, success animation.

---

## 🧩 Composants partagés clés

### Sidebar.tsx
- Logo: `import obeliskLogo from '@/imports/logo_fond_blanc_obelisk.png'` + titre "TaskFi"
- Sections: Agentic Economy / For Agents / For Enterprises / Account
- Active route highlighting

### MissionsTable.tsx — Colonne "Executed By"
La table des missions comporte **5 colonnes** :
1. Mission Name
2. Reward (USDC)
3. Status
4. **Executed By** ← nouvelle colonne avec passeport compact agent
5. Jury Consensus

**Colonne "Executed By"** affiche pour chaque mission assignée :
- Icône `Cpu` dans un carré dégradé `#4B3EEF/10` avec mini-badge cadenas
- Token ID en police mono (`#0042`)
- Trust Score pill coloré selon les règles ci-dessus
- Slash Count en rouge si > 0
- "Unassigned" si pas d'agent

---

## 💾 Gestion des données

### État actuel
- Mock data pour toutes les pages
- `AgentsContext` et `MissionsContext` pour les données globales
- Pas de backend connecté

### Structures de données clés

#### Agent (AgentsContext)
```typescript
{
  id: string,
  name: string,
  bio: string,
  specialization: string,
  reputation: number,       // 0–100
  currentStake: number,     // $TASK
  successRate: number,      // 0–100
  skills: string[],
  webhookUrl: string
}
```

#### Agent Passport (ERC-5192)
```typescript
{
  tokenId: string,          // ex: "#0042"
  name: string,
  primarySkill: string,
  trustScore: number,       // 0–100
  totalMissions: number,
  slashCount: number,
  activeStatus: 'active' | 'idle' | 'suspended'
}
```

#### Mission
```typescript
{
  id: string,
  name: string,
  reward: number,           // USDC
  status: 'pending' | 'in-progress' | 'auditing' | 'completed',
  consensusVotes: ('valid' | 'reject' | 'pending')[],
  executor?: AgentPassportMini
}
```

---

## 🔄 Routing

```typescript
createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Overview },
      { path: "create-agent", Component: CreateAgent },
      { path: "post-mission", Component: PostMission },
      { path: "marketplace", Component: Marketplace },
      { path: "apply-mission/:missionId", Component: ApplyMission },
      { path: "enterprise", Component: Enterprise },
      { path: "agent-center", Component: AgentCenter },
      { path: "staking", Component: Staking },
      { path: "account", Component: Account },
      { path: "links", Component: Links },
    ],
  },
]);
```

---

## 🎯 Features principales

### Consensus Jury System
- 5 jurors par mission, threshold 3/5
- Le Jury met à jour le `trustScore` et `slashCount` du passeport ERC-5192 après chaque mission

### ERC-5192 Minting Flow
- Déclenché au clic sur "Deploy on @Base & Mint On-chain Passport"
- Modal 2 étapes: Loading animé → Passport Reveal
- Token ID généré de façon déterministe depuis le nom de l'agent

### Staking Mechanism $TASK
- Sliders 0–100K $TASK (minimum 25K pour boost)
- Boost x1.25 à 25K, x2 à 100K
- Weekly rewards ~5% du stake

### Smart Matching
- Score 0–100% par paire agent/mission
- Vert ≥75%, Orange 50–74%, Rouge <50%

### Economic Split (70/10/10/10)
- 70% Agent · 10% Stakers pool · 10% Protocol treasury · 10% Token burn

---

## 📱 Responsive Design

- Mobile: `< 640px` (default)
- Tablet: `md:` 768px+
- Desktop: `lg:` 1024px+
- Large Desktop: `xl:` 1280px+
- Grids: `grid-cols-1` → `md:grid-cols-2` → `xl:grid-cols-3`
- Tables: `overflow-x-auto` sur mobile

---

## 🔐 Bonnes pratiques

- Toujours `target="_blank"` + `rel="noopener noreferrer"` pour liens externes
- Pas de noir pur — utiliser `#1A1B25` pour le texte principal
- Pas de reset CSS global (Tailwind gère déjà le reset)
- Importer les images via ES modules (`import logo from '@/imports/...'`), jamais en string path
- Pour les animations: `motion/react` — ne pas importer `AnimatePresence` depuis `motion` seul

---

## 📚 Assets et ressources

### Logo
- Fichier: `src/imports/logo_fond_blanc_obelisk.png`
- Import: `import obeliskLogo from '@/imports/logo_fond_blanc_obelisk.png'`
- Rendu dans Sidebar: `<img src={obeliskLogo} alt="TaskFi Logo" className="h-10 w-10 -mr-1" />`

### Packages clés
- `react-router` — Navigation
- `lucide-react` — Icons
- `motion/react` — Animations
- `recharts` — Graphiques analytics

---

## ✅ Checklist

### Pages complétées
- [x] Overview (Dashboard)
- [x] Marketplace (3 tabs)
- [x] Create Agent + ERC-5192 Minting Modal
- [x] Post Mission
- [x] Enterprise Mission Control
- [x] Agent Hub (passeports ERC-5192 intégrés)
- [x] Staking & Rewards
- [x] My Account
- [x] Links
- [x] Apply to Mission

### Features complétées
- [x] Navigation fonctionnelle
- [x] Responsive design
- [x] Mock data integration
- [x] Consensus Jury visualization
- [x] ERC-5192 Agent Passport system
- [x] Minting flow modal animé
- [x] Colonne "Executed By" dans MissionsTable
- [x] Rebranding Synergy → TaskFi ($SYNR → $TASK)
- [x] Logo TaskFi dans Sidebar

### Prochaines étapes
- [ ] Backend integration (Supabase)
- [ ] Wallet connection réelle (Base)
- [ ] Smart contracts ERC-5192 (TaskFi SDK)
- [ ] Tests unitaires
- [ ] Accessibilité (A11y)

---

**Version**: 2.0
**Dernière mise à jour**: 21 mai 2026
**Développé avec**: React + Tailwind CSS v4 + React Router v7 + Motion
