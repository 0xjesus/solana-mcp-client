module.exports = {
  apps: [{
    name: "mcp-solana-frontend",
    script: "server.js",
    env: {
      NODE_ENV: "production",
      PORT: 1677
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
