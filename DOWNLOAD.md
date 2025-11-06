# How to Download SujaLuxe Project

## Method 1: Download from Replit (Easiest)

1. **In Replit**, click on the **three dots (⋮)** menu at the top
2. Select **"Download as zip"**
3. Extract the ZIP file on your computer
4. Follow the setup instructions in `LOCAL_SETUP.md`

## Method 2: Clone with Git

If you've connected this Replit to a Git repository:

```bash
git clone <your-repository-url>
cd sujaluxe
```

Then follow the setup instructions in `LOCAL_SETUP.md`

## Method 3: Manual File Copy

1. Open the Replit file browser
2. Select all files and folders
3. Download or copy them to your local machine
4. Follow the setup instructions in `LOCAL_SETUP.md`

## What's Included

When you download, you'll get:

```
sujaluxe/
├── client/                  # React frontend application
│   ├── src/
│   │   ├── components/     # UI components (buttons, cards, forms)
│   │   ├── pages/          # Page components (dashboard, products, etc.)
│   │   │   ├── customer/   # Customer portal pages
│   │   │   └── retailer/   # Retailer portal pages
│   │   ├── lib/            # Utilities and configurations
│   │   └── App.tsx         # Main application component
│   └── index.html
├── server/                  # Express backend server
│   ├── routes.ts           # All API endpoints
│   ├── storage.ts          # Database operations
│   ├── auth.ts             # Passport authentication
│   ├── jwt.ts              # JWT token utilities
│   ├── index.ts            # Server entry point
│   └── vite.ts             # Vite integration
├── shared/
│   └── schema.ts           # Database schema (Drizzle ORM)
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── drizzle.config.ts       # Database configuration
├── .env.example            # Example environment variables
├── LOCAL_SETUP.md          # Complete setup instructions
└── README.md               # Project documentation

Total: ~50 files
```

## Next Steps

After downloading:

1. **Read** `LOCAL_SETUP.md` for complete setup instructions
2. **Install** Node.js and PostgreSQL if you don't have them
3. **Create** a `.env` file based on `.env.example`
4. **Run** `npm install` to install dependencies
5. **Set up** your PostgreSQL database
6. **Push** the database schema with `npm run db:push`
7. **Start** the application with `npm run dev`

## Important Notes

### Environment Differences

**In Replit:**
- Uses Replit AI Integrations (automatic, no API key needed)
- Uses Neon Database (automatic PostgreSQL)
- Uses `AI_INTEGRATIONS_OPENAI_*` environment variables

**Local Development:**
- Requires your own OpenAI API key
- Requires local PostgreSQL installation
- Uses `OPENAI_API_KEY` environment variable

### Database

The downloaded project **does not include** the database data. You'll need to:
- Set up a fresh PostgreSQL database
- Run `npm run db:push` to create tables
- The app will start with empty data (except seed products if any)
- You can use the test credentials in `LOCAL_SETUP.md`

### API Keys

You'll need to get your own:
- **OpenAI API Key** - For AI Room Designer feature
  - Sign up at https://platform.openai.com/
  - Create API key
  - Add billing information
  - Cost: ~$0.04 per image generation

### File Size

The download will be approximately:
- **Without node_modules**: ~2-5 MB
- **With node_modules**: ~200-400 MB

**Recommendation**: Download without `node_modules` and run `npm install` locally.

## Troubleshooting Downloads

### Large Download Size
If the download is too large:
1. Delete `node_modules` folder before downloading
2. Download the source files only
3. Run `npm install` on your local machine

### Missing Files
Make sure you download all these critical files:
- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `tailwind.config.ts`
- `drizzle.config.ts`
- `.env.example`
- All files in `client/`, `server/`, and `shared/` folders

### Permission Issues
On macOS/Linux, after extracting:
```bash
chmod +x node_modules/.bin/*
```

## Support

If you encounter issues:
1. Check `LOCAL_SETUP.md` for detailed troubleshooting
2. Verify all environment variables are set correctly
3. Check that PostgreSQL is running
4. Review the console output for error messages

## Ready to Run Locally?

Follow the complete guide in **LOCAL_SETUP.md** for step-by-step instructions!
