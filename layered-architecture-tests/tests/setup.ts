import mongoose from 'mongoose';

// Increase timeout for integration tests using Testcontainers
jest.setTimeout(60000);

afterAll(async () => {
  // Ensure all mongoose connections are closed after tests
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});
