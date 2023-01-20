var db=require('../config/connection')
var collection=require('../config/collection')
var objectId=require('mongodb').ObjectId
const bcrypt=require('bcrypt')

module.exports={
    getAllFilims:()=>{
        return new Promise(async(resolve,reject)=>{
           let filims=await db.get().collection(collection.FILIM_COLLECTION).find().toArray()
          
           resolve(filims)
        })
    },
    doSignup4Theater:(theaterUserdata)=>{
        return new Promise(async(resolve,reject)=>{
            theaterUserdata.Password=await bcrypt.hash(theaterUserdata.Password,10)
            db.get().collection(collection.THEATER_USER_COLLECTION).insertOne(theaterUserdata).then((data)=>{
                resolve(data.insertedId)
            })
        })
    },
    doLogin4Theater:(theaterData)=>{
        let status=false
        let response={}
        return new Promise(async(resolve,reject)=>{
            let theater=await db.get().collection(collection.THEATER_USER_COLLECTION).findOne({Email:theaterData.Email})
           if(theater){
           bcrypt.compare(theaterData.Password,theater.Password).then((status)=>{
            if(status){
                console.log('Login Success');
                response.theater=theater //theater data
                response.status=true
                resolve(response)
            }else{
                console.log('Password Incorrect');
                resolve({status:false})
            }
           })
           }else{
            console.log('Email Incorrect');
            resolve({status:false})
           }
        })
    },
    addToScreen:(filimId,theaterId)=>{

         return new Promise(async(resolve,reject)=>{
           let myScreen=await db.get().collection(collection.THEATER_SCREEN_COLLECTION).findOne({theater:objectId(theaterId)})
               console.log('helpers',myScreen);
               if(myScreen){
                 db.get().collection(collection.THEATER_SCREEN_COLLECTION).updateOne({theater:objectId(theaterId)},
                 {
                    $push:{myFilims:objectId(filimId)}
                
                }).then((response)=>{
                    
                    resolve()
                
                })
               }else{
                let theaterUser= await db.get().collection(collection.THEATER_USER_COLLECTION).findOne({_id:objectId(theaterId)})
                 console.log('T user',theaterUser);
                if(theaterUser){
                  const  adminTheater= await db.get().collection(collection.THEATER_COLLECTION).findOne({Email:theaterUser.Email})
                    console.log('admin',adminTheater);
                    let  screenObj={
                        theater:objectId(theaterId),
                        AdminTheater:adminTheater.Email,
                        myFilims:[objectId(filimId)]
                    }
                    db.get().collection(collection.THEATER_SCREEN_COLLECTION).insertOne(screenObj).then(()=>{
                        resolve()
                    })
                }
                 
                }
            })
         
    },
    getMyShows:(theaterId)=>{
        return new Promise(async(resolve,reject)=>{
        let shows= await  db.get().collection(collection.THEATER_SCREEN_COLLECTION).aggregate([
            
            {
                $match:{theater:objectId(theaterId)}
            },
            {
                $lookup:{
                    from:collection.FILIM_COLLECTION,
                    let:{filimList:'$myFilims'},
                    pipeline:[
                        {
                            $match:{
                                $expr:{
                                    $in:['$_id',"$$filimList"]
                                }
                                
                            }
                        }
                    ],
                    as:'myShows'
                }
            }
        ]).toArray()
         console.log('helpers',shows);
           resolve(shows[0].myShows)
        })
        
    },
    removeMyshow:(filimId,theaterId)=>{
        console.log(filimId);
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.THEATER_SCREEN_COLLECTION).updateOne({theater:objectId(theaterId)},{
               
                $pull:{myFilims:objectId(filimId )}

            }
            ).then((response)=>{
                console.log(response);
                resolve(response)
            })
        })
    },
    getFilimCount:(theaterId)=>{
      
        return new Promise(async(resolve,reject)=>{
            let count=0
            let  myShows=await db.get().collection(collection.THEATER_SCREEN_COLLECTION).findOne({theater:objectId(theaterId)})
            console.log(myShows);
            if(myShows){
               count=myShows.myFilims.length
            }
            resolve(count)
        })
    }

}