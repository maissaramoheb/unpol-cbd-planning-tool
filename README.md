# UNPOL Capacity-Building & Development (CBD) Integrated Planning Tool (Prototype)

An unofficial educational and decision-support framework designed to assist UNPOL Advisory Teams, Security Sector Reform (SSR) specialists, and peace operations planning officers in diagnosing host-state policing environments, mapping stakeholders, and structuring strategic capacity-building interventions.

## 🌐 Live Demo & Deployment
This application operates strictly **client-side** in your web browser. No planning data is transmitted to external servers.
- **Local Deployment**: Follow the [Getting Started](#-getting-started) instructions to run the application on an offline or secure workstation.
- *(Note: If this project is hosted on a public platform such as Vercel, the live URL will be accessible via your deployment configurations.)*

---

## ⚠️ Disclaimer

This is an unofficial educational and planning-support prototype. It is not official United Nations doctrine, does not represent the United Nations, and does not replace mission mandates, official guidance, host-state law, human rights due diligence, command approval, or verified country analysis.

---

## 💡 Why This Project Matters
In peace operations and post-conflict transition contexts, policing capacity-building is complex, politically sensitive, and highly context-dependent. Planners often struggle to translate high-level mandates into structured, sequenced advisory activities while accounting for local environmental constraints (PESTEL-S) and diverse actor motivations.

This tool bridges that gap by providing a structured, interactive playground to:
- Methodically diagnose environmental drivers and constraints.
- Categorize and visualize stakeholder influence and reform postures.
- Map advisory interventions across the five core areas of police capacity development.
- Prioritize and sequence activities using objective multi-criteria scoring, rather than ad-hoc decision-making.

---

## 🚀 Core Features

1. **Context-Adaptable Mission Profiles**: Select from preloaded baseline templates (UN Peacekeeping, Special Political Mission, Post-Conflict SSR, Police Reform Advisory, Capacity Building & Training, Rule of Law/Justice-Chain) or start with a blank canvas.
2. **PESTEL-S Environmental Diagnosis**: Conduct a systematic assessment of Political, Economic, Social, Technological, Environmental, Legal, and Security factors shaping host-state policing.
3. **Actor Assessment & Stakeholder Mapping**: Define and analyze enablers, blockers, spoilers, and neutral actors, mapping their reform posture, influence levels, and key UNPOL entry points.
4. **Decision-Support Quadrants**: Graphically analyze stakeholders based on operational influence and engagement priorities to identify risk caveats.
5. **Interactive 5×6 CBD Planning Matrix**: Intersect 5 Key Reform Areas (e.g., Administration, Operations, Oversight) with 6 Capacity Dimensions (e.g., Skills, Systems, Infrastructure) to organize inputs.
6. **Prioritization & Sequencing Engine**: Order activities into Quick Wins, Mid-Term, and Long-Term priorities using automated multi-criteria sequencing.
7. **Quality-Control Warnings**: Real-time validation alerts highlighting incomplete sections, unsequenced tasks, or missing stakeholder attributes.
8. **Exportable Briefs & Backups**: Preview PDF-ready briefs, copy structured Markdown reports, or export the entire planning workspace as a JSON file.

---

## 👥 Intended Users
This prototype is tailored for public-sector planning and policing practitioners:
- **United Nations Police (UNPOL)** Advisors & Planning Officers
- **Security Sector Reform (SSR)** Officers and Policy Advisors
- **Rule of Law (RoL)** practitioners within Peacekeeping and Special Political Missions
- **Academic researchers and trainers** in international peace operations and police reform

---

## 📋 Use Cases
- **Pre-deployment Briefings**: Prepare incoming advisory teams with simulated mission profiles.
- **Strategic Planning Workshops**: Facilitate joint PESTEL-S and stakeholder mapping exercises during planning sessions.
- **Mission Transition Assessment**: Structure capacity sequencing paths during mandate transition and drawdown phases.
- **Training and Education**: Demonstrate the intersection of capacity development areas and dimensions in peacekeeping academies.

---

## ⚖️ Responsible Use Note
This planning tool is an unofficial prototype designed to assist human planning processes; it does not generate automated strategic decisions. Users are solely responsible for ensuring that all planned activities:
- Respect international human rights standards and the UN Human Rights Due Diligence Policy (HRDDP).
- Conform to the host state's legal framework and local ownership principles.
- Are verified using official, up-to-date mandate documentation.
- Do not store classified, restricted, or sensitive operational intelligence in unencrypted or public browser environments.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 16.2 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4.0
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Data Storage**: Client-side `localStorage` (100% offline-compatible)

---

## 💻 Getting Started

### Prerequisites
- Node.js (version 18.x or later)
- npm (version 9.x or later)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/maissaramoheb/unpol-cbd-planning-tool.git
   cd unpol-cbd-planning-tool
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the local development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Available Scripts
In the project directory, you can run the following npm scripts:

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Compiles the application for production deployment, verifying TypeScript types.
- `npm run start`: Starts the production build server.
- `npm run lint`: Checks for linting errors and code formatting compliance.

---

## 📊 Project Status
- **Current Version**: v0.3.2
- **Phase**: Early-stage prototype (Active development). Feedback from peace operations and policing practitioners is welcome.

---

## 🗺️ Roadmap Summary
Our near-term focus items include:
- Preloaded country-based PESTEL-S environment templates.
- Enhanced PDF cover-sheet rendering and custom styling options.
- Sample mission scenario JSON profiles.
- Private, client-side local LLM integration for review drafting.
- Encryption layer for IndexedDB workspace backups.

For more details, see the complete [ROADMAP.md](ROADMAP.md).

---

## 🤝 Contributing
Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) guide to learn about our development process, code styles, and contribution submission guidelines.

---

## 🔒 Security
For information regarding security architecture, local data storage boundaries, or reporting vulnerability guidelines, please refer to [SECURITY.md](SECURITY.md).

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
