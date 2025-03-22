const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  subjects: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    topics: [{
      name: String,
      status: {
        type: String,
        enum: ['not-started', 'in-progress', 'completed'],
        default: 'not-started'
      },
      notes: String,
      resources: [{
        title: String,
        url: String,
        type: String // 'video', 'article', 'exercise', etc.
      }]
    }]
  }],
  schedule: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    timeSlots: [{
      startTime: String,
      endTime: String,
      subject: String,
      topic: String
    }]
  }],
  goals: [{
    title: String,
    description: String,
    deadline: Date,
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    }
  }],
  progress: {
    overallProgress: {
      type: Number,
      default: 0
    },
    subjectProgress: [{
      subject: String,
      progress: Number
    }]
  },
  feedback: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
studyPlanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const StudyPlan = mongoose.model('StudyPlan', studyPlanSchema);

module.exports = StudyPlan; 