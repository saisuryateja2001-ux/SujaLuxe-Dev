# SujaLuxe - Local Setup Guide

Complete instructions for downloading and running SujaLuxe on your local machine.

## Prerequisites

Before starting, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/downloads)
- **npm** (comes with Node.js)

## Step 1: Download the Project

### Option A: Using Git (Recommended)
```bash
git clone <your-repository-url>
cd sujaluxe
```

### Option B: Download ZIP
1. Click the "Download" button in Replit
2. Extract the ZIP file
3. Open terminal in the extracted folder

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Set Up PostgreSQL Database

### Create a New Database

**On macOS/Linux:**
```bash
createdb sujaluxe
```

**On Windows (using psql):**
```bash
psql -U postgres
CREATE DATABASE sujaluxe;
\q
```

### Get Your Database Connection URL

Your `DATABASE_URL` will look like this:
```
postgresql://username:password@localhost:5432/sujaluxe
```

- Replace `username` with your PostgreSQL username (default: `postgres`)
- Replace `password` with your PostgreSQL password
- `localhost:5432` is the default PostgreSQL host and port
- `sujaluxe` is your database name

**Example:**
```
postgresql://postgres:mypassword@localhost:5432/sujaluxe
```

## Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/sujaluxe

# Session Secret (generate a random string)
SESSION_SECRET=your-random-secret-string-here

# Node Environment
NODE_ENV=development

# OpenAI API Key (for AI Room Designer)
# Get your API key from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### Important Notes:

1. **DATABASE_URL**: Use your actual PostgreSQL credentials
2. **SESSION_SECRET**: Generate a random string (e.g., use `openssl rand -base64 32`)
3. **OPENAI_API_KEY**: 
   - Sign up at [OpenAI Platform](https://platform.openai.com/)
   - Create an API key
   - Add billing information (charges apply for AI generation)
   - Paste the key (starts with `sk-`)

## Step 5: Set Up the Database Schema

Push the database schema to your PostgreSQL database:

```bash
npm run db:push
```

This will create all the necessary tables in your database.

## Step 6: Run the Application

Start the development server:

```bash
npm run dev
```

The application will start on **http://localhost:5000**

You should see:
```
[express] serving on port 5000
```

## Step 7: Access the Application

Open your browser and navigate to:
```
http://localhost:5000
```

### Test Login Credentials

**Retailer Portal:**
- Email: `contact@luxeinteriors.com`
- Password: `retailer123`

**Customer Portal:**
- Email: `priya.malhotra@example.com`
- Password: `customer123`

## Project Structure

```
sujaluxe/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── lib/         # Utilities and configs
│   │   └── App.tsx      # Main app component
│   └── index.html
├── server/              # Express backend
│   ├── routes.ts        # API endpoints
│   ├── storage.ts       # Database layer
│   ├── jwt.ts           # Authentication
│   └── index.ts         # Server entry point
├── shared/
│   └── schema.ts        # Shared database schema
├── package.json
└── .env                 # Environment variables (create this)
```

## Available Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run db:push` - Push database schema changes
- `npm run build` - Build for production
- `npm start` - Run production build

## Features Overview

### Retailer Portal
- Product Management (Add, Edit, Delete products)
- Order Management
- Analytics Dashboard
- Auction Management
- Review Management
- Profile Settings

### Customer Portal
- Browse Products
- AI Room Designer (visualize products in rooms)
- Shopping Cart
- Wishlist
- Order Tracking
- Negotiations
- Auctions
- Reviews & Campaigns
- Support

## Troubleshooting

### Port Already in Use
If port 5000 is already in use:

**Find and kill the process:**

*macOS/Linux:*
```bash
lsof -ti:5000 | xargs kill -9
```

*Windows:*
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Database Connection Issues

1. **Check PostgreSQL is running:**
   ```bash
   # macOS/Linux
   pg_isready
   
   # Windows
   pg_ctl status
   ```

2. **Verify database exists:**
   ```bash
   psql -U postgres -l
   ```

3. **Test connection:**
   ```bash
   psql postgresql://username:password@localhost:5432/sujaluxe
   ```

### OpenAI API Issues

If AI Room Designer doesn't work:
1. Verify your API key is correct in `.env`
2. Check you have billing set up at OpenAI
3. Verify API key has credits available
4. Check the console for detailed error messages

### Build Issues

**Clear node_modules and reinstall:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## Database Management

### View Database Tables
```bash
psql postgresql://username:password@localhost:5432/sujaluxe

# List all tables
\dt

# View table structure
\d users
\d products
\d orders

# Exit psql
\q
```

### Reset Database
```bash
# Drop and recreate database
dropdb sujaluxe
createdb sujaluxe

# Push schema again
npm run db:push
```

## Production Deployment

For production deployment:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Set environment variables:**
   ```bash
   NODE_ENV=production
   DATABASE_URL=your-production-database-url
   SESSION_SECRET=your-production-secret
   OPENAI_API_KEY=your-openai-api-key
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

## Need Help?

- Check the [Replit documentation](https://docs.replit.com)
- Review the code comments in `server/routes.ts` and `server/storage.ts`
- Examine `shared/schema.ts` for database structure
- Check browser console and server logs for errors

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js, TypeScript
- **Database**: PostgreSQL, Drizzle ORM
- **Authentication**: JWT tokens
- **AI Integration**: OpenAI (DALL-E 3)
- **Real-time**: WebSockets (ws library)

## License

This project is part of the SujaLuxe luxury interior marketplace platform.
