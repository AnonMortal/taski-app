# TaskFi Dashboard — Plan de test manuel

Guide pas à pas pour vérifier que chaque use case fonctionne après le rebuild
Cloudflare Pages. Tout est faisable depuis un navigateur, sans outil externe.

---

## 0. Préalables

### 0.1 — Front
URL prod : `https://app.taskfi.xyz` (ou `https://taski-app.pages.dev`).

Vérifie que le rebuild Cloudflare Pages utilise un `VITE_API_URL` qui **résout
en DNS et répond `200` sur `/health`**. Test rapide :

```bash
curl -s -o /dev/null -w "%{http_code}\n" "$VITE_API_URL/health"
# attendu : 200
```

Si la valeur est `api.taskfi.xyz`, vérifie qu'elle est routée vers le tunnel
Cloudflare actif (`pm2 logs taskfi-tunnel --lines 5 --nostream` sur le serveur
prod imprime l'URL `*.trycloudflare.com`).

Variables à configurer dans Cloudflare Pages → Settings → Environment variables :

| Variable | Exemple | Note |
|---|---|---|
| `VITE_API_URL` | `https://api.taskfi.xyz` | Backend Fastify |
| `VITE_CHAIN_ID` | `84532` (sepolia) ou `8453` (mainnet) | Chain id actif |
| `VITE_RPC_URL_BASE_MAINNET` | endpoint QuickNode mainnet | URL inlinée dans le bundle. Allowlist conseillée (referrer + methods read-only) pour éviter le pillage de quota — pas obligatoire. |
| `VITE_RPC_URL_BASE_SEPOLIA` | endpoint QuickNode sepolia | Idem |

Les adresses de contrats ($TASK, USDC, passport, etc.) **ne sont pas** dans
les env vars du front. Elles sont servies par le backend via
`GET /api/public/config` et lues au boot. Pour changer une adresse :
édite `backend/.env`, `pm2 restart taskfi-backend`, reload le front — pas de
rebuild Cloudflare.

> ⚠️ Les `VITE_*` sont **inlinées dans le bundle JS public** — pas des secrets.
> QuickNode autorise par défaut tous les referrers et toutes les méthodes :
> sans restriction côté QuickNode, n'importe qui peut copier l'URL depuis
> DevTools et consommer ton quota. Active au minimum un referrer allowlist
> (`app.taskfi.xyz` + preview domains) si tu veux que le quota soit protégé.

### 0.2 — Backend
SSH `root@144.172.94.20`, puis `pm2 list` doit afficher 4 process **online** :

```
taskfi-anvil    (fork Base mainnet, :8545)
taskfi-backend  (Fastify, :3001)
taskfi-agents   (50 agents IA, poll 30 s)
taskfi-tunnel   (Cloudflare quick tunnel)
```

`LLM_PROVIDER=stub` côté backend ET agents → pas de coût Anthropic, réponses
déterministes mais pipeline complet exercé.

### 0.3 — Wallet de test
Tu as deux options pour t'authentifier :

| Option | Quand | Comment |
|---|---|---|
| **Créer un wallet** | Tester en tant que client (poster une mission) | « Create New Wallet », noter la seed, choisir un mot de passe. Le wallet est vide → pas d'USDC pour payer une bounty (ok si le contrat de test mock l'escrow). |
| **Importer une clé d'agent funded** | Tester en tant qu'agent (postuler à une mission) | « Import Existing Wallet » → « Private Key ». Récupère une clé depuis `/opt/obelisk/wallets-50.env` sur le serveur (ex. `AGENT_01_PRIVATE_KEY`). Chaque agent a 1000 ETH + 25M $TASK sur le fork. |

> 💡 Le wallet auto-lock après 15 min d'inactivité. Tu devras retaper le mot de
> passe (pas la seed).

---

## 1. Auth / Wallet (WalletSetup)

**Goal** — créer ou importer un wallet, signer un SIWE, obtenir un JWT backend.

**Steps**
1. Ouvre `https://app.taskfi.xyz/`.
2. Première visite → écran « TaskFi · Embedded Wallet » avec deux cartes.
3. Choisis « Create New Wallet » ou « Import Existing Wallet ».
4. Définis un mot de passe (≥ 8 caractères).
5. Si création : note la seed de 12 mots, coche « I have saved my recovery
   phrase », clique « Enter Dashboard ».
6. L'app déclenche un SIWE en arrière-plan (`POST /api/auth/nonce` puis
   `/api/auth/verify`).

**Expected**
- Redirection vers `/` (Overview) avec sidebar visible.
- Header en haut à droite : badge `@Base 0xXXXX…YYYY` (ton adresse).
- DevTools → Network : `POST /api/auth/nonce` `200`, `POST /api/auth/verify`
  `200` retourne `{ token, user }`.
- DevTools → Application → Session Storage : clé `taskfi_auth_token` présente.

**Failure signals**
- Spinner SIWE infini → backend injoignable. Recheck `VITE_API_URL` et CORS
  (`CORS_ALLOWED_ORIGINS` doit lister `https://app.taskfi.xyz` dans
  `/opt/obelisk/backend/.env`).
- `crypto.subtle is undefined` → la page n'est pas en HTTPS (secure context
  requis pour la Web Crypto API).

---

## 2. Overview (`/`)

**Goal** — vérifier le tableau de bord global et les métriques live.

**Steps**
1. Depuis n'importe quelle page, clique « Overview » dans la sidebar.

**Expected**
- Titre « Overview · Welcome back! Here's your protocol overview ».
- Table « Your Posted Missions » avec 5 colonnes : Mission Name / Reward (USDC)
  / Status / Executed By / Jury Consensus.
- 3 cards :
  - **Total Earned** — USDC + $TASK earned, chiffres réels.
  - **Total Staked** — montant + % of supply staked.
  - **🔥 Tokens Burned** — montant + % of supply burned + protocol revenue.
- Badge « Active Agents · Live » en haut, compteur > 0 (50 agents poll).

**Failure signals**
- « Unable to load missions right now. » → API down ou JWT expiré.
- Toutes les métriques à 0 → soit base vide (ok au tout premier run), soit
  `/api/public/stats` plante (check console).

---

## 3. Marketplace (`/marketplace`)

**Goal** — parcourir missions ouvertes, agents disponibles, historique.

**Steps**
1. Onglet **Active Missions** par défaut.
2. Onglet **Available Agents**.
3. Onglet **Mission History**.

**Expected**
- **Active Missions** : cartes avec titre, bounty USDC, deadline,
  poster (Individual/Enterprise), skills. Tri : `open` d'abord puis
  `in-progress`, par date desc. Clic « Apply Now » → `/apply-mission/<id>`.
- **Available Agents** : grille d'agents du leaderboard backend
  (`/api/agents/leaderboard`, top 20). Chaque carte : nom, spécialité,
  reputation, success rate, staked $TASK.
- **Mission History** : missions `status=completed` triées par date desc.
  Si aucune n'est settlée → empty state « No completed missions yet ».

**Failure signals**
- Empty state « Unable to load missions right now. » dans Active Missions →
  `/api/missions` plante. Check logs backend.
- Tab History affiche les anciens noms fake (`CodeMaster Pro`, `DataCruncher`,
  `WriteGenius`) → le déploiement Cloudflare n'a **pas** pické le commit
  `2fb6e9c`. Force un rebuild.

---

## 4. Post a Mission (`/post-mission`)

**Goal** — poster une mission depuis le wallet courant, l'argent passe en
escrow, la mission apparaît dans Marketplace.

**Steps**
1. Sidebar → « Post a Mission ».
2. Section « Who's posting this mission? » → choisis Individual ou Enterprise.
   Si Enterprise, saisir Company Name.
3. Mission Title (≥ 5 caractères).
4. Detailed Description (≥ 50 caractères pour passer la validation backend).
5. Mission Category (dropdown).
6. Total Bounty Amount (USDC) — min 50, défaut 1000.
7. Vérifie que le split affiche `Agent 70% / Burn 10% / LP 10% / Jury 10%`.
8. Clique **Lock Bounty & Post Mission**.

**Expected**
- `POST /api/missions` (multipart) → `200 { mission: { id, ... } }`.
- Toast de succès, redirection (vers Enterprise dashboard ou Overview).
- La mission apparaît dans `/marketplace` onglet Active Missions, statut `open`.
- Les 50 agents (`taskfi-agents`) la voient au prochain poll (30 s max).
- Le pipeline complet enchaîne tout seul : `accept` → `submit` → scoring jury
  (5 juges stub) → settlement. Délai total ~ 2 à 5 min.

**Failure signals**
- 401 sur `POST /api/missions` → wallet locked / JWT expiré, re-déverrouille.
- 403 « Not authorized » → le user n'a pas le rôle `CLIENT` côté backend.
  L'inscription est automatique à la 1ʳᵉ création de mission ; si ça ne marche
  pas, check `/api/auth/verify` response.

---

## 5. Create Agent (`/create-agent`)

**Goal** — minter un passeport ERC-5192 Soulbound pour le wallet connecté.

**Steps**
1. Sidebar → « Create Agent ».
2. **Agent Name** (≥ 3 caractères).
3. **Bio & Description**.
4. **Specialty Tags** — clique jusqu'à 5 catégories. La 1ʳᵉ devient
   `primarySkill` du passeport.
5. **Connection Endpoint** — URL webhook (peut être `https://example.com/agent`
   pour un test ; l'endpoint n'est appelé qu'en mode `LLM_PROVIDER=claude` par
   le runner, en stub ce n'est pas utilisé).
6. **Boost Visibility** (optionnel) — slider 0 à 100K $TASK.
7. Clique **Deploy on @Base & Mint On-chain Passport**.

**Expected**
- Modal « Minting ERC-5192 Agent Passport… » avec 2 anneaux animés (~ 3 s).
- 3 étapes séquentielles : Initializing SDK → Anchoring identity → Locking
  passport.
- Étape 2 « Passport Reveal » :
  - Carte sombre `#1A1B25` avec barre holographique violet/peach.
  - Token ID (hash déterministe du nom).
  - Badge **Locked · Soulbound** peach.
  - Grille : Trust Score 100/100 · Missions 0 · Slashes 0 · Primary Skill.
  - CTA « Go to Agent Hub » + « View on BaseScan ».
- Côté backend : `POST /api/auth/register-agent` enregistre le rôle ; le
  passeport est minté on-chain via `AgentPassport.mintPassport` par l'oracle.

**Failure signals**
- Modal bloqué après 3 s → check `/api/agents/<addr>/passport` retourne
  `{ hasPassport: true }`. Si non, le mint a raté (souvent
  `AGENT_PASSPORT_ADDRESS` absent du `.env` backend, ou nonce oracle bloqué).
- Erreur réseau au clic → JWT expiré, re-déverrouille le wallet.

---

## 6. Agent Hub (`/agent-center`)

**Goal** — voir le passeport de l'agent connecté + ses stats live.

**Steps**
1. Sidebar → « Agent Hub ».

**Expected** — deux cas :

| Cas | Affichage |
|---|---|
| Wallet sans passeport | Empty state « No passport minted yet » + CTA `Create Agent`. |
| Wallet avec passeport | 1 carte agent : strip ERC-5192 #XXXX + Soulbound. Trust Score (barre + score/100). Primary category. 4 tuiles : Pending USDC, In-flight, Completed, Success%. Liste des Categories. Endpoint mono. Boutons : « Find Missions » → `/marketplace`, « BaseScan » → lien externe. Si pending > 0, bannière verte « X USDC pending — claim from Staking & Rewards ». |

**Failure signals**
- Spinner infini → `/api/agents/<addr>/passport` ne répond pas. Check tunnel
  + contracts.
- Si tu vois encore « CodeMaster Pro / DataWizard AI / ContentGenius » → vieux
  bundle servi, force un cache-clear Cloudflare.

---

## 7. Apply to Mission (`/apply-mission/:id`)

**Goal** — postuler à une mission au nom d'un agent.

**Steps**
1. Depuis `/marketplace`, clique sur une mission `open` → ouvre
   `/apply-mission/<id>`.
2. Sélectionne l'agent dans le dropdown.
3. Le match score se calcule automatiquement (vert ≥ 80 / ambre ≥ 60 / rouge
   sinon).
4. Vérifie le budget breakdown 70/10/10/10.
5. Clique « Apply ».

**Expected**
- `POST /api/missions/<id>/accept` → `200`.
- Animation success, retour Marketplace.
- La mission passe en `in-progress` dans la table.

**Failure signals**
- 409 « Mission already accepted » → un autre agent a été plus rapide (les 50
  agents tournent en boucle). Pose une nouvelle mission pour retester.

---

## 8. Enterprise Mission Control (`/enterprise`)

**Goal** — vue analytics côté client.

**Steps**
1. Sidebar → « Mission Control ».

**Expected**
- 3 cards top : Performance metrics (Total spent, Active missions, Completed).
- Graph « Performance Analytics » (`/api/enterprise/analytics`).
- Liste « Top Performing Agents » (`/api/enterprise/top-agents`).
- Liste « Your Posted Missions » avec actions Bump / Cancel par mission.

**Failure signals**
- « No agent performance data yet. » + « No missions posted yet. » → normal si
  aucune mission posée par ce wallet. Va sur `/post-mission` et reviens.

---

## 9. Staking & Rewards (`/staking`)

**Goal** — gérer le staking $TASK et claim les rewards.

**Steps**
1. Sidebar → « Staking & Rewards ».
2. Section Portfolio Overview : total staked, total rewards earned.
3. Section Agent Staking Management : slider par agent pour ajuster le stake
   et booster le Priority Score / Reputation Multiplier.
4. Section Rewards History : table des payouts USDC + $TASK avec split
   70/10/10/10.

**Expected**
- Chiffres à 0 si le wallet n'a jamais staké/touché de reward.
- Après quelques missions complétées par ton agent, la pending USDC doit
  apparaître ici aussi. Clique « Claim » → `POST /api/agents/claim`.

**Failure signals**
- « Insufficient staking tier » au claim → l'agent doit staker ≥ Tier 1
  d'abord (montant défini dans `StakingRegistry` on-chain).

---

## 10. My Account (`/account`)

**Goal** — profil utilisateur, préférences, sécurité du wallet.

**Steps**
1. Sidebar → « My Account ».
2. **Profile Information** — remplis Display Name, Email, Bio. Clique « Save
   Changes ». La page persiste dans `localStorage` (clé
   `taskfi.profile.<addr>` en lowercase).
3. **Wallet & Blockchain** — affiche l'adresse connectée + trois balances :
   USDC on-chain, $TASK on-chain (lus via QuickNode si `VITE_RPC_URL_BASE_*`
   est configuré), Pending USDC depuis `/api/agents/pending-earnings`. Si le
   RPC n'est pas configuré, les deux premières affichent « — » avec le label
   « RPC not configured ».
4. **Notification Preferences** — toggles persistés en local.
5. **Security** — clique « Lock Wallet ». L'app retourne à l'écran « Welcome
   Back · password » sans purger le vault.

**Expected**
- Display Name / Email / Bio vides au 1ᵉʳ chargement (pas de mock
  « CryptoBuilder » / « builder@taskfi.ai »).
- Pending Earnings affiche `—` si l'API ne répond pas, ou `$XX.XX` si oui.
- Lock Wallet ramène à l'écran d'unlock.

**Failure signals**
- Si tu vois encore « CryptoBuilder » ou « builder@taskfi.ai » comme
  defaultValue → vieux bundle, force rebuild.

---

## 11. Links (`/links`)

**Goal** — hub de liens externes (BaseScan, docs, twitter, etc.).

**Steps** — visite, clique chaque lien, vérifie qu'il ouvre dans un nouvel
onglet vers une URL non-cassée.

---

## Scénario end-to-end (5 min)

Pour un smoke test rapide qui couvre tout le pipeline :

1. **Wallet 1 (client)** — créer un wallet vide, déverrouiller.
2. `/post-mission` — poster une mission bounty 100 USDC, catégorie
   `Code Generation`.
3. Attendre 30–60 s : un des 50 agents (`taskfi-agents`) accepte la mission.
4. `/marketplace` : la mission passe `open` → `in-progress`.
5. ~2 min plus tard : `submit` puis scoring jury (5 juges stub) → mission
   passe `completed`.
6. `/marketplace` onglet History → la mission y apparaît avec date.
7. `/` Overview → métriques `Total Earned` augmentent ; table Mission affiche
   la mission settlée.
8. **Wallet 2 (agent funded)** — re-importer une clé `AGENT_XX_PRIVATE_KEY`.
9. `/agent-center` → carte avec passeport ERC-5192, trust score, missions
   completed > 0, pending USDC > 0.
10. `/staking` → claim les rewards.

Si chacune de ces étapes passe sans erreur console rouge, l'app est saine.

---

> ⚠️ `taskfi-anvil` est **en mémoire**. Si tu le redémarres, contrats et
> soldes sont perdus → il faut redéployer via le script
> `/opt/obelisk/contrat/script/DeployForkTest.s.sol` puis mettre à jour les
> adresses dans `backend/.env` et refunder les 50 wallets. La DB Postgres,
> elle, survit.
