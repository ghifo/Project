const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const Uesr = require('../../models/User');

// @route  Get api/auth
// @desc   Test route
// @access Puplic
router.get('/', auth, async (req, res) => {
  try {
    // It is a protected route,
    // we're using the token which has the ID
    // In the middleware (req.user = decoded.user)
    // ==> We can use (req.user)
    const user = await User.findById(req.user.id).select('-password');
    // we don't want to return the password ==>('-password')
    res.json({ user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  Post api/auth
// @desc   Authenticate user & get token
// @access Puplic
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists({ min: 6 }),
  ],
  async (req, res) => {
    {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      try {
        let user = await User.findOne({ email });
        if (!user) {
          return res.status(400).json({ errors: [{ msg: 'Invalid Credetials' }] });
        }

        // Check if the password matches
        // bcrypt.compare(): compares plain password and encrypted password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ errors: [{ msg: 'Invalid Credetials' }] });
        }

        // Return jsonwebtolken ==> to be loged in when a user register right away
        const payload = {
          user: {
            id: user.id,
          },
        };
        jwt.sign(
          payload,
          config.get('jwtSecret'),
          {
            expiresIn: 360000,
          },
          (err, token) => {
            if (err) throw err;
            res.json({ token });
          },
        );
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
      }
    }
  },
);

module.exports = router;
