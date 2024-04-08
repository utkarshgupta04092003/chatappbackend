const { text } = require('express');
const Messages = require('../model/messageModel');

// controller to add message data in db
const addMessage = async (req, res, next) =>{
    try{
        console.log('add msg',req.body);
        const {from, to, message} = req.body;
        const data = await Messages.create({
            message: { text: message},
            users: [from, to],
            sender : from
        })
        if(data){
            return res.status(200).json({msg: 'Message send successfully', status: true })
        }
        else{
            return res.status(200).json({msg: 'Failed to send message', status: false})
        }
    }
    catch(err){
        return res.status(200).json({msg: 'Internal Server Error', status: false});
    }

}

const getAllMessage = async (req, res, next) =>{
    try{

        const {from, to} = req.body;
        const messages = await Messages.find({
            users: {
                $all: [from, to],
            }
        }).sort({updatedAt: 1});
        const projectedMessages = messages.map((msg)=>{
            return {
                fromSelf: (msg.sender.toString() === from),
                message: msg.message.text
            }
        });
        return res.status(200).json({msg: projectedMessages, status: true})
    }
    catch(err){
        return res.status(200).json({msg: 'Internal Server Error', status: false});
    }
}

module.exports = {addMessage, getAllMessage};
