const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const authRepository = require('../repositories/authRepository');
const emailService = require('./emailService');

const authService = {
  async signup({ name, email, password }) {
    const existing = await authRepository.findByEmail(email);
    if (existing) throw AppError.badRequest('Email already exists');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await authRepository.createUser(name, email, hashedPassword);

    emailService.sendWelcomeEmail(user.email, user.name).catch(() => {});

    return { message: 'User Registered Successfully!', user };
  },

  async login({ email, password }, ip) {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      logger.security('Login failed - user not found', { email, ip });
      throw AppError.unauthorized('Invalid email or password');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      logger.security('Login failed - wrong password', { email, userId: user.id, ip });
      throw AppError.unauthorized('Invalid email or password');
    }

    await authRepository.updateLastLogin(user.id);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    logger.login('Login successful', { userId: user.id, email: user.email, ip });

    return {
      message: 'Login Success',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    };
  }
};

module.exports = authService;
