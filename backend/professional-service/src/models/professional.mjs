// backend/professional-service/src/models/professional.js
import mongoose from 'mongoose';

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

export default mongoose.model('Professional', professionalSchema);
