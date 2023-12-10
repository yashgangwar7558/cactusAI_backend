const { check, validationResult } = require('express-validator');

exports.validateUserSignUp = [
  check('firstName')
    .trim()
    .not()
    .isEmpty()
    .withMessage('First Name is required!')
    .isString()
    .withMessage('Must be a valid name!')
    .isLength({ min: 3, max: 20 })
    .withMessage('Name must be within 3 to 20 character!'),
  check('lastName')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Last Name is required!')
    .isString()
    .withMessage('Must be a valid name!')
    .isLength({ min: 3, max: 20 })
    .withMessage('Name must be within 3 to 20 character!'),
  check('username')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Username is required!')
    .isLength({ min: 5 })
    .withMessage('Username must be at least 5 characters long')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and dashes'),
  check('email').normalizeEmail().isEmail().withMessage('Invalid email!'),
  check('password')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Password is empty!')
    .isLength({ min: 8, max: 20 })
    .withMessage('Password must be 8 to 20 characters long!'),
  check('confirmPassword')
    .trim()
    .not()
    .isEmpty()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Both password must be same!');
      }
      return true;
    }),
];

exports.userValidation = (req, res, next) => {
  const result = validationResult(req).array();
  if (!result.length) return next();

  const error = result[0].msg;
  res.json({ success: false, message: error });
};

exports.validateUserSignIn = [
  check('username').trim().not().isEmpty().withMessage('username / password is required!'),
  check('password')
    .trim()
    .not()
    .isEmpty()
    .withMessage('username / password is required!'),
];