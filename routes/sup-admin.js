var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('super-admin/super-main',{admin:true})
});

//Add Filims router
router.get('/add-filims',(req,res)=>{
  res.render('super-admin/add-filims',{admin:true})
});
router.post('/add-filims',(req,res)=>{
 
 
  productHelpers.addFilim(req.body,(id)=>{
    console.log(id);
    let image=req.files.Image
    image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
     if(!err){
      res.render('super-admin/add-filims',{admin:true})
     }else{
      console.log(err);
     }
    })
   
  })
});
//--------------------------------------------------------
//Theaters router
router.get('/add-theater',(req,res)=>{
  res.render('super-admin/add-theater',{admin:true})
});
router.post('/add-theater',(req,res)=>{
  productHelpers.addTheater(req.body).then((data)=>{
    res.render('super-admin/add-theater',{admin:true})
  })
  })
//----------------------------------------------
router.get('/view-all-filims',(req,res)=>{
 productHelpers.getAllFilims().then((filims)=>{

  res.render('super-admin/view-all-filims',{admin:true,filims})
 })
  
})
//---------------------------
router.get('/view-all-theater',(req,res)=>{
  productHelpers.getAllTheater().then((theaterDatas)=>{
    res.render('super-admin/view-all-theater',{theaterDatas,admin:true})
  })
 
})
router.get('/delete-filim/:id',(req,res)=>{
  
 let proId= req.params.id
 console.log(proId);
 productHelpers.deleteFilim(proId).then(()=>{
  res.redirect('/adminS/view-all-filims')
 })
})
router.get('/edit-filim/:id',async(req,res)=>{
  
 let filimDetails=await productHelpers.getFilimDetails(req.params.id)
  res.render('super-admin/edit-filim',{filimDetails})
  console.log(filimDetails);
}),
router.post('/edit-filim/:id',(req,res)=>{
 let id=req.params.id
  productHelpers.updateFilim(req.params.id,req.body).then(()=>{
    res.redirect('/adminS/view-all-filims')
    if(req.files.Image){
      let image=req.files.Image
      image.mv('./public/product-images/'+id+'.jpg')
    }
  })
})
module.exports = router; 
