const router = require('express').Router();



router.get('/:id', async (req, res, next) => {

    const { userType } = req.params;
    //   res.render('login', { userType });
    const role = req.user.role;
    if (role === 'user') {

        try {
            //   // const result = await Notification.findOne({ email: req.user.email }).exec();
            //   const result = await Notification.findOneAndUpdate(
            //     { email: req.user.email }, // Find document with email and isRead = false
            //     { $set: { 'notifications.$[].isRead': true } }, // Update isRead to true for the matched notification
            //     { new: false } // Return the modified document after the update
            //   ).exec();

            //   console.log('Document found:', result);
            //   // Process the found document

            //   // Convert the notifications array to a standard JavaScript array
            //   const notificationsArray = result.toObject().notifications || [];
            //   // Reverse the array
            //   const reversedNotifications = notificationsArray.reverse();
            // result = result.reverse(); //not work
            // res.render('coins', { type: "user", notifications: reversedNotifications });
            res.render('balance-score', { type: "user", pageKind: "Balance" });
            // res.render('balance-coin', { type: "user", user: req.user });

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


module.exports = router;