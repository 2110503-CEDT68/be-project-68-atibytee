const express = require('express');
const {getHospitals,getHospital,createHospital,updateHospital,deleteHospitals} = require('../controllers/hospitals');
const { deleteHospital } = require('../controllers/hospitals');
const appointmentRouter = require('./appointments')
const router = express.Router() ;

const {protect,authorize} = require('../middleware/auth');

router.use('/:hospitalId/appointments/' ,appointmentRouter );

const app = express();

router.route('/').get(getHospitals).post(protect,authorize('admin'), createHospital);
router.route('/:id').get(getHospital).put(protect,authorize('admin'), updateHospital).delete(protect,authorize('admin'), deleteHospital);

module.exports = router;