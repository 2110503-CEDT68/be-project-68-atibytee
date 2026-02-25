const express = require('express');
const {getCoworkingSpaces,getCoworkingSpace,createCoworkingSpace,updateCoworkingSpace,deleteCoworkingSpace} = require('../controllers/coworkingspaces');
const appointmentRouter = require('./reserves')
const router = express.Router() ;

const {protect,authorize} = require('../middleware/auth');


// rename
router.use('/:roomId/reserves/' ,appointmentRouter );

const app = express();

router.route('/').get(getCoworkingSpaces).post(protect,authorize('admin'), createCoworkingSpace);
router.route('/:id').get(getCoworkingSpace).put(protect,authorize('admin'), updateCoworkingSpace).delete(protect,authorize('admin'), deleteCoworkingSpace);

module.exports = router;