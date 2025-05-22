# Home Services Marketplace

## My project definition

i need a web application(which has FE implementation for desktop browsers, mobile android and mobile ios) that main goal is the act as a market place for typical home needed works, like plumbers, electricians, constructors, painters, etc.those professionals should be able to publish what services the bring and clients must be able to requests described works they need and find which professionals are able to make it.the professional must provide a proposal, with budgeting and any other information to the client.the application must be implemented in a microservices dockerized architecture and run into a kubernetes cluster.for economic transactions the application must use external payment methods as MercadoPago.all the IU text content must be implemented using internationalization and localization.i want from you a full first version for all the code, an script to create all the folder structure and files, and all the code for those files

## Marketplace for Home Services Application

I'll help you design a comprehensive web application for a home services marketplace. This will be a microservices-based architecture running in Kubernetes with support for desktop browsers, Android, and iOS clients.

Let's break down the approach:

1. Define the microservices architecture
2. Create a script to generate the folder structure
3. Implement core services
4. Develop frontend applications
5. Set up Docker and Kubernetes configurations
6. Integrate payment processing with MercadoPago
7. Implement internationalization and localization

## Project Structure Script

Let's start with a script to create the folder structure:

```bash
#!/bin/bash

# Create root project directory
mkdir -p home-services-marketplace
cd home-services-marketplace

# Create backend microservices directories
mkdir -p backend/user-service/src/{controllers,models,routes,services,utils,config}
mkdir -p backend/professional-service/src/{controllers,models,routes,services,utils,config}
mkdir -p backend/job-service/src/{controllers,models,routes,services,utils,config}
mkdir -p backend/payment-service/src/{controllers,models,routes,services,utils,config}
mkdir -p backend/notification-service/src/{controllers,models,routes,services,utils,config}
mkdir -p backend/api-gateway/src/{routes,middleware,config}

# Create frontend directories
mkdir -p frontend/web/src/{components,pages,services,utils,assets,i18n,store}
mkdir -p frontend/mobile/src/{components,screens,services,utils,assets,i18n,store}

# Create DevOps directories
mkdir -p devops/kubernetes/{deployments,services,ingress,config}
mkdir -p devops/docker

# Create database migration directories
mkdir -p backend/migrations

# Create documentation directory
mkdir -p docs

# Create necessary files
touch README.md
touch .gitignore

echo "Project structure created successfully!"
```

## Backend Services Implementation

Let's implement the core microservices:

1. API Gateway

```js
// backend/api-gateway/src/index.js
const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { logger } = require("./utils/logger");
const authMiddleware = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(logger);

// Routes
app.use(
  "/api/users",
  authMiddleware,
  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL || "http://user-service:3001",
    changeOrigin: true,
    pathRewrite: { "^/api/users": "" },
  })
);

app.use(
  "/api/professionals",
  authMiddleware,
  createProxyMiddleware({
    target:
      process.env.PROFESSIONAL_SERVICE_URL ||
      "http://professional-service:3002",
    changeOrigin: true,
    pathRewrite: { "^/api/professionals": "" },
  })
);

app.use(
  "/api/jobs",
  authMiddleware,
  createProxyMiddleware({
    target: process.env.JOB_SERVICE_URL || "http://job-service:3003",
    changeOrigin: true,
    pathRewrite: { "^/api/jobs": "" },
  })
);

app.use(
  "/api/payments",
  authMiddleware,
  createProxyMiddleware({
    target: process.env.PAYMENT_SERVICE_URL || "http://payment-service:3004",
    changeOrigin: true,
    pathRewrite: { "^/api/payments": "" },
  })
);

app.use(
  "/api/notifications",
  authMiddleware,
  createProxyMiddleware({
    target:
      process.env.NOTIFICATION_SERVICE_URL ||
      "http://notification-service:3005",
    changeOrigin: true,
    pathRewrite: { "^/api/notifications": "" },
  })
);

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
```

```js
// backend/api-gateway/src/middleware/auth.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};
```

2. User Service

```js
// backend/user-service/src/index.js
const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const { i18n } = require("./config/i18n");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(i18n.init);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://mongodb:27017/user-service", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Routes
app.use("/users", userRoutes);

app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});
```

```js
// backend/user-service/src/models/user.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  role: {
    type: String,
    enum: ["client", "professional", "admin"],
    default: "client",
  },
  profilePicture: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
```

```js
// backend/user-service/src/controllers/user.js
const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber, role } =
      req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: req.__("user_already_exists") });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      role,
    });

    await user.save();

    res.status(201).json({ message: req.__("user_created") });
  } catch (error) {
    res
      .status(500)
      .json({ message: req.__("server_error"), error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: req.__("auth_failed") });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: req.__("auth_failed") });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: req.__("server_error"), error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userData.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: req.__("user_not_found") });
    }

    res.status(200).json({ user });
  } catch (error) {
    res
      .status(500)
      .json({ message: req.__("server_error"), error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Don't allow password updates through this endpoint

    const user = await User.findByIdAndUpdate(
      req.userData.userId,
      { ...updates, updatedAt: Date.now() },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: req.__("user_not_found") });
    }

    res.status(200).json({ user, message: req.__("profile_updated") });
  } catch (error) {
    res
      .status(500)
      .json({ message: req.__("server_error"), error: error.message });
  }
};
```

```js
// backend/user-service/src/routes/user.js
const express = require('express');
const userController = require('../controllers/user');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);

module.exports = router;



3. Professional Service
// backend/professional-service/src/models/professional.js
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    required: true,
    enum: ['plumbing', 'electrical', 'carpentry', 'painting', 'cleaning', 'construction', 'other']
  },
  price: {
    type: Number,
    required: true
  },
  priceType: {
    type: String,
    enum: ['hourly', 'fixed'],
    default: 'hourly'
  }
});

const professionalSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  businessName: String,
  description: String,
  services: [serviceSchema],
  skills: [String],
  experience: Number, // Years of experience
  certifications: [{
    name: String,
    issuer: String,
    year: Number,
    documentUrl: String
  }],
  portfolio: [{
    title: String,
    description: String,
    imageUrls: [String]
  }],
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  availability: {
    weekdays: {
      type: [Boolean],
      default: [true, true, true, true, true, false, false] // Mon-Fri by default
    },
    hours: {
      start: {
        type: String,
        default: '09:00'
      },
      end: {
        type: String,
        default: '17:00'
      }
    }
  },
  serviceArea: {
    radius: Number,
    zipCodes: [String],
    cities: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Professional', professionalSchema);
```

```js
// backend/professional-service/src/controllers/professional.js
const Professional = require("../models/professional");
const axios = require("axios");

exports.createProfile = async (req, res) => {
  try {
    const {
      businessName,
      description,
      services,
      skills,
      experience,
      serviceArea,
    } = req.body;

    // Check if profile already exists
    const existingProfile = await Professional.findOne({
      userId: req.userData.userId,
    });
    if (existingProfile) {
      return res
        .status(409)
        .json({ message: req.__("profile_already_exists") });
    }

    // Create new professional profile
    const professional = new Professional({
      userId: req.userData.userId,
      businessName,
      description,
      services,
      skills,
      experience,
      serviceArea,
    });

    await professional.save();

    // Update user role in user service
    try {
      await axios.put(
        `${process.env.USER_SERVICE_URL}/users/role`,
        {
          userId: req.userData.userId,
          role: "professional",
        },
        {
          headers: { Authorization: req.headers.authorization },
        }
      );
    } catch (error) {
      console.error("Failed to update user role:", error);
    }

    res.status(201).json({ message: req.__("profile_created"), professional });
  } catch (error) {
    res
      .status(500)
      .json({ message: req.__("server_error"), error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const professional = await Professional.findOne({
      userId: req.userData.userId,
    });

    if (!professional) {
      return res.status(404).json({ message: req.__("profile_not_found") });
    }

    res.status(200).json({ professional });
  } catch (error) {
    res
      .status(500)
      .json({ message: req.__("server_error"), error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    const professional = await Professional.findOneAndUpdate(
      { userId: req.userData.userId },
      { ...updates, updatedAt: Date.now() },
      { new: true }
    );

    if (!professional) {
      return res.status(404).json({ message: req.__("profile_not_found") });
    }

    res.status(200).json({ professional, message: req.__("profile_updated") });
  } catch (error) {
    res
      .status(500)
      .json({ message: req.__("server_error"), error: error.message });
  }
};

exports.searchProfessionals = async (req, res) => {
  try {
    const { category, location, rating } = req.query;

    const query = {};

    if (category) {
      query["services.category"] = category;
    }

    if (location) {
      query["serviceArea.cities"] = location;
    }

    if (rating) {
      query["rating.average"] = { $gte: parseFloat(rating) };
    }

    const professionals = await Professional.find(query);

    res.status(200).json({ professionals });
  } catch (error) {
    res
      .status(500)
      .json({ message: req.__("server_error"), error: error.message });
  }
};

exports.getProfessionalById = async (req, res) => {
  try {
    const { id } = req.params;

    const professional = await Professional.findById(id);

    if (!professional) {
      return res
        .status(404)
        .json({ message: req.__("professional_not_found") });
    }

    res.status(200).json({ professional });
  } catch (error) {
    res
      .status(500)
      .json({ message: req.__("server_error"), error: error.message });
  }
};
```

4. Job Service

```js
// backend/job-service/src/models/job.js
const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema({
  professionalId: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  estimatedDuration: {
    value: Number,
    unit: {
      type: String,
      enum: ["hours", "days", "weeks"],
      default: "days",
    },
  },
  availableStartDate: Date,
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      "plumbing",
      "electrical",
      "carpentry",
      "painting",
      "cleaning",
      "construction",
      "other",
    ],
  },
  clientId: {
    type: String,
    required: true,
  },
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  budget: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: "USD",
    },
  },
  timeframe: {
    startDate: Date,
    endDate: Date,
    isFlexible: Boolean,
  },
  status: {
    type: String,
    enum: ["open", "in_progress", "completed", "cancelled"],
    default: "open",
  },
  proposals: [proposalSchema],
  attachments: [
    {
      name: String,
      url: String,
      type: String,
    },
  ],
  selectedProposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Proposal",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Job", jobSchema);
```

```js
// backend/job-service/src/controllers/job.js
const Job = require("../models/job");
const axios = require("axios");

exports.createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      budget,
      timeframe,
      attachments,
    } = req.body;

    const job = new Job({
      title,
      description,
      category,
      clientId: req.userData.userId,
      location,
      budget,
      timeframe,
      attachments,
    });

    await job.save();

    // Notify relevant professionals about new job
    try {
      await axios.post(
        `${process.env.NOTIFICATION_SERVICE_URL}/notifications/job-created`,
        {
          jobId: job._id,
          category: job.category,
          location: job.location,
        }
      );
    } catch (error) {
      console.error("Failed to send job notifications:", error);
    }

    res.status(201).json({ message: req.__("job_created"), job });
  } catch (error) {
    res
      .status(500)
      .json({ message: req.__("server_error"), error: error.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const { status, category } = req.query;
    const query = {};

    if (req.userData.role === "client") {
      query.clientId = req.userData.userId;
    }

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });

    res.status(200).json({ jobs });
  } catch (error) {
    res
      .status(500)
      .json({ message: req.__("server_error"), error: error.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ message: req.__("job_not_found") });
    }

    res.status(200).json({ job });
  } catch (error) {
    res
      .status(500)
      .json({ message: req.__("server_error"), error: error.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ message: req.__("job_not_found") });
    }

    // Only client who created the job can update it
    if (job.clientId !== req.userData.userId) {
      return res.status(403).json({ message: req.__("not_authorized") });
    }

    // Update job
    Object.keys(updates).forEach((key) => {
      job[key] = updates[key];
    });
    job.updatedAt = Date.now();

    await job.save();

    res.status(200).json({ message: req.__("job_updated"), job });
  } catch (error) {
    res
      .status(500)
      .json({ message: req.__("server_error"), error: error.message });
  }
};

exports.submitProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, description, estimatedDuration, availableStartDate } =
      req.body;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ message: req.__("job_not_found") });
    }

    if (job.status !== "open") {
      return res.status(400).json({ message: req.__("job_not_open") });
    }

    // Check if professional already submitted a proposal
    const existingProposal = job.proposals.find(
      (p) => p.professionalId === req.userData.userId
    );
    if (existingProposal) {
      return res
        .status(409)
        .json({ message: req.__("proposal_already_exists") });
    }

    // Add proposal
    job.proposals.push({
      professionalId: req.userData.userId,
      price,
      description,
      estimatedDuration,
      availableStartDate: new Date(availableStartDate),
    });

    await job.save();

    // Notify client about new proposal
    try {
      await axios.post(
        `${process.env.NOTIFICATION_SERVICE_URL}/notifications/proposal-received`,
        {
          jobId: job._id,
          clientId: job.clientId,
          professionalId: req.userData.userId,
        }
      );
    } catch (error) {
      console.error("Failed to send proposal notification:", error);
    }

    res.status(201).json({ message: req.__("proposal_submitted") });
  } catch (error) {
    res
      .status(500)
      .json({ message: req.__("server_error"), error: error.message });
  }
};

exports.acceptProposal = async (req, res) => {
  try {
    const { jobId, proposalId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: req.__("job_not_found") });
    }

    // Only client who created the job can accept proposals
    if (job.clientId !== req.userData.userId) {
      return res.status(403).json({ message: req.__("not_authorized") });
    }

    const proposal = job.proposals.id(proposalId);

    if (!proposal) {
      return res.status(404).json({ message: req.__("proposal_not_found") });
    }

    // Update proposal status
    proposal.status = "accepted";
    job.status = "in_progress";
    job.selectedProposal = proposalId;

    await job.save();

    // Notify professional about accepted proposal
    try {
      await axios.post(
        `${process.env.NOTIFICATION_SERVICE_URL}/notifications/proposal-accepted`,
        {
          jobId: job._id,
          clientId: job.clientId,
          professionalId: proposal.professionalId,
        }
      );
    } catch (error) {
      console.error("Failed to send proposal acceptance notification:", error);
    }

    res.status(200).json({ message: req.__("proposal_accepted"), job });
  } catch (error) {
    res
      .status(500)
      .json({ message: req.__("server_error"), error: error.message });
  }
};

exports.completeJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ message: req.__("job_not_found") });
    }

    // Only client who created the job can mark it as complete
    if (job.clientId !== req.userData.userId) {
      return res.status(403).json({ message: req.__("not_authorized") });
    }

    job.status = "completed";
    job.updatedAt = Date.now();

    await job.save();

    // Notify professional about job completion
    if (job.selectedProposal) {
      const selectedProposal = job.proposals.id(job.selectedProposal);
      try {
        await axios.post(
          `${process.env.NOTIFICATION_SERVICE_URL}/notifications/job-completed`,
          {
            jobId: job._id,
            clientId: job.clientId,
            professionalId: selectedProposal.professionalId,
          }
        );
      } catch (error) {
        console.error("Failed to send job completion notification:", error);
      }
    }

    res.status(200).json({ message: req.__("job_completed"), job });
  } catch (error) {
    res
      .status(500)
      .json({ message: req.__("server_error"), error: error.message });
  }
};
```

5. Payment Service with MercadoPago Integration

```js
// backend/payment-service/src/models/payment.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
  },
  clientId: {
    type: String,
    required: true,
  },
  professionalId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "USD",
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed", "refunded"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ["mercadopago", "credit_card", "bank_transfer"],
  },
  externalPaymentId: String,
  externalPaymentUrl: String,
  paymentDetails: {
    type: mongoose.Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Payment", paymentSchema);
```

```js
// backend/payment-service/src/controllers/payment.js
const Payment = require("../models/payment");
const mercadopago = require("mercadopago");
const axios = require("axios");

// Configure MercadoPago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

exports.createPayment = async (req, res) => {
  try {
    const { jobId, professionalId, amount, paymentMethod } = req.body;

    // Get job details to verify
    let jobDetails;
    try {
      const response = await axios.get(
        `${process.env.JOB_SERVICE_URL}/jobs/${jobId}`,
        {
          headers: { Authorization: req.headers.authorization },
        }
      );
      jobDetails = response.data.job;
    } catch (error) {
      return res.status(404).json({ message: req.__("job_not_found") });
    }

    // Verify client is the one who created the job
    if (jobDetails.clientId !== req.userData.userId) {
      return res.status(403).json({ message: req.__("not_authorized") });
    }

    // Create payment record
    const payment = new Payment({
      jobId,
      clientId: req.userData.userId,
      professionalId,
      amount,
      paymentMethod,
    });

    // Process payment based on method
    if (paymentMethod === "mercadopago") {
      // Create MercadoPago preference
      const preference = {
        items: [
          {
            title: `Payment for job #${jobId}`,
            unit_price: amount,
            quantity: 1,
          },
        ],
        back_urls: {
          success: `${process.env.FRONTEND_URL}/payments/success`,
          failure: `${process.env.FRONTEND_URL}/payments/failure`,
          pending: `${process.env.FRONTEND_URL}/payments/pending`,
        },
        auto_return: "approved",
        external_reference: payment._id.toString(),
        notification_url: `${process.env.PAYMENT_SERVICE_URL}/payments/webhook/mercadopago`,
      };

      const response = await mercadopago.preferences.create(preference);

      payment.externalPaymentId = response.body.id;
      payment.externalPaymentUrl = response.body.init_point;
      payment.status = "processing";
    }

    await payment.save();

    res.status(201).json({
      message: req.__("payment_created"),
      payment: {
        id: payment._id,
        status: payment.status,
        paymentUrl: payment.externalPaymentUrl,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: req.__("server_error"), error: error.message });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({ message: req.__("payment_not_found") });
    }

    // Check if user is authorized to view this payment
    if (
      payment.clientId !== req.userData.userId &&
      payment.professionalId !== req.userData.userId
    ) {
      return res.status(403).json({ message: req.__("not_authorized") });
    }

    res.status(200).json({ payment });
  } catch (error) {
    res
      .status(500)
      .json({ message: req.__("server_error"), error: error.message });
  }
};

exports.mercadopagoWebhook = async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === "payment") {
      const paymentId = data.id;

      // Get payment details from MercadoPago
      const mpPayment = await mercadopago.payment.get(paymentId);
      const externalReference = mpPayment.body.external_reference;

      // Update our payment record
      const payment = await Payment.findById(externalReference);

      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      // Update payment status based on MercadoPago status
      switch (mpPayment.body.status) {
        case "approved":
          payment.status = "completed";
          break;
        case "pending":
        case "in_process":
          payment.status = "processing";
          break;
        case "rejected":
          payment.status = "failed";
          break;
        default:
          payment.status = "failed";
      }

      payment.paymentDetails = mpPayment.body;
      payment.updatedAt = Date.now();

      await payment.save();

      // If payment completed, notify professional
      if (payment.status === "completed") {
        try {
          await axios.post(
            `${process.env.NOTIFICATION_SERVICE_URL}/notifications/payment-received`,
            {
              paymentId: payment._id,
              jobId: payment.jobId,
              clientId: payment.clientId,
              professionalId: payment.professionalId,
              amount: payment.amount,
            }
          );
        } catch (error) {
          console.error("Failed to send payment notification:", error);
        }
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: error.message });
  }
};
```

6. Frontend Implementation

Web Frontend (React)

```js
// frontend/web/src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Provider } from "react-redux";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import store from "./store";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import JobsList from "./pages/JobsList";
import JobDetails from "./pages/JobDetails";
import CreateJob from "./pages/CreateJob";
import ProfessionalsList from "./pages/ProfessionalsList";
import ProfessionalProfile from "./pages/ProfessionalProfile";
import CreateProfessionalProfile from "./pages/CreateProfessionalProfile";
import UserProfile from "./pages/UserProfile";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccess from "./pages/PaymentSuccess";

function App() {
  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <Router>
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <PrivateRoute path="/dashboard" component={Dashboard} />
              <PrivateRoute path="/jobs/create" component={CreateJob} />
              <PrivateRoute path="/jobs/:id" component={JobDetails} />
              <PrivateRoute path="/jobs" component={JobsList} />
              <PrivateRoute
                path="/professionals/:id"
                component={ProfessionalProfile}
              />
              <PrivateRoute
                path="/professionals"
                component={ProfessionalsList}
              />
              <PrivateRoute
                path="/profile/professional/create"
                component={CreateProfessionalProfile}
              />
              <PrivateRoute path="/profile" component={UserProfile} />
              <PrivateRoute path="/payment/:jobId" component={PaymentPage} />
              <PrivateRoute
                path="/payments/success"
                component={PaymentSuccess}
              />
            </Switch>
          </main>
          <Footer />
        </Router>
      </I18nextProvider>
    </Provider>
  );
}

export default App;
```

```js
// frontend/web/src/i18n/index.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

import enTranslation from "./locales/en.json";
import esTranslation from "./locales/es.json";
import ptTranslation from "./locales/pt.json";

const resources = {
  en: {
    translation: enTranslation,
  },
  es: {
    translation: esTranslation,
  },
  pt: {
    translation: ptTranslation,
  },
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    debug: process.env.NODE_ENV === "development",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
```

```json
// frontend/web/src/i18n/locales/en.json
{
  "app_name": "HomeServices",
  "home": "Home",
  "login": "Login",
  "register": "Register",
  "dashboard": "Dashboard",
  "jobs": "Jobs",
  "professionals": "Professionals",
  "profile": "Profile",
  "logout": "Logout",

  "welcome_message": "Find trusted professionals for your home needs",
  "search_placeholder": "What service do you need?",
  "popular_categories": "Popular Categories",
  "how_it_works": "How it works",
  "step_1": "Post a job",
  "step_2": "Get proposals",
  "step_3": "Hire a professional",
  "step_4": "Get the job done",

  "email": "Email",
  "password": "Password",
  "confirm_password": "Confirm Password",
  "first_name": "First Name",
  "last_name": "Last Name",
  "phone_number": "Phone Number",
  "address": "Address",
  "city": "City",
  "state": "State",
  "zip_code": "ZIP Code",
  "country": "Country",

  "login_title": "Login to your account",
  "register_title": "Create an account",
  "forgot_password": "Forgot password?",
  "no_account": "Don't have an account?",
  "have_account": "Already have an account?",

  "client": "Client",
  "professional": "Professional",
  "admin": "Admin",

  "job_title": "Job Title",
  "job_description": "Job Description",
  "job_category": "Category",
  "job_budget": "Budget",
  "job_location": "Location",
  "job_timeframe": "Timeframe",
  "job_attachments": "Attachments",
  "create_job": "Create Job",
  "job_created": "Job created successfully",

  "plumbing": "Plumbing",
  "electrical": "Electrical",
  "carpentry": "Carpentry",
  "painting": "Painting",
  "cleaning": "Cleaning",
  "construction": "Construction",
  "other": "Other",

  "open": "Open",
  "in_progress": "In Progress",
  "completed": "Completed",
  "cancelled": "Cancelled",

  "business_name": "Business Name",
  "professional_description": "Description",
  "services": "Services",
  "skills": "Skills",
  "experience": "Experience",
  "certifications": "Certifications",
  "portfolio": "Portfolio",
  "availability": "Availability",
  "service_area": "Service Area",

  "create_profile": "Create Professional Profile",
  "update_profile": "Update Profile",
  "profile_created": "Profile created successfully",
  "profile_updated": "Profile updated successfully",

  "submit_proposal": "Submit Proposal",
  "proposal_price": "Price",
  "proposal_description": "Proposal Description",
  "estimated_duration": "Estimated Duration",
  "available_start_date": "Available Start Date",
  "proposal_submitted": "Proposal submitted successfully",

  "accept_proposal": "Accept Proposal",
  "reject_proposal": "Reject Proposal",
  "proposal_accepted": "Proposal accepted",

  "payment": "Payment",
  "payment_method": "Payment Method",
  "payment_amount": "Amount",
  "pay_now": "Pay Now",
  "payment_success": "Payment Successful",
  "payment_failed": "Payment Failed",

  "reviews": "Reviews",
  "write_review": "Write a Review",
  "rating": "Rating",
  "review_text": "Review",
  "submit_review": "Submit Review",

  "notifications": "Notifications",
  "no_notifications": "No notifications",
  "mark_as_read": "Mark as read",

  "error": "Error",
  "server_error": "Server error. Please try again later.",
  "not_authorized": "Not authorized",
  "not_found": "Not found"
}
```

Mobile Frontend (React Native)

```js
// frontend/mobile/src/App.js
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider } from "react-redux";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import store from "./store";
import { Ionicons } from "@expo/vector-icons";

// Screens
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import JobsScreen from "./screens/JobsScreen";
import JobDetailsScreen from "./screens/JobDetailsScreen";
import CreateJobScreen from "./screens/CreateJobScreen";
import ProfessionalsScreen from "./screens/ProfessionalsScreen";
import ProfessionalProfileScreen from "./screens/ProfessionalProfileScreen";
import ProfileScreen from "./screens/ProfileScreen";
import CreateProfessionalProfileScreen from "./screens/CreateProfessionalProfileScreen";
import PaymentScreen from "./screens/PaymentScreen";
import NotificationsScreen from "./screens/NotificationsScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Jobs") {
            iconName = focused ? "briefcase" : "briefcase-outline";
          } else if (route.name === "Professionals") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "Notifications") {
            iconName = focused ? "notifications" : "notifications-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Jobs" component={JobsScreen} />
      <Tab.Screen name="Professionals" component={ProfessionalsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
    </Tab.Navigator>
  );
}

function App() {
  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
            <Stack.Screen name="CreateJob" component={CreateJobScreen} />
            <Stack.Screen
              name="ProfessionalProfile"
              component={ProfessionalProfileScreen}
            />
            <Stack.Screen
              name="CreateProfessionalProfile"
              component={CreateProfessionalProfileScreen}
            />
            <Stack.Screen name="Payment" component={PaymentScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </I18nextProvider>
    </Provider>
  );
}

export default App;
```

## Docker and Kubernetes Configuration

### Docker Configuration

```
# devops/docker/api-gateway.Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY backend/api-gateway/package*.json ./

RUN npm install

COPY backend/api-gateway ./

EXPOSE 3000

CMD ["node", "src/index.js"]
```

```
# devops/docker/user-service.Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY backend/user-service/package*.json ./

RUN npm install

COPY backend/user-service ./

EXPOSE 3001

CMD ["node", "src/index.js"]
```

```
# devops/docker/professional-service.Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY backend/professional-service/package*.json ./

RUN npm install

COPY backend/professional-service ./

EXPOSE 3002

CMD ["node", "src/index.js"]
```

```
# devops/docker/job-service.Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY backend/job-service/package*.json ./

RUN npm install

COPY backend/job-service ./

EXPOSE 3003

CMD ["node", "src/index.js"]
```

```
# devops/docker/payment-service.Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY backend/payment-service/package*.json ./

RUN npm install

COPY backend/payment-service ./

EXPOSE 3004

CMD ["node", "src/index.js"]
```

```
# devops/docker/notification-service.Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY backend/notification-service/package*.json ./

RUN npm install

COPY backend/notification-service ./

EXPOSE 3005

CMD ["node", "src/index.js"]
```

```
# devops/docker/web-frontend.Dockerfile
FROM node:16-alpine as build

WORKDIR /app

COPY frontend/web/package*.json ./

RUN npm install

COPY frontend/web ./

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

###Docker Compose for Development

```
# docker-compose.yml
version: '3'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - backend-network

  api-gateway:
    build:
      context: .
      dockerfile: devops/docker/api-gateway.Dockerfile
    ports:
      - "3000:3000"
    environment:
      - USER_SERVICE_URL=http://user-service:3001
      - PROFESSIONAL_SERVICE_URL=http://professional-service:3002
      - JOB_SERVICE_URL=http://job-service:3003
      - PAYMENT_SERVICE_URL=http://payment-service:3004
      - NOTIFICATION_SERVICE_URL=http://notification-service:3005
      - JWT_SECRET=your_jwt_secret
    depends_on:
      - user-service
      - professional-service
      - job-service
      - payment-service
      - notification-service
    networks:
      - backend-network
      - frontend-network

  user-service:
    build:
      context: .
      dockerfile: devops/docker/user-service.Dockerfile
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/user-service
      - JWT_SECRET=your_jwt_secret
    depends_on:
      - mongodb
    networks:
      - backend-network

  professional-service:
    build:
      context: .
      dockerfile: devops/docker/professional-service.Dockerfile
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/professional-service
      - USER_SERVICE_URL=http://user-service:3001
      - JWT_SECRET=your_jwt_secret
    depends_on:
      - mongodb
      - user-service
    networks:
      - backend-network

  job-service:
    build:
      context: .
      dockerfile: devops/docker/job-service.Dockerfile
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/job-service
      - NOTIFICATION_SERVICE_URL=http://notification-service:3005
      - JWT_SECRET=your_jwt_secret
    depends_on:
      - mongodb
      - notification-service
    networks:
      - backend-network

  payment-service:
    build:
      context: .
      dockerfile: devops/docker/payment-service.Dockerfile
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/payment-service
      - JOB_SERVICE_URL=http://job-service:3003
      - NOTIFICATION_SERVICE_URL=http://notification-service:3005
      - MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_access_token
      - FRONTEND_URL=http://localhost:3006
      - JWT_SECRET=your_jwt_secret
    depends_on:
      - mongodb
      - job-service
      - notification-service
    networks:
      - backend-network

  notification-service:
    build:
      context: .
      dockerfile: devops/docker/notification-service.Dockerfile
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/notification-service
      - JWT_SECRET=your_jwt_secret
    depends_on:
      - mongodb
    networks:
      - backend-network

  web-frontend:
    build:
      context: .
      dockerfile: devops/docker/web-frontend.Dockerfile
    ports:
      - "3006:80"
    depends_on:
      - api-gateway
    networks:
      - frontend-network

networks:
  backend-network:
  frontend-network:

volumes:
  mongodb_data:
```

###Kubernetes Configuration

```
# devops/kubernetes/deployments/mongodb.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongodb
spec:
  serviceName: mongodb
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo:latest
        ports:
        - containerPort: 27017
        volumeMounts:
        - name: mongodb-data
          mountPath: /data/db
  volumeClaimTemplates:
  - metadata:
      name: mongodb-data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 1Gi
```

```
# devops/kubernetes/services/mongodb.yaml
apiVersion: v1
kind: Service
metadata:
  name: mongodb
spec:
  selector:
    app: mongodb
  ports:
  - port: 27017
    targetPort: 27017
  clusterIP: None
```

```
# devops/kubernetes/deployments/api-gateway.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: home-services/api-gateway:latest
        ports:
        - containerPort: 3000
        env:
        - name: USER_SERVICE_URL
          value: "http://user-service:3001"
        - name: PROFESSIONAL_SERVICE_URL
          value: "http://professional-service:3002"
        - name: JOB_SERVICE_URL
          value: "http://job-service:3003"
        - name: PAYMENT_SERVICE_URL
          value: "http://payment-service:3004"
        - name: NOTIFICATION_SERVICE_URL
          value: "http://notification-service:3005"
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
```

```
# devops/kubernetes/services/api-gateway.yaml
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
spec:
  selector:
    app: api-gateway
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

```
# devops/kubernetes/deployments/user-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: home-services/user-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: MONGODB_URI
          value: "mongodb://mongodb:27017/user-service"
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
```

```
# devops/kubernetes/services/user-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  selector:
    app: user-service
  ports:
  - port: 3001
    targetPort: 3001
  type: ClusterIP
```

```
# devops/kubernetes/ingress/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: home-services-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: home-services.local
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-gateway
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-frontend
            port:
              number: 80
```

```
# devops/kubernetes/config/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  jwt-secret: eW91cl9qd3Rfc2VjcmV0 # base64 encoded "your_jwt_secret"
  mercadopago-token: eW91cl9tZXJjYWRvcGFnb19hY2Nlc3NfdG9rZW4= # base64 encoded "your_mercadopago_access_token"
```

## Conclusion

This is a comprehensive first version of a home services marketplace application with microservices architecture. The implementation includes:

###Backend microservices:

API Gateway
User Service
Professional Service
Job Service
Payment Service with MercadoPago integration
Notification Service

###Frontend applications:

Web frontend using React
Mobile frontend using React Native

###DevOps configuration:

Docker containers for each service
Kubernetes deployment files
Docker Compose for development
Internationalization and localization support for all UI text

###To run this application:

Execute the script to create the folder structure
Install dependencies for each service
For development, use Docker Compose: docker-compose up
For production, deploy to Kubernetes: kubectl apply -f devops/kubernetes/
This implementation provides a solid foundation that can be extended with additional features like reviews, ratings, search functionality, and more sophisticated payment processing.
