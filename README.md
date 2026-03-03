# ⚡ HyperPay Analytics — Payment Intelligence Dashboard

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?style=for-the-badge&logo=vite)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript)
![Deployed](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel)

## 🔗 Live Demo
**👉 [View Live Project](https://ecommerce-catalog-alpha.vercel.app/)**

---

## 📌 About The Project

HyperPay Analytics is a production-grade Payment Intelligence Dashboard built with React.js, inspired by Juspay's HyperCheckout payment infrastructure. This project simulates a real-world payment monitoring platform where businesses can track transactions, analyze payment trends, and monitor key performance indicators in real time.

The dashboard handles 40+ mock transactions across multiple payment methods including UPI, Card, NetBanking, Wallet, and BNPL — giving a complete picture of payment health at a glance.

---

## ✨ Features

- 📊 **Overview Tab** — KPI cards with live sparklines, weekly bar chart, payment method donut chart, and recent transactions
- 💳 **Transactions Tab** — Searchable, filterable table by status and payment method with pagination
- 📈 **Analytics Tab** — Hourly volume chart, status distribution bars, merchant leaderboard, and performance KPIs
- ⚡ **Live Success Rate** — Updates every 2 seconds with a glowing pulse animation
- 🎨 **Custom SVG Charts** — Bar chart, donut chart, and sparklines built from scratch without any chart library

---

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| React.js 18 | UI Framework |
| Vite | Build Tool & Dev Server |
| JavaScript ES6+ | Core Logic |
| SVG | Custom Charts |
| CSS-in-JS | Inline Styling System |
| Vercel | Deployment |

---

## ⚙️ React Hooks Used

| Hook | Purpose |
|---|---|
| `useState` | Managing tabs, filters, search, pagination |
| `useEffect` | Live success rate timer with cleanup |
| `useMemo` | Optimized filtering, pagination, stats calculation |

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/Poornachandra-creater/payment-dashboard.git

# Navigate into the project
cd payment-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📁 Project Structure

```
payment-dashboard/
├── src/
│   ├── App.jsx        ← Main dashboard component
│   ├── App.css        ← Styles
│   └── index.css      ← Global styles
├── index.html         ← Entry point
├── package.json       ← Dependencies
└── vite.config.js     ← Vite config
```

---

## 🎯 Key Learnings

- Deep understanding of React Hooks and component architecture
- Performance optimization using `useMemo` for expensive calculations
- Building custom data visualizations using raw SVG math
- Multi-parameter filtering and pagination logic
- Real-world project structure inspired by fintech products

---

## 👨‍💻 Author

**Poorna Chandra**
- GitHub: [@Poornachandra-creater](https://github.com/Poornachandra-creater)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
