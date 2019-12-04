const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const expressSanitizer = require('express-sanitizer');
const helmet = require('helmet');

// CONFIG
const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "pug");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(expressSanitizer());
app.use(helmet());

// MIDDLEWARE
const validateMusic = (req, res, next) => {
  req.body.title = req.sanitize(req.body.title);
  req.body.artist = req.sanitize(req.body.artist);
  req.body.album = req.sanitize(req.body.album);
  next();
}
app.use(validateMusic);

// MONGOOSE
mongoose.connect("mongodb://localhost/restfulpractice", { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);

const musicSchema = new mongoose.Schema({
  title: String,
  artist: String,
  album: String
});
const Music = mongoose.model('Music', musicSchema);

// ROUTES
// -- Index
app.get("/", (req, res) => {
  Music.find({}, (err, music) => {
    err ? console.error(err) : res.render("index", { music: music });
  });
});

// -- New
app.get("/new", (req, res) => {
  res.render("new");
});

// -- Create
app.post("/", (req, res) => {
  validateMusic;
  Music.create(req.body, (err, newMusic) => {
    err ? console.error(err) : res.redirect("/");
  });
});

// -- Show
app.get('/:id', (req, res) => {
  Music.findById(req.params.id, (err, music) => {
    err ? console.error(err) : res.render("show", { music: music });
  });
});

// -- Edit
app.get('/:id/edit', (req, res) => {
  Music.findById(req.params.id, (err, music) => {
    err ? console.log(err) : res.render("edit", { music: music });
  });
});

// -- Update
app.put('/:id', (req, res) => {
  validateMusic;
  Music.findByIdAndUpdate(req.params.id, req.body, (err, updatedMusic) => {
    err ? console.error(err) : res.redirect(updatedMusic.id);
  });
});

// -- Delete
app.delete('/:id', (req, res) => {
  Music.findByIdAndRemove(req.params.id, err => {
    err ? console.error(err) : res.redirect("/");
  });
});

// SERVER
app.listen(PORT, () => console.log(`Server Running On Port ${PORT}`));
