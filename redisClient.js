// redisClient.js
import { createClient } from 'redis';

// Configure your Redis client options here
const redisOptions = {
  url: 'redis://localhost:6379', // replace with your Redis server's URL
};

// Singleton client instance
let client;
let isConnecting = false;  // Track connection state

async function getRedisClient() {
  if (!client && !isConnecting) {
    try {
      isConnecting = true;  // Mark that we're trying to connect
      client = createClient(redisOptions);

      // Handle connection errors
      client.on('error', (err) => {
        // Do not uncomment when redis server is offline
        // console.error('Redis connection error:', err);
      });

      await client.connect();  // Wait for the connection to establish
      console.log('Connected to Redis');

    } catch (err) {
      console.error('Redis connection failed:', err);
      client = null;  // Reset the client on error
    } finally {
      isConnecting = false;  // Reset connection state
    }
  }

  return client;
}

export default getRedisClient;
