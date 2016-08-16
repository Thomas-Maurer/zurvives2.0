module.exports.autoreload = {
    active: true,
    usePolling: false,
    dirs: [
        "api/models",
        "api/controllers",
        "api/services",
        "config/locales",
        "assets/js/controllers",
        "assets/js/directives",
        "assets/js/services"
    ],
    ignored: [
        // Ignore all files with .ts extension
        "**.ts",
        "**.ejs"
    ]
};