// backend/user-service/src/index.js
import express from 'express';
import mongoose from 'mongoose';
import userRoutes from './routes/user.mjs';
import i18n from './config/i18n/index.mjs';

const app = express();
const PORT = process.env.USER_SERVICE_PORT || 3001;

// Middleware
app.use(express.json());
app.use(i18n.init);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/user-service', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

// Routes
app.use('/users', userRoutes);

app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});
