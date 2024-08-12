// const router = require("./index.route");
const router = require('express').Router();
const User = require('../models/user.model.js');

// const { ensureAuthenticated } = require('../utils/permissions');

router.get('/', async (req, res, next) => {
    const users = await User.find();

    // Sort users based on balance and score
    users.sort((a, b) => {
        if (b.balance !== a.balance) {
            return b.balance - a.balance; // Sort by balance in descending order
        } else {
            return b.score - a.score; // If balances are the same, sort by score in descending order
        }
    });

    res.render('userslist', { role: "user", type: "", users });
    console.log("now");
});

module.exports = router;
