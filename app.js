// modules
const express = require("express");
const session = require("express-session");
const Handlebars = require("handlebars");
const express_handlebars = require("express-handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const path = require("path");
const mongoose = require("mongoose");

//const dbConfig = require("./database/db.config")

const routerAdmin = require("./routes/admin");
const routerPublic = require("./routes/router");
const routerUser = require("./routes/usuarios")

require("./models/Categoria");
const Categoria = mongoose.model("categorias");
require("./models/Postagem");
const Postagem = mongoose.model("postagens");


const passport = require("passport");
require("./config/auth")(passport);

const app = express();

// session
app.use(
  session({
    secret: "blog-app-nodejs",
    resave: true,
    saveUninitialized: true,
  })
);

// passport
app.use(passport.initialize());
app.use(passport.session());

// middleware
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// config
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// handlebars
app.engine(
  "handlebars",
  express_handlebars({
    defaultLayout: "main",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
  })
);
app.set("view engine", "handlebars");

// public
app.use(express.static(path.join(__dirname, "public")));

// mongoose
mongoose.Promisse = global.Promisse;
const mongoUri ="mongodb+srv://<username>:<password>@cluster0.kcpqx.mongodb.net/blog_app?retryWrites=true&w=majority";
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected with MongoDb");
  })
  .catch((err) => {
    console.log("Not connected with MongoDb");
  });

// routes
app.use(routerPublic);
app.use("/admin", routerAdmin);
app.use("/users", routerUser);

// others
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Running BlogApp on port ${port}`);
});
