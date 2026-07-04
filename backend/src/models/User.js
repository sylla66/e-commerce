const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['customer', 'manager', 'admin'],
      default: 'customer',
    },
    phone: { type: String, trim: true },
    avatar: { type: String },
    addresses: [
      {
        label: { type: String },
        street: { type: String, required: true },
        city: { type: String, required: true },
        region: { type: String },
        zipCode: { type: String },
        country: { type: String, default: 'Sénégal' },
        isDefault: { type: Boolean, default: false },
      },
    ],
    isActive: { type: Boolean, default: true },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
