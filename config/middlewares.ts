export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      formLimit: '5mb',    // form body size limit
      jsonLimit: '5mb',    // JSON body size limit
      textLimit: '5mb',    // text body size limit
      formidable: {
        maxFileSize: 5 * 1024 * 1024, // 5MB file size limit
      },
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
