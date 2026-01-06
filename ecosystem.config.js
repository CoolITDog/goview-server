module.exports = {
  apps: [{
    name: 'file-server',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3001,
      UPLOAD_DIR: 'uploads',
      MAX_FILE_SIZE: 10485760,
      MAX_FILES: 5
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
      UPLOAD_DIR: 'uploads',
      MAX_FILE_SIZE: 10485760,
      MAX_FILES: 5
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};