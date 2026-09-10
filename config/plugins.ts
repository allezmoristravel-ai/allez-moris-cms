const ALLOWED_TYPES = [
    "image/*",
    "video/*",
    "audio/*",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    "application/json",
    "application/zip",
    "application/x-zip-compressed",
];

export default ({ env }) => {
    // Cloudinary is used as soon as credentials are present; otherwise uploads
    // fall back to the local filesystem provider (useful for local dev).
    const useCloudinary = Boolean(env("CLOUDINARY_NAME"));

    return {
        upload: {
            config: {
                sizeLimit: env.int("UPLOAD_SIZE_LIMIT_MB", 50) * 1024 * 1024,
                security: {
                    allowedTypes: ALLOWED_TYPES,
                },
                ...(useCloudinary
                    ? {
                          provider: "cloudinary",
                          providerOptions: {
                              cloud_name: env("CLOUDINARY_NAME"),
                              api_key: env("CLOUDINARY_KEY"),
                              api_secret: env("CLOUDINARY_SECRET"),
                          },
                          actionOptions: {
                              upload: {
                                  folder: env("CLOUDINARY_FOLDER", "allez-moris"),
                              },
                              uploadStream: {
                                  folder: env("CLOUDINARY_FOLDER", "allez-moris"),
                              },
                              delete: {},
                          },
                      }
                    : {}),
            },
        },
    };
};
