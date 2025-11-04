import * as Sentry from "@sentry/nextjs";
import { PrismaClient } from "@prisma/client";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");

    // Auto-reseed database in local development (not in Cloud Run)
    if (
      process.env.NODE_ENV === "development" &&
      !process.env.K_SERVICE && // K_SERVICE only exists in Cloud Run
      process.env.DATABASE_URL?.includes("127.0.0.1") // Only for local PostgreSQL
    ) {
      try {
        console.log(
          "🌱 Local development detected - checking database state..."
        );

        const prisma = new PrismaClient();
        const userCount = await prisma.user.count();
        await prisma.$disconnect();

        if (userCount === 0) {
          console.log(
            "📊 Database is empty - auto-seeding with Rule of 3 demo data..."
          );
          console.log(
            "   (Set SKIP_AUTO_SEED=true in .env to disable this behavior)"
          );

          if (process.env.SKIP_AUTO_SEED !== "true") {
            await execAsync("npm run db:seed");
            console.log("✅ Auto-seed complete! Test accounts ready.");
            console.log(
              "   Lobbyist: john.doe@lobbying.com / lobbyist123"
            );
            console.log("   Employer: contact@techcorp.com / employer123");
            console.log("   Admin: admin@multnomah.gov / Demo2025!Admin");
          }
        } else {
          console.log(`✅ Database has data (${userCount} users) - skipping auto-seed`);
        }
      } catch (error) {
        console.error("⚠️  Auto-seed check failed:", error);
        console.log("   Continuing with server startup...");
      }
    }
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
