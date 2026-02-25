const express = require('express');
const {getRooms,getRoom,createRoom,updateRoom,deleteRoom} = require('../controllers/rooms');
const appointmentRouter = require('./reserves')
const router = express.Router() ;

const {protect,authorize} = require('../middleware/auth');


// rename
router.use('/:roomId/reserves/' ,appointmentRouter );

const app = express();

router.route('/').get(getRooms).post(protect,authorize('admin'), createRoom);
router.route('/:id').get(getRoom).put(protect,authorize('admin'), updateRoom).delete(protect,authorize('admin'), deleteRoom);

module.exports = router;