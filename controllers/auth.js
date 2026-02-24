const User = require('../models/User');

// @desc     Register user
// @route    POST /api/v1/auth/register
// @access   Public
const sendTokenResponse=(user,statusCode,res)=>{
    const token = user.getSignedJwtToken() ; 

    const options ={
        expires:new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 *60 *60 *1000),
        httpOnly:true
    }

    if(process.env.NODE_ENV === 'production'){
        options.secure = true ;
    }
    res.status(statusCode).cookie('token',token,options).json({
        success:true,
        token
    })
}
exports.register = async (req, res, next) => {
    try{
        const {name , telephone, email , password , role} = req.body ;
        // remove role cause we don't want users to choose their role(security issue)
        // if we want to add admin we will do it from database directly
        const user = await User.create({
            name,
            telephone,
            email,
            password
        });

        // const token=user.getSignedJwtToken();
        // res.status(200).json({ success: true,token });
        sendTokenResponse(user,200,res);
    } catch(err){
        res.status(400).json({success:false}) ; 
        console.log(err.stack);
    }
};

exports.login = async(req,res,next) => {
    try{
        const {email , password} = req.body ; 

    if(!email || !password){
        return res.status(400).json({success:false , msg:'please provide an email and password'});
    }

    const user = await User.findOne({email}).select('+password') ; 
    if(!user){
        return res.status(400).json({success:false , msg:'invalid credentials'});
    }

    const isMatch = await user.matchPassword(password) ; 
    if(!isMatch){
        return res.status(400).json({success:false , msg:'invalid credentials'});
    }

    // const token = user.getSignedJwtToken();

    // res.status(200).json({success:true , token})  ;
    sendTokenResponse(user,200,res);
    }catch(err){
        console.log(err.stack);
        res.status(400).json({success:false}) ;
    }
    
}

exports.logout = async(req,res,next) => {
    try{
        //change token -> none and expire it immediately(10 sec.)
    res.cookie('token','none',{
        expires:new Date(Date.now() + 10 * 1000),
        httpOnly:true
    });
    res.status(200).json({success:true , msg:'user logged out successfully'})  ;
    }catch(err){
        console.log(err.stack);
        res.status(400).json({success:false}) ;
    }
}

exports.getMe = async(req,res,next)=>{
    try{const user = await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        data:user
    })
    }catch(err){
        console.log(err.stack);
        res.status(400).json({success:false}) ;
    }
}
