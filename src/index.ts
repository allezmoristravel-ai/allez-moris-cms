// import type { Core } from '@strapi/strapi';
import * as fs from 'fs';
import * as path from 'path';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) { },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }/*: { strapi: Core.Strapi }*/) {
    // ============================================================
    // TEMPORARY CLEANUP: Delete orphaned non-English activities
    // Remove this entire block after deploying once successfully
    // ============================================================
    const CLEANUP_LOCK = path.join(process.cwd(), '.tmp', 'cleanup-done.lock');
    if (fs.existsSync(CLEANUP_LOCK)) {
      strapi.log.info('[CLEANUP] Already executed, skipping.');
      return;
    }

    try {
      strapi.log.info('[CLEANUP] Starting orphaned activity cleanup...');

      // Fetch ALL activities across ALL locales using the DB query API
      const allActivities = await strapi.db.query('api::activity.activity').findMany({
        select: ['id', 'documentId', 'slug', 'locale', 'title'],
        limit: 100000,
      });

      strapi.log.info(`[CLEANUP] Found ${allActivities.length} total activity rows in DB.`);

      // Group by locale and log counts
      const byLocale: Record<string, typeof allActivities> = {};
      for (const a of allActivities) {
        const loc = a.locale || 'unknown';
        if (!byLocale[loc]) byLocale[loc] = [];
        byLocale[loc].push(a);
      }
      for (const [locale, entries] of Object.entries(byLocale)) {
        strapi.log.info(`[CLEANUP]   Locale "${locale}": ${entries.length} activities`);
      }

      // Build set of English slugs
      const enActivities = byLocale['en'] || [];
      const enSlugs = new Set(enActivities.map(a => a.slug));
      strapi.log.info(`[CLEANUP] English activities: ${enActivities.length}, unique slugs: ${enSlugs.size}`);

      // Find orphans: non-English activities whose slug doesn't exist in English
      const orphans = allActivities.filter(
        a => a.locale !== 'en' && !enSlugs.has(a.slug)
      );
      strapi.log.info(`[CLEANUP] Found ${orphans.length} orphaned non-English activities to delete.`);

      // Log each orphan before deleting
      for (const orphan of orphans) {
        strapi.log.info(`[CLEANUP]   Deleting: slug="${orphan.slug}", locale="${orphan.locale}", title="${orphan.title}", id=${orphan.id}`);
      }

      // Delete orphans one by one
      let deletedCount = 0;
      for (const orphan of orphans) {
        await strapi.db.query('api::activity.activity').delete({
          where: { id: orphan.id },
        });
        deletedCount++;
      }

      strapi.log.info(`[CLEANUP] Successfully deleted ${deletedCount} orphaned activities.`);

      // Write lock file so this doesn't run again on restart
      fs.mkdirSync(path.dirname(CLEANUP_LOCK), { recursive: true });
      fs.writeFileSync(CLEANUP_LOCK, `Cleanup completed at ${new Date().toISOString()}\nDeleted ${deletedCount} orphaned activities.\n`);

    } catch (err) {
      strapi.log.error('[CLEANUP] Error during cleanup:', err);
    }
    // ============================================================
    // END TEMPORARY CLEANUP
    // ============================================================
  },
};
