function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash('info', 'You need to login first to view this page');
        // console.log(req.session);
        req.session.returnTo = req.originalUrl;
        // res.redirect('/auth/login/' + "teacher");
        res.render('login-links', { messages: req.flash() });
    }
}

function ensureNOTAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('back');
    } else {
        next();
    }
}

function authUser(req, res, next) {
    if (req.user == null) {
        res.status(403)
        return res.send('You need to sign in')
    }

    next();
}

function authRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            res.status(401)
            return res.send('Not allowed')
        }

        next();
    }
}

function checkUser(req, res, next) {
    console.log(123);

    const { id } = req.params;
    if (id !== req.user.id) {
        return res.redirect('back');
    }
    next();
}

function checkUserPostroute(req, res, next) {
    console.log(123);

    const { id } = req.body;
    if (id !== req.user.id) {
        req.flash('warning', "Not Allowed !!!")
        return res.redirect('/admin/teachers/');
    }
    next();
}


function makeAlert(req, res, next) {
    // const confirmation = confirm('You cannot restore the previous Data. Do you want to proceed?');

    // if (!confirmation) {
    //     return res.send('Reset aborted');
    // }

    next();
}


module.exports = {
    ensureAuthenticated,
    ensureNOTAuthenticated,
    authUser,
    authRole,
    makeAlert,
    checkUser,
    checkUserPostroute
}