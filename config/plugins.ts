export default () => ({
    upload: {
        config: {
            sizeLimit: 5 * 1024 * 1024, // 5MB max upload size
            security: {
                allowedTypes: [
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
                ],
            },
        },
    },
});
