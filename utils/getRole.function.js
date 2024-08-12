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




function makeAlert(req, res, next) {
    // const confirmation = confirm('You cannot restore the previous Data. Do you want to proceed?');

    // if (!confirmation) {
    //     return res.send('Reset aborted');
    // }

    next();
}
function func(para)
{
    return (req,res,next) =>
    {
        console.log("func called");
    next();
}
}

module.exports = {
    authUser,
    authRole,
    makeAlert,
    checkUser,func
}