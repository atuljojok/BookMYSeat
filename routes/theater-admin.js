var express = require('express');
var router = express.Router();
var theaterHelpers=require('../helpers/theater-helpers')
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/adminT/login')
  }
}

/* GET home page. */
router.get('/',async function (req, res, next) {

 let theater=req.session.theater
let filimCount=null
if(req.session.theater){
  filimCount=await theaterHelpers.getFilimCount(req.session.theater._id)
}

theaterHelpers.getAllFilims().then((filims)=>{
  res.render('theater-admin/theater-main',{adminT:true,filims,theater,filimCount})
})
 
});

router.get('/login',(req,res)=>{

 res.render('theater-admin/theater-login',{'loginErr':req.session.loginErr})
 req.session.loginErr=false
});

router.get('/signup',(re,res)=>{
res.render('theater-admin/theater-signup')
})

router.post('/signup',(req,res)=>{
  theaterHelpers.doSignup4Theater(req.body).then((response)=>{
    req.session.loggedIn=true
    req.session.theater=response
    res.redirect('/')
 
  })
});
router.post('/login',(req,res)=>{

  theaterHelpers.doLogin4Theater(req.body).then((response)=>{
    if(response.status){

      req.session.loggedIn=true
      req.session.theater=response.theater
     
      res.redirect('/adminT')
    }else{
      req.session.loginErr='Invalid Email or Pasword'
      res.redirect('/adminT/login')
    }
  })
});
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/adminT/login')
});

router.get('/my-screen',verifyLogin,async(req,res)=>{
 let myShows =await theaterHelpers.getMyShows(req.session.theater._id)
  console.log(myShows);
  res.render('theater-admin/my-screen',{myShows,adminT:true,theater:req.session.theater})
})

router.get('/add-to-screen/:id',(req,res)=>{
 console.log('api call');
 theaterHelpers.addToScreen(req.params.id,req.session.theater._id).then(()=>{
   res.json({status:true})
 })
});
router.get('/remove-show/:id',verifyLogin,(req,res)=>{
 theaterHelpers.removeMyshow(req.params.id,req.session.theater._id).then(()=>{
  console.log('remove',req.params.id);
  res.redirect('/adminT/my-screen')
 }) 
}) 
module.exports = router;
