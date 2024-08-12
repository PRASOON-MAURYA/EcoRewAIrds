const router = require('express').Router();

const User = require('../models/user.model.js');



router.get('/:id', async (req, res, next) => {

    const { userType } = req.params;
    //   res.render('login', { userType });
    const role = req.user.role;
    if (role === 'user') {

        try {

            res.render('balance-score', { type: "user", pageKind: "Score" });

        } catch (err) {
            console.error('Error:', err);
            // Handle the error
            // For instance: res.render('errorPage');
        }

    }
    else {
        res.render('notifications', { type: "NOT LOGin" });
    }
});

router.get('/:id/update', async (req, res, next) => {

    const { id } = req.params;



    const u = await User.findById(id);
    res.render('score-edit', { u });
});

router.post('/update', async (req, res, next) => {

    console.log(req.body);

    const id = req.body.userID;
    const redirectUrl = '/users/';


    const temp = {
        name: req.body.name,
        email: req.body.email,
        score: req.body.score,
        balance: req.body.balance
    }
    User.findByIdAndUpdate(id, temp)
        .then(() => console.log('Score updated'))
        .catch(err => console.error(err));



    res.redirect(redirectUrl);


});


module.exports = router;