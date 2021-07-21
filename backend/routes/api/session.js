const express = require('express');

const asyncHandler = require('express-async-handler');
const { check } = require('express-validator');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth')
const { User } = require('../../db/models');
const { handleValidationErrors } = require('../../utils/validation')

const router = express.Router();

const validateLogin = [
    check('credential')
        .exists({checkFalsy: true})
        .notEmpty()
        .withMessage('Please enter a username!!'),
    check('password')
        .exists({checkFalsy: true})
        .withMessage("The username and password combination used is incorrect. Please try again."),
    handleValidationErrors,
];

router.get('/', restoreUser, ( req, res ) => {
    const { user } = req;
    if ( user ) {
        return res.json({
            user: user.toSafeObject()
        });
    } else return res.json({});

})

router.post('/', validateLogin, asyncHandler(async(req, res, next) => {
    const { credential, password } = req.body;

    const user = await User.login({credential, password});

    if (!user) {
        const err = new Error ('Login failed!');
        err.status = 401;
        err.title = 'Login Failed';
        err.errors = ['The provided credentials are invalid!'];
        return next(err);
    }

    await setTokenCookie(res, user);

    return res.json({
        user,
    });
}));

router.put('/:id', requireAuth, asyncHandler (async (req, res ) => {
    console.log('put req.bo', req.body)
    const id = await User.update(req.body,
        {
        where: { id: req.params.id },
    //   returning: true,
    //   plain: true
    }
      )
    // const user = await User.
    return res.json(id)

}))

router.delete('/', (_req, res) => {
    res.clearCookie('token');
    return res.json({message: 'success!!!'});
});


module.exports = router;
