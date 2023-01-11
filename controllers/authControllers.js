const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { error, success } = require('../utils/responseWrapper');

const signupController = async(req,res) => {
    try {
        
        const {name, email, password} = req.body; //because of middleware (body parser)

        if(!name || !email || !password){
            return res.send(error(400, "All fields are required!"))
        }

        const oldUser = await User.findOne({email});
        if(oldUser) {
            return res.send(error(409, "User is alredy registered, login with this id"))//conflict status code
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        const newUser = await User.findById(user._id);
        
        return res.send(success(201,'User created successfully'))
        
    } catch (e) {
        console.log(e);
        res.send(error(500,e.mesage));
    }
}

const loginController = async(req,res) => {
    try {
        const {email, password} = req.body; //because of middleware (body parser)

        if(!email || !password){
            return res.send(error(400, "All fields are required!"))
        }

        const user = await User.findOne({email}).select('+password');
        if(!user) {
            return res.send(error(404, "User is not registered, please signup!"))
        }

        const matched = await bcrypt.compare(password, user.password);
        if (!matched) {
            return res.send(error(409, "Incorrect password"))
        }

        const accessToken = generateAccessToken({
            _id: user._id 
        });
        const refreshToken = generateRefreshToken({
            _id: user._id 
        });

        res.cookie('jwt', refreshToken, {
              httpOnly: true,
              secure: true
        });

        return res.send(success(200, {accessToken}))
        //return res.json({accessToken});

    } catch (e) {
        console.log(e);
        res.send(error(500,e.mesage));
    }
}

// this will check the refreshToken validity and generate a new access token
const refreshAccessTokenController = async(req, res) => {
    const cookies = req.cookies;    
    if(!cookies.jwt) {
        return res.send(error(401, "Refresh token is required"))
    }

    const refreshToken = cookies.jwt;

    console.log('refresh', refreshToken);

    try {
        const decoded = jwt.verify(
            refreshToken, 
            process.env.REFRESH_TOKEN_PRIVATE_KEY
            );

        const _id=decoded._id;
        const accessToken = generateAccessToken({_id});
       
        return res.send(success(201, {accessToken}));

    } catch (e) {
        console.log(e);
        return res.send(error(401, "Invalid refresh token"))
    }
}

const logoutController = async (req, res) => {
    try {
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: true,
        })
        return res.send(success(200, 'user logged out'))
    } catch (e) {
        return res.send(error(500, e.message));
    }
}



//iternal functions
const generateAccessToken = (data) => {
    try {
        const token = jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE_KEY, {
            expiresIn: "1d", 
        });
        console.log(token);
        return token;
    }
    catch (e) {
        console.log(e);
    }
}
const generateRefreshToken = (data) => {
    try {
        const token = jwt.sign(data, process.env.REFRESH_TOKEN_PRIVATE_KEY, {
            expiresIn: "1y", 
        });
        console.log(token);
        return token;
    }
    catch (e) {
        console.log(e);
    }
}

module.exports= {
    signupController,
    loginController,
    refreshAccessTokenController,
    logoutController
}