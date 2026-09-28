const cron = require('node-cron');
const mongoose = require('mongoose');

/**
 * Checks MongoDB database connectivity, ping latency, and collection stats
 * @returns {Promise<object>} Database health summary
 */
const checkDbHealth = async () => {
  const isConnected = mongoose.connection.readyState === 1;
  const readyStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const statusStr = readyStates[mongoose.connection.readyState] || 'unknown';
  const memory = process.memoryUsage();
  const uptimeHours = (process.uptime() / 3600).toFixed(2);

  if (!isConnected) {
    const errorReport = {
      status: 'unhealthy',
      database: {
        state: statusStr,
        connected: false,
        message: 'MongoDB is disconnected. Attempting automatic reconnection...',
      },
      system: {
        uptime: `${uptimeHours} hours`,
        memoryUsedMB: (memory.heapUsed / 1024 / 1024).toFixed(2),
      },
      timestamp: new Date().toISOString(),
    };
    console.error('[DB Health Alert] ⚠️ Database is currently DISCONNECTED.');
    return errorReport;
  }

  try {
    const startPing = Date.now();
    await mongoose.connection.db.admin().ping();
    const pingLatency = Date.now() - startPing;

    // Get collection counts
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    // Quick count of primary collections
    const [foodsCount, categoriesCount, usersCount, ordersCount] = await Promise.all([
      db.collection('foods').countDocuments().catch(() => 0),
      db.collection('categories').countDocuments().catch(() => 0),
      db.collection('users').countDocuments().catch(() => 0),
      db.collection('orders').countDocuments().catch(() => 0),
    ]);

    const healthReport = {
      status: 'healthy',
      database: {
        state: statusStr,
        connected: true,
        pingLatencyMs: `${pingLatency} ms`,
        dbName: mongoose.connection.name,
        host: mongoose.connection.host,
        totalCollections: collections.length,
        stats: {
          foods: foodsCount,
          categories: categoriesCount,
          users: usersCount,
          orders: ordersCount,
        },
      },
      system: {
        uptime: `${uptimeHours} hours`,
        memoryUsedMB: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotalMB: `${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      },
      timestamp: new Date().toISOString(),
    };

    console.log(`\n================== [DATABASE HEALTH CHECK - 2x DAILY] ==================`);
    console.log(`[Health Status] : ✅ HEALTHY & ACTIVE`);
    console.log(`[MongoDB Host]  : ${mongoose.connection.host}`);
    console.log(`[Database Name] : ${mongoose.connection.name}`);
    console.log(`[Ping Latency]  : ${pingLatency} ms`);
    console.log(`[Active Records]: Dishes: ${foodsCount} | Categories: ${categoriesCount} | Users: ${usersCount} | Orders: ${ordersCount}`);
    console.log(`[Memory & Time] : Memory: ${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB | Server Uptime: ${uptimeHours} hrs`);
    console.log(`[Timestamp]     : ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)`);
    console.log(`========================================================================\n`);

    return healthReport;
  } catch (err) {
    console.error(`[DB Health Error] Ping failed: ${err.message}`);
    return {
      status: 'degraded',
      database: {
        state: statusStr,
        connected: false,
        error: err.message,
      },
      system: {
        uptime: `${uptimeHours} hours`,
      },
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Initializes the automated 2x Daily Health Check Cron Job (12:00 AM & 12:00 PM IST)
 */
const initDbHealthSchedule = () => {
  // Runs 2 times every day: at 00:00 (Midnight) and 12:00 (Noon)
  // Cron expression: '0 0,12 * * *'
  cron.schedule('0 0,12 * * *', async () => {
    console.log('[Scheduled Task] Running 2x Daily Database Health & Keep-Alive Check...');
    await checkDbHealth();
  }, {
    scheduled: true,
    timezone: 'Asia/Kolkata', // Indian Standard Time
  });

  console.log('[Schedule Ready] 🕒 Database Health Monitor active (Runs 2 times/day at 12:00 AM & 12:00 PM IST)');
};

module.exports = {
  checkDbHealth,
  initDbHealthSchedule,
};
