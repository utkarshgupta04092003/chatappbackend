const groupMessagesModel = require("../model/groupMessagesModel");
const ChatroomsModel = require("../model/chatroomsModel");
const Users = require("../model/userModel");


const createChatroom = async (req, res, next) => {
    try {
        // console.log(req.body);
        // console.log('create chatroom working');
        const formData = req.body.formData;
        const currUser = req.body.currUser;

        const chatroom = await ChatroomsModel.findOne({ groupName: formData.name });
        if (chatroom) {
            // console.log('Chatroom found:', chatroom);
            return res.json({ msg: 'Chatroom exist already', status: false });
        }
        const groupDetails = {
            groupName: formData.name,
            groupDescription: formData.description,
            creatorId: currUser._id,
            users: [currUser._id]
        }
        // console.log(groupDetails);
        const data = await ChatroomsModel.create(groupDetails);
        // console.log('data', data);
        return res.json({ msg: `Chatroom ${data.groupName} created successfully`, status: true });
    }
    catch (err) {
        // console.log(err);
        return res.json({ msg: 'Internal server error', status: false })
    }
}


const getAllChatrooms = async (req, res, next) => {


    try {
        // console.log('get all chtrooms', req.body.currUser);
        const userId = req.body?.currUser._id;
        // console.log('curr user id', userId);
        const chatrooms = await ChatroomsModel.find({
            $or: [
                { creatorId: userId }, // Find chatrooms where the user is the creator
                { users: userId }     // Find chatrooms where the user is in the list of users
            ]
        });
        // console.log('Chatrooms:', chatrooms);
        return res.json({ msg: 'Get all chatrooms successfully', status: true, chatrooms });

    }
    catch (err) {
        // console.log(err);
        return res.json({ msg: 'Internal server error', status: false });
    }


}


const getChatroomChat = async (req, res, next) => {

    try {
        // Find the chatroom by its ID
        const groupName = req.params.groupName;
        const chatroom = await ChatroomsModel.find({ groupName }).populate('users');

        // console.log('cahtrom chat', chatroom);
        if (!chatroom || chatroom.length == 0) {
            return res.status(200).json({ msg: 'Chatroom not found', status: false });
        }

        return res.status(200).json({ msg: 'fetch particular chatroom chat successfully', status: true, chatroom: chatroom[0] });

    } catch (error) {
        // console.error('Error adding user to chatroom:', error);
        return res.status(200).json({ msg: 'Internal server error', status: false });
    }
}

const addUserTochatroom = async (req, res, next) => {
    const { chatroomId, username } = req.body;

    try {
        // Find the chatroom by its ID
        const chatroom = await ChatroomsModel.findById(chatroomId).populate('users');

        // const chatroom = await ChatroomsModel.findById(chatroomId);
        const userData = await Users.find({ username });
        // console.log('username', username);
        // console.log('add user data:', userData);

        if (!userData || userData.length == 0) {
            return res.status(200).json({ msg: 'Username does not exist, username is case sensitive', status: false });
        }

        if (!chatroom) {
            return res.status(200).json({ msg: 'Chatroom not found', status: false });
        }

        // Check if this user if already exist or not
        const isAlreadyAdded = chatroom.users.filter((user) => user.username === username);
        // console.log('already added', chatroom.users);
        if (isAlreadyAdded.length != 0) {
            return res.status(200).json({ msg: 'User already added', status: false });
        }

        // Add the user's ID to the users array
        chatroom.users.push(userData[0]._id);

        // Save the updated chatroom document
        await chatroom.save();
        const modifiedchatroom = await chatroom.populate('users');
        // console.log('chatroom:', chatroom);
        return res.status(200).json({ msg: 'User added to chatroom successfully', status: true, chatroom: modifiedchatroom });
    } catch (error) {
        console.error('Error adding user to chatroom:', error);
        return res.status(500).json({ message: 'Internal server error', status: false });
    }
}

const deleteChatroom = async (req, res, next) => {
    // console.log('delete chatroom called', req.body);

    try {
        const chatroomId = req.body?.groupData._id;
        // check the chatroom exist or not
        const isExist = await ChatroomsModel.findById(chatroomId);
        if (!isExist) {
            return res.json({ msg: "Chatroom does not exist", status: false });
        }

        
        try {
            // Delete all messages with groupId 123
            const result = await groupMessagesModel.deleteMany({ groupId: chatroomId });
            console.log(`\n\n${result.deletedCount} chatrooms messages deleted successfully\n\n`);
        } catch (error) {
            // console.error('Error deleting chatrooms:', error);
            return res.json({ msg: 'Error in deleting messages of chatroom', status: false });
        }
        // deleting chatroom
        const deletedChatroom = await ChatroomsModel.findByIdAndDelete(chatroomId);

        if (!deletedChatroom) {
            return res.status(200).json({ msg: 'Chatroom not found', status: false });
        }

        // console.log('deleted', deletedChatroom);

        return res.status(200).json({ msg: 'Chatroom deleted successfully', status: true });



    } catch (error) {
        console.error('Error deleting chatroom:', error);
        return res.status(200).json({ msg: 'Internal server error', status: false });
    }
}

const exitFromChatroom = async (req, res, next) => {
    try {
        const { groupId, userId } = req.body;

        const chatroom = await ChatroomsModel.findById(groupId);
        if (!chatroom) {
            return res.json({ msg: 'chatroom not found', status: false });
        }

        const users = chatroom.users;
        // console.log('goup users', users);
        const modifiedUsers = users.filter((user) => user._id != userId);
        // console.log('modified user', modifiedUsers);

        chatroom.users = modifiedUsers;

        await chatroom.save();


        return res.json({ msg: 'Exit successfully', status: true });

    }
    catch (errr) {
        // console.log(err);
        return res.json({ msg: 'Internal server error', status: false });
    }
}
module.exports = { createChatroom, getAllChatrooms, getChatroomChat, addUserTochatroom, deleteChatroom, exitFromChatroom };
