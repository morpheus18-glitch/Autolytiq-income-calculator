module.exports = {
  apps: [
    {
      name: "autolytiq-go",
      script: "./go-app/server",
      args: "-port 5000",
      cwd: "/root/income-calculator-autolytiq",
      exec_mode: "fork",
      env: {
        PORT: 5000,
        ADMIN_KEY: "autolytiq-admin-2026",
        // Stripe — set these to enable checkout and webhook verification
        STRIPE_SECRET_KEY: "",
        STRIPE_PRICE_ID: "",
        STRIPE_WEBHOOK_SECRET: "",
        // SMTP — set these to enable drip email campaigns
        SMTP_HOST: "",
        SMTP_PORT: "587",
        SMTP_USER: "",
        SMTP_PASS: "",
        SMTP_FROM: "Autolytiq <hello@autolytiqs.com>",
      },
      // Auto-restart configuration
      max_memory_restart: "500M",
      restart_delay: 1000,
      max_restarts: 10,
      min_uptime: "10s",

      // Logging
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,

      // Graceful shutdown
      kill_timeout: 5000,

      // Health monitoring
      exp_backoff_restart_delay: 100,
    },
  ],
};
