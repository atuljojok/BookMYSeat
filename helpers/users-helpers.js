var db=require('../config/connection')
var collection=require('../config/collection')
const bcrypt=require('bcrypt')
const { response } = require('../app')
var objectId=require('mongodb').ObjectId
const Razorpay = require('razorpay');
const { resolve } = require('path')

var instance = new Razorpay({
  key_id: 'rzp_test_Zykjk74kt9exMK',
  key_secret: 'Fmi0WqR0La1C53wtOeSo2UEi',
});

module.exports={
    doSignUp:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.Password=await bcrypt.hash(userData.Password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
               
               resolve(data.insertedId)
            })
        })
    },
    doLogin:(userData)=>{
       let loginstatus=false
       let response={}
        return new Promise(async(resolve,reject)=>{
         let   user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
         if(user){
            bcrypt.compare(userData.Password,user.Password).then((status)=>{
                if(status){
                    console.log('login success');
                    response.user=user
                    response.status=true
                    resolve(response)
                }else{
                    console.log('login Failed PAssword');
                    resolve({status:false})
                }
            })
         }else{
            console.log('Login failed Email');
            resolve({status:false})
         }
        })
    },
    selectPlace:()=>{
        return new Promise(async(resolve,reject)=>{
            let place= await db.get().collection(collection.THEATER_COLLECTION).aggregate([
                {
                    $group:{_id:'$Place'}
                },
                {
                    $sort:{_id:1}
                }
        ]).toArray()

            resolve(place)
        })
    },
    getFilim:(filimId)=>{
        
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.FILIM_COLLECTION).findOne({_id:objectId(filimId)}).then((data)=>{
                
                resolve(data)
            })
        })
    },
    getPlace:(data)=>{
        
        return new Promise(async(resolve,reject)=>{
            let theaters= await db.get().collection(collection.THEATER_COLLECTION).find({Place:data.Place}).toArray()
             
                 resolve(theaters)
 
           
           
           
        })
     },
     getTheaterEmail:(theaterId)=>{
         return new Promise(async(resolve,reject)=>{
        let email= await  db.get().collection(collection.THEATER_COLLECTION).aggregate([
            {
                $match:{_id:objectId(theaterId)}
            },
            {
                $project:{Email:1}
            },
          
           ]).toArray() 
           
             resolve(email)
         })
     },
     getFilimInTheater:(theaterId)=>{
         
        return new Promise(async(resolve,reject)=>{
           let adminTheater=await db.get().collection(collection.THEATER_COLLECTION).findOne({_id:objectId(theaterId)})
          
           if(adminTheater){
             let myShows=await  db.get().collection(collection.THEATER_SCREEN_COLLECTION).findOne({AdminTheater:adminTheater.Email})
            
             if(myShows){
                let myFilims= await db.get().collection(collection.THEATER_SCREEN_COLLECTION).aggregate([
                    {
                        $lookup:{
                                        from:collection.FILIM_COLLECTION,
                                        let:{filimDetails:'$myFilims'},
                                        pipeline:[
                                            {
                                                $match:{
                                                    $expr:{
                                                        $in:['$_id',"$$filimDetails"]
                                                    }
                                                    
                                                }
                                            }
                                        ],
                                        as:'theaterShows'
                                    }
                    }
                ]).toArray()
               
                resolve(myFilims[0].theaterShows)
             }
           }
        })
     },
     doTicketBooking:(bookingDetails,theaterDetails)=>{
        console.log(theaterDetails);
        return new Promise((resolve,reject)=>{
            let bookingObj={
                userID:objectId(bookingDetails.userID),
                filimID:objectId(bookingDetails.filimID),
               
               
                    Admits:bookingDetails.userTotalCount,
                    ShowTime:bookingDetails.userTime,
                    SelectedSeats:bookingDetails.userSelectedSeats,
                    PriceRange:bookingDetails.userSelectedPrice,
                    TotalPrice:bookingDetails.userTotalPrice,
                    theater:theaterDetails[0].Email,
                    Payment:"Online",
                    Date: new Date()
                
            }
            db.get().collection(collection.BOOKING_DETAILS).insertOne(bookingObj).then((data)=>{
                resolve(data.insertedId)
            })
        })
     },
     generateRazorPay:(bookingId)=>{
          return new Promise(async(resolve,reject)=>{
            let bookingDetails=await db.get().collection(collection.BOOKING_DETAILS).findOne({_id:objectId(bookingId)})
            var options = {
                amount: bookingDetails.TotalPrice*100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: ""+bookingId,
              };
              instance.orders.create(options, function(err, order) {
                if(err){
                    console.log(err);
                }else{
                    console.log("order details :",order);
                    resolve(order)
                }
                
              });
          })
     },
     verifyPayment:(details)=>{
        console.log("Detail @@:",details);
        return new Promise(async(resolve,reject)=>{
            var crypto = require("crypto");
            let hmac= crypto.createHmac('sha256','Fmi0WqR0La1C53wtOeSo2UEi')
         
           hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
           hmac=hmac.digest('hex')
           if(hmac == details[ 'payment[razorpay_signature]']){
            resolve()
           }else{
            reject()
           }
        })
     },
     getBookingDetails:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let user= await db.get().collection(collection.BOOKING_DETAILS).find({userID:objectId(userId)}).sort({_id:-1}).limit(1).toArray()
           
           
            
           
            resolve(user[0])
        })
     },
     getFilimDetails:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let filim= await db.get().collection(collection.BOOKING_DETAILS).aggregate([
                {
                    $match:{userID:objectId(userId)}
                },
               
                {
                    $lookup:{
                        from:collection.FILIM_COLLECTION,
                        localField:'filimID',
                        foreignField:'_id',
                        as:'Filim'
                    }
                },
              
                {
                    $unwind:'$Filim'
                },
                {
                   $project:{'Filim.Name':'$Filim.Name'}
                },

                
            ]).sort({_id:-1}).limit(1).toArray()
           
            resolve(filim[0])
        })
     },
     getTheaterDetails:(email)=>{
       
        return new Promise(async(resolve,reject)=>{
        let  theater = await db.get().collection(collection.THEATER_COLLECTION).findOne({Email:email[0].Email})
        
        resolve(theater)
        })
     }
}  
