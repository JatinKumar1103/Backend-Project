const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
//load person model
const Person = require("../../models/Person");
//load profile model
const Profile = require("../../models/Profile");

//@type        GET
//@route       /api/profile
//@desc        route for personal user profile
//@acess       PRIVATE

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (!profile) {
          return res.status(404).json({ profilenotfouund: "no profile found" });
        }
        res.json(profile);
      })
      .catch((err) => console.log("got some error in profile" + err));
  }
);

//@type        POST
//@route       /api/profile
//@desc        route for UPDATIN/SAVING personal user profile
//@acess       PRIVATE

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const profileValue = {};
    profileValue.user = req.user.id;
    if (req.body.username) profileValue.username = req.body.username;
    if (req.body.website) profileValue.website = req.body.website;
    if (req.body.country) profileValue.country = req.body.country;
    if (req.body.portfolio) profileValue.portfolio = req.body.portfolio;
    if (typeof req.body.languages !== undefined) {
      profileValue.languages = req.body.languages.split(",");
      }
      //get social links
      profileValue.social = {};
    if (req.body.youtube) profileValue.social.youtube = req.body.youtube;
    if (req.body.facebook) profileValue.social.facebook = req.body.facebook;
    if (req.body.instagram) profileValue.social.instagram = req.body.instagram;

    //Do databasse stuff
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (profile) {
          Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileValue },
            { new: true }
          )
            .then((profile) => res.json(profile))
            .catch((err) => console.log("problem in update " + err));
        } else {
          Profile.findOne({ username: profileValue.username })
            .then((profile) => {
              //username already exists
              if (profile) {
                res.status(400).json({ username: "username already exist" });
              }
              //save user
              new Profile(profileValue)
                .save()
                .then((profile) => res.json(profile))
                .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));
        }
      })
      .catch((err) => {
        console.log("problem in fetching profile " + err);
      });
  }
);


//@type        GET
//@route       /api/profile/:username
//@desc        route for getting user profile based on USERNAME
//@acess       PUBLIC

router.get('/:username', (req, res) => {
  Profile.findOne({ username: req.params.username })
    .populate('user',['name','profilepic'])
    .then(profile => {
      if (!profile) {
        res.status(404).json({usernotfound:"user not found"})
      }
      res.json({ profile });
    })
    .catch(err=>console.log("err in fetching username"+err));
})

//@type        GET
//@route       /api/profile/:id
//@desc        route for getting user profile based on USERNAME
//@acess       PUBLIC
//assignment

// router.get("/:id", (req, res) => {
//   Profile.findOne({ _id: req.params.id })
//     .populate("user", ["name", "profilepic"])
//     .then((profile) => {
//       if (!profile) {
//         res.status(404).json({ usernotfound: "user not found" });
//       }
//       res.json({ profile });
//     })
//     .catch((err) => console.log("err in fetching username" + err));
// });

//@type        GET
//@route       /api/profile/find/everyone
//@desc        route for getting user profile of everyone
//@acess       PUBLIC


router.get("/find/everyone", (req, res) => {
  Profile.find()
    .populate("user", ["name", "profilepic"])
    .then((profiles) => {
      if (!profiles) {
        res.status(404).json({ usernotfound: "No profiles was found" });
      }
      res.json({ profiles });
    })
    .catch((err) => console.log("err in fetching username" + err));
});

//@type        DELETE
//@route       /api/profile/
//@desc        route for deleting user based on ID
//@acess       PRIVATE

router.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
  Profile.findOneAndRemove({ user: req.user.id })
    .then(() => {
      Person.findOneAndRemove({ _id: req.user.id })
        .then(()=> res.json({success:'delete was a success'}))
        .catch(err=>console.log(err));
        
    })
    .catch(err=>console.log(err));
  
})

//@type        POST
//@route       /api/profile/mywork
//@desc        route for adding work profile of a person
//@acess       PRIVATE

router.post('/workrole', passport.authenticate('jwt',{session:false}), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const newwork = {
        role: req.body.role,
        company: req.body.company,
        country: req.body.country,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        details: req.body.details,
        
      };
      profile.workrole.unshift(newwork);
      profile.save()
        .then(profile=>res.json(profile))
        .catch(err=>console.log(err))
    })
    .catch(err => console.log(err));
})

//@type        DELETE
//@route       /api/profile/workrole/:w_id
//@desc        route for deleting a specific workrole
//@acess       PRIVATE

router.delete('/workrole/:w_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      //assignment to check if we got a profile
      const removethis = profile.workrole
        .map(item => item.id)
        .indexOf(req.params.w_id);
      
      profile.workrole.splice(removethis, 1);
      profile
        .save()
        .then(profile=>res.json(profile))
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err));
})

module.exports = router;
