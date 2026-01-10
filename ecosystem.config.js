module.exports = {
    apps: [
        {
            name: 'TJP-Mushroom-Frontend',
            script: 'npm',
            args: 'start',
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'development',
            },
        },
        {
            name: 'TJP-Mushroom-Backend',
            script: 'server/index.js',
            cwd: './',
            autorestart: true,
            watch: true,
            ignore_watch: ['node_modules', 'receipts', 'reports'],
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 5000,
            },
        },
    ],
};
