'use strict';

/**
 * Activity's `publicPrice`/`publicPriceMur` attributes were renamed to
 * `adultPrice`/`adultPriceMur`. Rename the underlying columns instead of
 * letting Strapi's schema sync drop the old columns and create empty new
 * ones, so existing price data is preserved.
 */
const RENAMES = [
  ['public_price', 'adult_price'],
  ['public_price_mur', 'adult_price_mur'],
];

async function renameColumns(trx, renames) {
  const hasTable = await trx.schema.hasTable('activity');
  if (!hasTable) {
    return;
  }

  for (const [from, to] of renames) {
    const hasOld = await trx.schema.hasColumn('activity', from);
    const hasNew = await trx.schema.hasColumn('activity', to);

    if (hasOld && !hasNew) {
      await trx.schema.alterTable('activity', (table) => {
        table.renameColumn(from, to);
      });
    }
  }
}

module.exports = {
  async up(trx) {
    await renameColumns(
      trx,
      RENAMES
    );
  },

  async down(trx) {
    await renameColumns(
      trx,
      RENAMES.map(([from, to]) => [to, from])
    );
  },
};
