

const router = require('express').Router();
const { createChatroom , getAllChatrooms, getChatroomChat, addUserTochatroom, deleteChatroom, exitFromChatroom} = require('../controllers/chatroomController');

router.post('/createchatroom', createChatroom);
router.post('/getallchatrooms', getAllChatrooms);
router.post('/chatroomchat/:groupName', getChatroomChat);
router.post('/adduser', addUserTochatroom);
router.post('/deletechatroom', deleteChatroom);
router.post('/exitfromchatroom', exitFromChatroom);

module.exports = router;