# Unofficial UNPOL CBD Integrated Planning Prototype

v0.3.1 — UI/UX Polish & Stakeholder Decision-Support Upgrade

The **Unofficial UNPOL Capacity-Building & Development (CBD) Integrated Planning Prototype** is an educational and planning-support framework designed to help UNPOL Advisory Teams, Security Sector Reform (SSR) specialists, and peace operations planning officers diagnose host-state environmental challenges, map critical stakeholders, configure targeted police capacity-building actions, and construct strategic sequencing pathways.

---

## ⚠️ Important Disclaimer & Rules of Use

> [!IMPORTANT]
> **Advisory Disclaimer**
> This tool is an educational and planning-support prototype. It is not official United Nations doctrine and does not replace mission mandate, official guidance, host-state law, human rights due diligence, command approval, or verified country analysis. Users should verify all context-specific findings through official and current sources before operational or policy use.

**Data Privacy & Classification Warning:**
This application runs entirely client-side in the browser. No data is transmitted to external servers. Custom planning data is stored locally in the browser's storage. Do not input sensitive, classified, or restricted host-state security or mission details into public web deployments of this tool.

---

## 🚀 Key Features

1. **Context-Adaptable Mission Profiles**: Select from 6 preloaded baseline templates (UN Peacekeeping, Special Political Mission, Post-Conflict SSR, Police Reform Advisory, Capacity Building & Training, Rule of Law/Justice-Chain) or choose a clean **Start Blank** slate.
2. **PESTEL-S Environmental Diagnosis**: Systematic analysis of 7 categories (Political, Economic, Social, Technological, Environmental, Legal, Security) shaping host-state policing constraints.
3. **Actor Assessment & Stakeholder Mapping**: Categorize and analyze enablers, blockers, spoilers, and neutral actors. Define their real influence, reform posture, and UNPOL entry points.
4. **Stakeholder Decision-Support Quadrants**: Review accessible engagement and operational-credibility matrices with shared classifications, engagement recommendations, risk caveats, and export summaries.
5. **Interactive 5×6 CBD Matrix**: Intersect 5 Key Reform Areas with 6 Capacity Dimensions to structure specific advisory inputs (Individual, Organizational, and Enabling Environment levels) along with monitoring indicators and risks.
6. **Strategic Prioritization & Sequencing**: Compile Quick Wins, politically sensitive reforms, and long-term sequencing paths. Interventions are automatically prioritized using a multi-criteria scoring algorithm.
7. **Production-Ready Reporting & Backups**:
   - Preview and print a PDF-ready cover-sheet brief.
   - Copy a clean Markdown format report.
   - Save or upload the entire workspace configuration as a local JSON file.

---

## 🛠️ Technology Stack

- **Core**: Next.js (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Persistence**: Browser `localStorage` (client-side only)

---

## 💻 Local Development

Follow these steps to run the application locally:

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

### 3. Build for Production
To verify typescript safety and build a production-ready bundle:
```bash
npm run build
```

### 4. Run Linter
To verify code style and quality compliance:
```bash
npm run lint
```

---

## 🌐 Deployment to Vercel

The project is optimized for deployment on the [Vercel Platform](https://vercel.com).

1. Push your local repository to a remote GitHub, GitLab, or Bitbucket repository.
2. Import the project in Vercel.
3. Vercel will automatically detect Next.js and apply the correct build settings.
4. Click **Deploy**.

---

## 🗺️ Future Roadmap

- **Offline-First Storage**: Migrate local storage to IndexedDB to support larger project portfolios offline.
- **UNPOL Doctrine Integration**: Preload reference standards from DPKO/DFS guidelines on Police Capacity-Building and Development.
- **Collaborative Sharing**: Implement secure, client-side encrypted sharing links to facilitate collaborative drafting.
- **Offline AI Assistant**: Integrate secure WebGPU-based local LLM assistance for context-drafting without network requests.

---

## ✍️ Author Credit

Developed by **Lt.Col Maissara Selim** as an educational tool to visualize policing capacity-building sequencing.
