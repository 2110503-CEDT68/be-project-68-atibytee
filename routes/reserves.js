const express = require('express');
const {getReservations,addReservation,getReservation,updateReservation,deleteReservation} = require('../controllers/reserves');

const router = express.Router({mergeParams:true});

const {protect , authorize} = require('../middleware/auth');

router.route('/')
    .get(protect,getReservations)
    .post(protect,authorize('user','admin'),addReservation);
router.route('/:id')
    .get(protect,getReservation)
    .put(protect,authorize('admin','user'),updateReservation)
    .delete(protect,authorize('admin','user') ,deleteReservation);

module.exports = router ;