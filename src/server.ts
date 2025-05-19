import app from './app';
import redis from './lib/redis';

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await redis.connect(); // ✅ Connect here, not in app.ts
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Redis connection failed:', err);
  }
})();