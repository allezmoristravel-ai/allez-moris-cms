export default ({ env }) => {
  const uploadSizeLimitMb = env.int('UPLOAD_SIZE_LIMIT_MB', 50);

  return [
    'strapi::logger',
    'strapi::errors',
    {
      name: 'strapi::security',
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            'connect-src': ["'self'", 'https:'],
            // Cloudinary-hosted assets must be whitelisted or the admin media
            // library renders broken previews.
            'img-src': [
              "'self'",
              'data:',
              'blob:',
              'market-assets.strapi.io',
              'res.cloudinary.com',
            ],
            'media-src': [
              "'self'",
              'data:',
              'blob:',
              'market-assets.strapi.io',
              'res.cloudinary.com',
            ],
            upgradeInsecureRequests: null,
          },
        },
      },
    },
    'strapi::cors',
    'strapi::poweredBy',
    'strapi::query',
    {
      name: 'strapi::body',
      config: {
        formLimit: `${uploadSizeLimitMb}mb`, // form body size limit
        jsonLimit: `${uploadSizeLimitMb}mb`, // JSON body size limit
        textLimit: `${uploadSizeLimitMb}mb`, // text body size limit
        formidable: {
          maxFileSize: uploadSizeLimitMb * 1024 * 1024,
        },
      },
    },
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
};
