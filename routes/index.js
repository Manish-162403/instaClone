var express = require("express");
var router = express.Router();
const userModel = require('./users');
const passport = require('passport');
const localStrategy = require("passport-local"); 
const upload = require('./multer');
 
passport.use(new localStrategy(userModel.authenticate()));
router.get('/',function(req,res){
  res.render('index',{footer:false});
});

router.get('/login',function(req,res){
  res.render('login',{footer:false});
});

router.get('/feed',isLoggedIn, function(req,res){
  res.render('feed',{footer:true});
});

router.get('/profile',isLoggedIn,function(req,res){
  res.render('profile',{footer:true});
});

router.get('/search',isLoggedIn,function(req,res){
  res.render('search',{footer:true});
});
 
router.get('/edit',isLoggedIn, function(req,res){
  res.render('edit',{footer:true});
});

router.post('/upload',isLoggedIn, function(req,res){
  console.log('req is',req)
  res.render('upload',{footer:true});
});

router.post('/update', upload.single('image'),async function(req,res){
  const updateData = {
    username : req.body.username, 
    name : req.body.name,
    bio : req.body.bio
  }
  const user = await userModel.findOneAndUpdate({username:req.session.passport.user},{$set : updateData},{new : true})
  console.log('user',user)
  console.log('updateData',updateData)
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect("/profile")
});

router.post('/register',function(req,res,next){
   const userData = new userModel({
     username : req.body.username,
     name : req.body.name,
     email : req.body.email,
   });

   userModel.register(userData, req.body.password)
   .then(function(){
     passport.authenticate("local")(req,res,function(){
      res.redirect("/profile");
     })
   })
});

router.post('/login',passport.authenticate("local",{
   successRedirect : "/profile",
   failureRedirect : "/login"
}), function(req,res){  
});

router.get('/logout', function(req,res,next){
   req.logout(function(err){
    if(err) {return next(err);}
    res.redirect('/');
   });
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()) return next();
  res.redirect("/login")
}





module.exports = router;