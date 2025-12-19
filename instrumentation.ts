// Next.js instrumentation hook for server-side initialization
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
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

        // Dynamic imports to avoid loading in edge runtime
        const { PrismaClient } = await import("@prisma/client");
        const { exec } = await import("child_process");
        const { promisify } = await import("util");
        const execAsync = promisify(exec);

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

  // Note: Error tracking is handled by GCP Cloud Error Reporting
  // which automatically captures unhandled errors from Cloud Run
}
