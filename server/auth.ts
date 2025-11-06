import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { storage } from "./storage";

export type AuthUser = {
  id: string;
  email: string;
  userType: "retailer" | "customer";
  name?: string;
  businessName?: string;
};

// Helper function to hash passwords
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Helper function to verify passwords
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Configure passport to serialize user to session
passport.serializeUser((user: Express.User, done) => {
  const authUser = user as AuthUser;
  done(null, { id: authUser.id, userType: authUser.userType });
});

// Configure passport to deserialize user from session
passport.deserializeUser(async (sessionData: { id: string; userType: string }, done) => {
  try {
    if (sessionData.userType === "retailer") {
      const retailer = await storage.getRetailer(sessionData.id);
      if (retailer) {
        const authUser: AuthUser = {
          id: retailer.id,
          email: retailer.email,
          userType: "retailer",
          businessName: retailer.businessName,
        };
        done(null, authUser);
      } else {
        done(null, false);
      }
    } else if (sessionData.userType === "customer") {
      const customer = await storage.getCustomer(sessionData.id);
      if (customer) {
        const authUser: AuthUser = {
          id: customer.id,
          email: customer.email,
          userType: "customer",
          name: customer.name,
        };
        done(null, authUser);
      } else {
        done(null, false);
      }
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error);
  }
});

// Retailer login strategy
passport.use(
  "retailer-login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const retailer = await storage.getRetailerByEmail(email);
        if (!retailer) {
          return done(null, false, { message: "Invalid email or password" });
        }

        // Verify password using bcrypt
        const isPasswordValid = await verifyPassword(password, retailer.password);
        if (!isPasswordValid) {
          return done(null, false, { message: "Invalid email or password" });
        }

        const authUser: AuthUser = {
          id: retailer.id,
          email: retailer.email,
          userType: "retailer",
          businessName: retailer.businessName,
        };

        return done(null, authUser);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Customer login strategy
passport.use(
  "customer-login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const customer = await storage.getCustomerByEmail(email);
        if (!customer) {
          return done(null, false, { message: "Invalid email or password" });
        }

        // Verify password using bcrypt
        const isPasswordValid = await verifyPassword(password, customer.password);
        if (!isPasswordValid) {
          return done(null, false, { message: "Invalid email or password" });
        }

        const authUser: AuthUser = {
          id: customer.id,
          email: customer.email,
          userType: "customer",
          name: customer.name,
        };

        return done(null, authUser);
      } catch (error) {
        return done(error);
      }
    }
  )
);

export function setupAuth() {
  // This function is called to ensure passport strategies are registered
  // The actual setup happens when this module is imported
}
