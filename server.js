const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const logger = require("morgan");
const db = require("./models");

const app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/workout", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

app.use(express.static("public"));

// API ROUTES

// GET /api/workouts
app.get("/api/workouts", function (req, res) {
  db.Workout.find({}, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    };
  });
});
// POST /api/workouts
app.post("/api/workouts", function (req, res) {
  console.log(req.body);
  db.Workout.create(req.body, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    };
  });
});
// PUT /api/workouts/:id
app.put("/api/workouts/:id", function (req, res) {
  console.log(req.body);
  db.Workout.findByIdAndUpdate(req.params.id, { $push: { exercises: req.body } }, { new: true, runValidators: true }, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    };
  });
});
// Get /api/workouts/range LIMIT 7
app.get("/api/workouts/range", function (req, res) {
  db.Workout.find({}).exec(function (err, data) {
    if (err) {
      console.log(err);
      res.end()
    } else {
      let newArr = [];

      const addDate = async () => {
        let currentLength = newArr.length
        let dateOffset = (24 * 60 * 60 * 1000) * currentLength;
        let dateToSearch = new Date();
        dateToSearch.setTime(dateToSearch.getTime() - dateOffset);

        console.log("searching...");
        console.log(dateToSearch);

        newArr.unshift(data.find(item => dateToSearch.toString().substring(4, 15) == new Date(item.day).toString().substring(4, 15))? data.find(item => dateToSearch.toString().substring(4, 15) == new Date(item.day).toString().substring(4, 15)): { exercises: [{duration: 0}] })
        if (newArr.length < 7) {
          addDate()
        }
      };
      
      addDate()
      
      console.log("new arr made")
      res.json(newArr);
    };
  })
  // db.Workout
  //   .find({})
  //   .sort({ 'day': 1 })
  //   .limit(7)
  //   .sort({ 'day': 1 })
  //   .exec(function (err, data) {
  //     console.log(data);
  //     if (err) {
  //       console.log(err);
  //       res.end()
  //     } else {
  //       res.json(data);
  //     };
  //   });


  // db.Workout.find({published: true}).sort({'day': -1}).limit(7).exec()
  // .then{
  //   console.log("data:");
  //   console.log(data);
  //   if (err) {
  //     console.log(err);
  //     res.end()
  //   } else {
  //     res.json(data);
  //   };
  // });
});

// HTML ROUTES 

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "public/index.html"))
});

app.get("/exercise", function (req, res) {
  res.sendFile(path.join(__dirname, "public/exercise.html"))
});

app.get("/stats", function (req, res) {
  res.sendFile(path.join(__dirname, "public/stats.html"))
});

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`)
})

