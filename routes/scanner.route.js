const router = require('express').Router();
const Jimp = require('jimp');
const QrCode = require('qrcode-reader');
const mongoose = require('mongoose');

const User = require('../models/user.model.js');

// Initialize scanCompleted flag
let scanCompleted = false;

router.get('/', async (req, res) => {
    scanCompleted = false; // Reset the flag when the page is loaded
    res.render('scan-qr');
});

router.post('/', async (req, res) => {
    if (scanCompleted) {
        return res.status(400).send('Scan already completed');
    }

    const imageData = req.body.image.replace(/^data:image\/jpeg;base64,/, '');
    const buffer = Buffer.from(imageData, 'base64');

    Jimp.read(buffer, (err, image) => {
        if (err) {
            console.error('Error processing image:', err);
            return res.status(500).send('Error processing image');
        }

        const qr = new QrCode();
        qr.callback = (err, value) => {
            if (err) {
                console.error('Error decoding QR code:', err);
                return res.status(500).send('Error decoding QR code');
            }

            console.log('QR Code Data:', value.result);

            const uID = value.result;

            // Find and update the user by `uid`
            User.findOneAndUpdate(
                { uid: uID }, // Query to find the document
                { $inc: { score: 5 } }, // Update operation
                { new: true, useFindAndModify: false } // Options
            )
                .then(updatedUser => {
                    if (updatedUser) {
                        console.log('User updated:', updatedUser);
                        scanCompleted = true; // Set the flag to true after successful scan
                        res.json({ redirect: '/users' }); // Send a redirect instruction to the client
                    } else {
                        console.log('User not found');
                        res.status(404).send('User not found');
                    }
                })
                .catch(err => {
                    console.error('Error updating user:', err);
                    res.status(500).send('Error updating user');
                });
        };

        // Start decoding the image
        qr.decode(image.bitmap);
    });
});

module.exports = router;
