const router = require('express').Router();

router.get('/', (req, res, next) => {
    // if(req.user)
    // console.log(req.user);
    // console.log(req.user.section);
    // console.log(req.user.class);
    // console.log(req.user.email);
    // console.log(req.user.role);
    // console.log(req.user.name);
    console.log(new Date().toISOString().split('T')[0]);
    // console.log(req.session);
    delete req.session.returnTo;
    // console.log(req.session);
    // console.log("pokjkkjjkj");


    res.render('index', { title: 'Welcome to my app!' });
});

module.exports = router;
