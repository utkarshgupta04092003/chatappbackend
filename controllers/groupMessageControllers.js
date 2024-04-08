const GroupMessagesModel = require('../model/groupMessagesModel');
const ChatroomModel = require('../model/chatroomsModel');

const addMessage = async (req, res, next) =>{

    console.log('add msg called', req.body);
    try{
        const {groupId, userId, content, userName, userAvatar} = req.body;

        const chatroom =  await ChatroomModel.findById(groupId);
        if(!chatroom){
            return res.json({msg: 'chatroom not found', status: false})
        }

        // console.log('chatroom',chatroom)
        
        const chatroommsg = await GroupMessagesModel.create({
            groupId: groupId,
            senderId: userId,
            content: content,
        })

        if(!chatroommsg){
            return res.json({msg: 'Error in adding message', status: false});
        }

        chatroom.message.push(chatroommsg);
        await chatroom.save();
        const messages = await GroupMessagesModel.find({ groupId: groupId }).populate({
            path: 'senderId',
            select: 'username avatarImage'
        });

        return res.json({msg: 'Message Send successfully', stauts: true, messages: messages});
        


    }
    catch(err){
        console.log(err)
        return res.json({msg: 'Internal server error', status: false});
    }
}

const getMessage = async (req, res, next) =>{
    try {
        const {groupId} = req.body;
        const messages = await GroupMessagesModel.find({ groupId: groupId }).populate({
            path: 'senderId',
            select: 'username avatarImage'
        });

        return res.json({msg: 'Fetched all message of this group', stauts: true, messages});

      } catch (error) {
        console.error('Error fetching messages:', error);
        
        return res.json({msg: 'Internval sever error', status: false});
      }
}

module.exports = {addMessage, getMessage};