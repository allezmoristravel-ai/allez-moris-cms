export default () => ({
    upload: {
        config: {
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
