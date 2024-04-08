const bcrypt = require('bcrypt');
const Users = require('../model/userModel');


const register = async (req, res, next) => {

    try {
        const { username, email, password } = req.body;
        const usernameCheck = await Users.findOne({ username });

        // check for existance of username
        if (usernameCheck) {
            res.status(200).json({ msg: "Username already exists", status: false });
            return;
        }

        // check for existance of email
        const emailCheck = await Users.findOne({ email })
        if (emailCheck) {
            res.status(200).json({ msg: "Email already exists", status: false });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // create user into database
        const user = await Users.create({
            username, email, password: hashedPassword
        });
        delete user.password;
        return res.status(200).json({ msg: `${user.username} registered successfully`, status: true });
    }

    catch (err) {
        console.log(err);
        console.error(err);
        return res.status(200).json({ msg: 'Internal server error', status: false });
    }
}


const login = async (req, res, next) => {
    console.log(req.body);

    try {
        const { username, password } = req.body;
        const user = await Users.findOne({ username });
        // check user is exist or not
        if (!user) {
            return res.status(200).json({ msg: 'Incorrect username or password', status: false });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        // check password is correct or not
        const result = await bcrypt.compare(password, user.password);
        // return result based on matching
        if (!result) {
            return res.status(200).json({ msg: 'Incorrect username or password', status: false });
        }
        return res.status(200).json({ msg: `${user.username} loggedin successfully`, status: true, user });
    }
    catch (err) {
        return res.status(200).json({ msg: 'Internal server error', status: false });
    }
}


const setAvatar = async (req, res, next)=>{
    try{
        const id = req.params.id;
        const avatarImage = req.body.image;
        console.log(id);
        console.log(avatarImage);
        const userData = await Users.findByIdAndUpdate(id, {
            isAvatarImageSet: true,
            avatarImage: avatarImage
        }, {new: true})
        console.log(userData);
        return res.status(200).json({msg: 'Profile updated successfully', status: true, user: userData});
    }
    catch(err){
        console.log(err);
        return res.status(200).json({msg: 'Something went wrong', status: false});
    }
}



const getAllUsers = async (req, res, next) =>{
    console.log('alluser controller');
    try{
        const currUser = req.params.id;
        console.log(currUser);
        const users = await Users.find({_id: {$ne: currUser}}).select([
            "email", 'username', 'avatarImage', '_id'
        ])
        console.log(users);

        return res.status(200).json({msg: 'successfully fetch all users',status: true, users});
    }
    catch(err){
        return res.status(200).json({msg: 'Internal server error', status: false});
    }
}

module.exports = { register, login , setAvatar, getAllUsers}