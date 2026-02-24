const Appointment = require('../models/Appointment');
const Hospital = require('../models/hospital')
// get all
exports.getAppointments = async(req,res,next) => {
    try{
        let query ;
        if(req.user.role !== 'admin'){
            query = Appointment.find({user:req.user.id}).populate({
                path:'hospital',
                select:'name province tel'
            });
        }
        else{
            if(req.params.hospitalId){
                console.log(req.params.hospitalId);
                query = Appointment.find({ hospital : req.params.hospitalId}).populate({
                    path:'hospital',
                    select:'name province tel'
                });
            }else{
                query = Appointment.find().populate({
                    path:'hospital',
                    select:'name province tel'
                });
            }
            
        }
        const appointments = await query ;
        res.status(200).json({success:true ,count:appointments.length ,data:appointments});
    }catch(err){
        return res.status(500).json({success:false , msg:"Cannot find an appointment"})
    }
}
//get single 
exports.getAppointment = async(req,res,next)=> {
    try{
        const appointment = await Appointment.findById(req.params.id).populate({
            path:'hospital',
            select : 'name description tel'
        })

        if(!appointment){
            return res.status(404).json({success:false , msg:`no appointment with id ${req.params.id}`})
        }
        return res.status(200).json({success:true , data:appointment});
    }catch(err){
        console.log(err);
        return res.status(500).json({success:false , msg:`cannot find an appointment`}) ;
    }
}
// add appt -> just use user as parameter
exports.addAppointment = async(req,res,next)=>{
    try{
        //check 3 appointments
        req.body.user = req.user.id ; 
        const exitedAppointments = await Appointment.find({user:req.user.id})
        if(exitedAppointments.length >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({success:false , msg:`the user with id ${req.body.id} has already made 3 appointments`}) ;
        }
        //auto set addtDate next 3 days
        if (!req.body.apptDate) {
            req.body.apptDate = new Date(Date.now() + 3*24*60*60*1000); 
        }
        //check if hospital exit
        req.body.hospital = req.params.hospitalId ; 
        const hospital = await Hospital.findById(req.params.hospitalId);
        if(!hospital){
           return res.status(404).json({success:false , msg:`cannot find the hospital with id ${req.params.hospitalId}`});
        }
        //create
        const appointment = await Appointment.create(req.body) ;
        return res.status(200).json({success:true , msg:appointment}) ;  
    }catch(err){
        console.log(err) ; 
        //additional *******
        if (err.name === 'ValidationError') {
            // This extracts the exact missing fields and sends them to the user
            const message = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, msg: message });
        }
        return res.status(500).json({success:false , msg:'cannot add an appointment'});
    }
}
// Update
exports.updateAppointment = async(req,res,next) => {
    try{
        //check if appointment exit
        let appointment = await Appointment.findById(req.params.id) ;
        if(!appointment){
            return res.status(404).json({success:false , msg:`cannot find an apointment with id ${req.params.id} `}) ;  
        }
        // check user id != appointment user id
        if(appointment.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false , msg:`user ${req.params.id} is not owner this appointment`})
        }
        //update
        appointment = await Appointment.findByIdAndUpdate(req.params.id , req.body,{
            new : true ,
            runValidators : true
        });
        return res.status(200).json({success : true , data : appointment}) ; 
    }catch(err){// can update with no data change
        return res.status(500).json({success:false , msg:'cannot update an appointment'});
    }
}
exports.deleteAppointment = async(req,res,next) => {
    try{
        //check if appointment exit
        const appointment = await Appointment.findById(req.params.id) ; 
        if(!appointment){
            return res.status(404).json({success:false , msg:`cannot find an apointment with id ${req.params.id} `}) ; 
        }
        //
        if(appointment.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false , msg:`user ${req.params.id} is not owner this appointment`})
        }
        //delete
        await appointment.deleteOne() ; 
        return res.status(200).json({success:true , data:{}});
    }catch(err){
        console.log(err) ; 
        return res.status(500).json({success:false , msg:'cannot delete an appointment'});
    }
}