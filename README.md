# 👑 SujaLuxe - Luxury Interior Marketplace

A sophisticated dual-portal e-commerce platform connecting luxury interior retailers with discerning customers. Features AI-powered room visualization, real-time auctions, negotiation tools, and a premium shopping experience.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

## ✨ Features

### For Customers
- 🏠 **AI Room Designer** - Visualize products in AI-generated luxury room designs
- 🛍️ **Product Browsing** - Explore curated luxury interior items
- 🛒 **Shopping Cart & Wishlist** - Save and purchase favorite items
- 💬 **Negotiations** - Request custom pricing on products
- ⚖️ **Live Auctions** - Bid on exclusive items in real-time
- ⭐ **Reviews & Ratings** - Share experiences and read feedback
- 📦 **Order Tracking** - Monitor purchase status
- 🎯 **Campaigns** - Participate in exclusive promotions

### For Retailers
- 📦 **Product Management** - Add, edit, and organize inventory
- 📊 **Analytics Dashboard** - Track sales, revenue, and trends
- 📋 **Order Management** - Process and fulfill customer orders
- 🔨 **Auction Control** - Create and manage live auctions
- 💼 **Negotiation Tools** - Handle custom pricing requests
- ⭐ **Review Management** - Monitor and respond to feedback
- 📢 **Campaign Creation** - Launch promotional campaigns
- 👤 **Profile Settings** - Manage business information

## 🚀 Quick Start (Replit)

This project is designed to run seamlessly on Replit:

1. **Open in Replit** - Already set up!
2. **Login Credentials**:
   - **Customer**: `priya.malhotra@example.com` / `customer123`
   - **Retailer**: `contact@luxeinteriors.com` / `retailer123`
3. **Try AI Room Designer**: Select products → Generate AI room visualization
4. **Explore**: Browse products, place orders, start negotiations

The AI Room Designer uses **Replit AI Integrations** - no OpenAI API key needed!

## 💻 Download & Run Locally

Want to run SujaLuxe on your local machine?

### 📥 Download Instructions
See **[DOWNLOAD.md](./DOWNLOAD.md)** for:
- How to download the project from Replit
- What files are included
- Environment differences (Replit vs Local)

### ⚙️ Local Setup Guide
See **[LOCAL_SETUP.md](./LOCAL_SETUP.md)** for complete instructions:
- Prerequisites (Node.js, PostgreSQL, Git)
- Environment variables configuration
- Database setup
- Running the application locally
- Troubleshooting guide

**Quick Summary:**
```bash
# 1. Download the project and extract
# 2. Install dependencies
npm install

# 3. Create .env file (see .env.example)
cp .env.example .env
# Edit .env with your database URL and OpenAI API key

# 4. Set up database
npm run db:push

# 5. Start the application
npm run dev
```

Visit http://localhost:5000

## 🏗️ Technology Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful component library
- **TanStack Query** - Server state management
- **Wouter** - Lightweight routing

### Backend
- **Express.js** - Web application framework
- **Node.js** - JavaScript runtime
- **TypeScript** - Type safety
- **WebSockets** - Real-time communication
- **JWT** - Secure authentication
- **Drizzle ORM** - Type-safe database queries

### Database & AI
- **PostgreSQL** - Relational database
- **Neon Database** - Serverless Postgres (Replit)
- **OpenAI API** - AI room design generation
- **Replit AI Integrations** - Automatic AI setup (Replit only)

## 📁 Project Structure

```
sujaluxe/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   │   ├── customer/    # Customer portal pages
│   │   │   └── retailer/    # Retailer portal pages
│   │   └── lib/         # Utilities and configurations
├── server/              # Express backend
│   ├── routes.ts        # API endpoints
│   ├── storage.ts       # Database layer
│   ├── auth.ts          # Authentication logic
│   └── jwt.ts           # JWT utilities
├── shared/
│   └── schema.ts        # Shared database schema
└── package.json         # Dependencies
```

## 🎨 Design System

- **Brand Color**: Purple (Hue 262) - Royal luxury aesthetic
- **Typography**: 
  - Headings: Playfair Display (elegant serif)
  - Body: Inter (clean sans-serif)
- **Theme**: Dark/Light mode support
- **Components**: Custom shadcn/ui components with luxury styling

## 🔑 Environment Variables

### Required for Local Development
```env
DATABASE_URL=postgresql://user:password@localhost:5432/sujaluxe
SESSION_SECRET=your-random-secret-string
OPENAI_API_KEY=sk-your-openai-api-key
NODE_ENV=development
```

### Automatic in Replit
```env
AI_INTEGRATIONS_OPENAI_BASE_URL  (Replit AI)
AI_INTEGRATIONS_OPENAI_API_KEY   (Replit AI)
DATABASE_URL                      (Neon Database)
```

## 📜 Available Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## 🧪 Testing

The application includes end-to-end testing for:
- User authentication (JWT-based)
- Product browsing and filtering
- Shopping cart operations
- AI Room Designer functionality
- Real-time auction bidding
- Negotiation workflows

## 📊 Key Features Deep Dive

### AI Room Designer
- Select multiple products from catalog
- Choose room type, style, and theme
- Generate photorealistic AI room visualizations
- Preview products in luxury interior settings
- Download generated designs
- **Replit**: Uses Replit AI Integrations (automatic)
- **Local**: Uses OpenAI DALL-E 3 (requires API key)

### Real-Time Auctions
- WebSocket-based live bidding
- Auto-updates for all participants
- Countdown timers
- Bid history tracking
- Winner notifications

### Negotiation System
- Customers request custom pricing
- Retailers approve/reject/counter-offer
- Message thread for communication
- Status tracking (pending, accepted, rejected)
- Real-time notifications

## 🔒 Security

- JWT-based authentication
- Bcrypt password hashing
- Secure session management
- Protected API endpoints
- Input validation with Zod
- SQL injection prevention (Drizzle ORM)

## 🌐 Deployment

### Deploy on Replit (Recommended)
1. The application is already running on Replit
2. Click **"Publish"** in Replit to make it public
3. Get a `.replit.app` domain automatically

### Deploy Elsewhere
1. Build the project: `npm run build`
2. Set environment variables
3. Run: `npm start`
4. Ensure PostgreSQL database is accessible
5. Configure domain and SSL

## 📝 License

This project is part of the SujaLuxe luxury interior marketplace platform.

## 🤝 Contributing

This is a proprietary project. For questions or support, please contact the development team.

## 📞 Support

- **Documentation**: See `LOCAL_SETUP.md` for detailed setup
- **Downloads**: See `DOWNLOAD.md` for download instructions
- **Environment Setup**: Check `.env.example` for configuration

## 🎯 Roadmap

- [ ] Mobile application (React Native)
- [ ] Advanced AR visualization
- [ ] Multi-currency support
- [ ] International shipping
- [ ] Advanced analytics dashboard
- [ ] Social media integration
- [ ] Influencer partnerships

---

**Built with ❤️ for luxury interior enthusiasts**

*Bringing AI-powered visualization to premium interior shopping*
