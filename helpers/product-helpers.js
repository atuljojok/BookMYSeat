var db=require('../config/connection')
var collection=require('../config/collection')
var objectId=require('mongodb').ObjectId
module.exports={
    addFilim:(filim,callback)=>{
        console.log(filim);
        db.get().collection(collection.FILIM_COLLECTION).insertOne(filim).then((data)=>{
            
            callback(data.insertedId )
        })
    },
    addTheater:(theaterData)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.THEATER_COLLECTION).insertOne(theaterData).then((data)=>{
                console.log(data);
                resolve(data.insertedId)
            })
        })
    },
    getAllFilims:()=>{
        return new Promise(async(resolve,reject)=>{
           let filims=await db.get().collection(collection.FILIM_COLLECTION).find().toArray()
          
           resolve(filims)
        })
    },
    getAllTheater:()=>{
        return new Promise((resolve,reject)=>{
            let theaterData=db.get().collection(collection.THEATER_COLLECTION).find().toArray()
            resolve(theaterData)
        })
    },
    deleteFilim:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.FILIM_COLLECTION).deleteOne({_id:objectId(proId)}).then((response)=>{
             console.log(response);
             resolve(response)
            })
        })
    },
    getFilimDetails:(filimId)=>{
        
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.FILIM_COLLECTION).findOne({_id:objectId(filimId)}).then((data)=>{
                
                resolve(data)
            })
        })
    },
    updateFilim:(filimId,filimDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.FILIM_COLLECTION).updateOne({_id:objectId(filimId)},
            {
                $set:{
                    Name:filimDetails.Name,
                    Discription:filimDetails.Discription,
                    Category:filimDetails.Category,
                   

                }
            }).then(()=>{
                resolve()
            })
        })
    }
}