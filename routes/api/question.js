const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//load person model
const Person = require("../../models/Person");
//load profile model
const Profile = require("../../models/Profile");
//load question model
const Question = require('../../models/Question');


//@type        GET
//@route       /api/question
//@desc        just for showing all questions
//@acess       PUBLIC 

router.get("/", (req, res) => {
  Question.find()
    .sort('-date')
    .then(questions =>res.json(questions))
    .catch(err=>res.json({noquestions:"no questions to display"}));
})

//@type        POST
//@route       /api/questions/
//@desc        route for submitting questions
//@acess       PRIVATE

router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const newquestion = new Question({
    textone: req.body.textone,
    texttwo: req.body.texttwo,
    user: req.user.id,
    name: req.body.name
  });
  newquestion
    .save()
    .then(question => res.json(question))
    .catch(err => console.log("unable to push question to database ") + err);
})


//@type        POST
//@route       /api/answers/:id
//@desc        just for submitting answers to question
//@acess       PRIVATE

router.post('/answers/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Question.findById(req.params.id)
    .then(question => {
      const newans = {
        user: req.user.id,
        name: req.body.name,
        text: req.body.text
      };
      question.answers.unshift(newans);

      question
        .save()
        .then(question => res.json(question))
        .catch(err => console.log(err))
    })
    .catch(err=>console.log(err));
})

//@type        POST
//@route       /api/question/upvote/:id
//@desc        just for upvoting
//@acess       PRIVATE

router.post('/upvote/:id', passport.authenticate("jwt", { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      Question.findById(req.params.id)
        .then(question => {
          if (question.upvotes.filter(upvote => upvote.user.toString() == req.user.id.toString()).length > 0) {
            return res.status(400).json({noupvote:"user already upvoted"})
          }
          question.upvotes.unshift({ user: req.user.id });
          question
            .save()
            .then(question=>res.json(question))
            .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err));
})

//assignment
//remove upvotin
//delete question
//delete all question


//create a seprate route for linux question

module.exports = router;
