var express = require('express');
const { response } = require('../app');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers');
const usersHelpers = require('../helpers/users-helpers');
var sessionstorage = require('node-sessionstorage')
const verifyLogin=(req,res,next)=>{
  if (req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}


/* GET users listing. */
router.get('/', function(req, res, next) {
  let user=req.session.user
  console.log(user);
  productHelpers.getAllFilims().then((filims)=>{
  res.render('users/view-all-events',{admin:false,filims,user})
  })
});
router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
      res.redirect('/')
  }else{
    res.render('users/login',{'loginErr':req.session.logginErr,style:'login.css'})
    req.session.logginErr=false
  }
})

router.get('/signup',(req,res)=>{
  res.render('users/signup',{style:'signup.css'})
});
router.post('/signup',(req,res)=>{
  usersHelpers.doSignUp(req.body).then((response)=>{
   req.session.loggedIn=true
   req.session.user=response
   res.redirect('/')
  })
});
router.post('/login',(req,res)=>{
 
  usersHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      
    req.session.user=response.user
    req.session.loggedIn=true
      // logedIn user data send  to session
      res.redirect('/')
    }else{
      req.session.logginErr="Invalid User Name and Password"
      res.redirect('/login')
    }
  })
});
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
});

router.get('/select-place/:id',verifyLogin,async(req,res)=>{

  let filimId=req.params.id
  let user=req.session.user
  
 
 let places = await usersHelpers.selectPlace()
  usersHelpers.getFilim(filimId).then((filimDetails)=>{
    console.log("Router",filimDetails);
    res.render('users/select-place',{places,filimId,user,filimDetails,style:'select-place.css'})
  })

 
});

router.get('/show-theaters',(req,res)=>{
  
  res.render('users/show-theaters',{user:req.session.user,})
})

router.post('/select-place',(req,res)=>{
  let data=req.body
   usersHelpers.getPlace(data).then((getTheater)=>{
    
     res.render('users/show-theaters',{getTheater,user:req.session.user})
    
  })
   }); 

  router.get('/show-filim-theater/:id',async(req,res)=>{

    let theaterId=req.params.id
    let email=await usersHelpers.getTheaterEmail(theaterId)
    // const emailJSON = JSON.stringify(email);
    
    sessionstorage.setItem('Email',email)    
    console.log('storage',sessionstorage.getItem('Email'));              //theater details

    usersHelpers.getFilimInTheater(theaterId).then((myShows)=>{
     
      res.render('users/show-filim-theater',{myShows,user:req.session.user})
    })
 });

 router.get('/pan-screen1/:id',(req,res)=>{
   let filimId=req.params.id
 
 res.render('theater-seats/pan-screen1',{style:'pan-seat1.css',user:req.session.user,filimId})
 })

 router.get('/booking-success',(req,res)=>{
  res.render('users/booking-success',{user:req.session.user})
}) ;

router.post('/place-booking',(req,res)=>{
  console.log("router",req.body);
   let storage= sessionstorage.getItem('Email')
   
  usersHelpers.doTicketBooking(req.body,storage).then((bookingId)=>{
    console.log("router",bookingId);
    usersHelpers.generateRazorPay(bookingId).then((response)=>{
    
      res.json(response)
    })
  })
})
router.post('/verify-payment',(req,res)=>{
  console.log("post details",req.body);
  usersHelpers.verifyPayment(req.body).then(()=>{
   
    res.json({status:true})


  }).catch((err)=>{
    console.log(err);
     res.json({status:false,errMsg :''})
   })
}) 
router.get('/view-details',async(req,res)=>{
  let storage= sessionstorage.getItem('Email') 
  
 let userD=await usersHelpers.getBookingDetails(req.session.user._id)
 let filim=await usersHelpers.getFilimDetails(req.session.user._id)
 let theater=await usersHelpers.getTheaterDetails(storage)
 console.log("Router $%",userD);
 console.log("Router##",theater);
 console.log("Router ++",filim);  
  res.render('users/view-details',{userD,filim,theater,user:req.session.user})
}) 
         
module.exports = router;
     