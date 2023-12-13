const express = require('express');
const router = express.Router();
const User = require('./../models/User');
const bcrypt = require('bcrypt');

const saltRounds = 10;

router.post('/signup', async (req, res) => {
    try {
        let { name, email, password, dateOfBirth } = req.body;

        // Trim and sanitize inputs
        name = name.trim();
        email = email.trim();
        password = password.trim();
        dateOfBirth = dateOfBirth.trim();

        // Validation
        if (!name || !email || !password || !dateOfBirth) {
            return res.json({
                status: "FAILED",
                message: "Empty input fields!"
            });
        } else if (!/^[a-zA-Z ]*$/.test(name)) {
            return res.json({
                status: "FAILED",
                message: "Invalid name entered"
            });
        } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            return res.json({
                status: "FAILED",
                message: "Invalid email entered"
            });
        } else if (isNaN(Date.parse(dateOfBirth))) {
            return res.json({
                status: "FAILED",
                message: "Invalid date of birth entered"
            });
        } else if (password.length < 8) {
            return res.json({
                status: "FAILED",
                message: "Password is too short!"
            });
        }

        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({
                status: "FAILED",
                message: "User with provided email already exists"
            });
        }

        // Hash password
        const hashPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashPassword,
            dateOfBirth
        });

        // Save user to the database
        const savedUser = await newUser.save();

        res.json({
            status: "SUCCESS",
            message: "Signup successful",
            data: savedUser
        });
    } catch (error) {
        console.error(error);
        res.json({
            status: "FAILED",
            message: "An error occurred during signup"
        });
    }
});

router.post('/signin', async (req, res) => {
    try {
        let { email, password } = req.body;

        // Trim and sanitize inputs
        email = email.trim();
        password = password.trim();

        // Validation
        if (!email || !password) {
            return res.json({
                status: "FAILED",
                message: "Empty input fields!"
            });
        }

        // Check for existing user
        const data = await User.find({ email });

        if (data.length) {
            const hashedPassword = data[0].password;

            // Compare passwords
            const result = await bcrypt.compare(password, hashedPassword);

            if (result) {
                res.json({
                    status: "SUCCESS",
                    message: "Signin successful",
                    data: data
                });
            } else {
                res.json({
                    status: "FAILED",
                    message: "Invalid password entered"
                });
            }
        } else {
            res.json({
                status: "FAILED",
                message: "Invalid credentials entered"
            });
        }
    } catch (error) {
        console.error(error);
        res.json({
            status: "FAILED",
            message: "An error occurred during signin"
        });
    }
});

module.exports = router;