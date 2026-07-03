// import type { Core } from '@strapi/strapi';

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
  async bootstrap({ strapi }: { strapi: any }) {
    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (!publicRole) return;

    // Collection types support both find (list) and findOne (single entry) actions.
    const collectionUids = [
      'api::testimonial.testimonial',
      'api::legal-page.legal-page',
      'api::rental-vehicle.rental-vehicle',
      'api::transfer-vehicle-category.transfer-vehicle-category',
      'api::transfer-price-route.transfer-price-route',
      // Existing types
      'api::activity.activity',
      'api::category.category',
      'api::accommodation.accommodation',
    ];

    // Single types only expose a `find` action (there is no id to look up).
    const singleUids = [
      'api::home-page.home-page',
      'api::about-page.about-page',
      'api::services-rental-page.services-rental-page',
      'api::services-transfer-page.services-transfer-page',
      'api::global-setting.global-setting',
      // Existing types
      'api::contactdetails.contactdetails',
    ];

    const fullActions = [
      ...collectionUids.flatMap((uid) => [`${uid}.find`, `${uid}.findOne`]),
      ...singleUids.map((uid) => `${uid}.find`),
    ];

    for (const fullAction of fullActions) {
      const existing = await strapi
        .query('plugin::users-permissions.permission')
        .findOne({ where: { action: fullAction, role: publicRole.id } });
      if (!existing) {
        await strapi
          .query('plugin::users-permissions.permission')
          .create({ data: { action: fullAction, role: publicRole.id } });
      }
    }
  },
};
