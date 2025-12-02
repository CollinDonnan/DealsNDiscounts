/*
 * Filename: app.js
 * Authors: Collin Donnan, John Hershey
 * Creation Date: 2025-11-14
 * Last Edit Date: 2025-11-18
 * Class: CMSC 421 Web Development
 * Description: contains code for accessing and running website backend
 */

const express = require("express"); // Import the Express framework – used to build the web server
const bodyParser = require("body-parser"); // Middleware that helps parse data sent from forms (POST requests)
const session = require("express-session"); // Middleware for creating and managing user sessions (stores who’s logged in)
const passport = require("passport"); // Authentication library – handles login and verifying credentials
const connectEnsureLogin = require("connect-ensure-login"); // Middleware to protect pages so only logged-in users can access them
// does not like when order is enabled, says User is not defined w/ Order enable. Otherwise fine
const Order = require("./model_order.js"); // Import the Order model defined in model_order.js
const User = require("./model_user.js"); // Import the User model defined in model.js (includes schema + passport-local-mongoose setup)
const app = express(); // Create an instance of an Express application
const port = 5000;

app.use(
  session({
    secret: "grwgq3480430ufddj",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000, secure: false, sameSite: "lax" }, // 1 hour
  })
);

// ****************** FILE LOADING *******************************
app.use(express.static(__dirname));

// ********************* MIDDLE WARE  **************************
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ************************* USER AUTH *******************************
app.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

app.post("/register", function (req, res, next) {
  // check that passwords match
  console.log(req.body); // for checking
  let passmiss = "passwords do not match";
  if (req.body.pwrd != req.body.repwrd) {
    console.log("error while user register!", passmiss);
    alert("passwords do not match!");
    return next(passmiss);
  }
  User.register(
    {
      username: req.body.email,
      email: req.body.email,
      fname: req.body.fname,
      lname: req.body.lname,
    },
    req.body.pwrd,
    function (err) {
      if (err) {
        console.log("error while user register!", err);
        return next(err);
      }
      console.log("user registered!");
      res.redirect("/"); // After successful registration, go back to login page
    }
  );
});

app.get("/login.ejs", (req, res) => {
  res.render("login.ejs", { message: "" });
});

// new
// sends user back to login page if not logged in
// otherwise send to order page
app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.render("login.ejs", {
        message: "Invalid username or password.",
      });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect("/order.html");
    });
  })(req, res, next);
});

// new
// once logged in, send to home page
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/user", connectEnsureLogin.ensureLoggedIn(), (req, res) =>
  res.send({ user: req.user })
);

// ************************* ORDERS TO DATABASE *******************************
// new
app.post("/orders", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  try {
    const items = (req.body.cart || []).map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price_cents: Math.round(item.price * 100),
    }));

    const order = new Order({
      user_id: req.user._id,
      items: items,
      timestamp: new Date(),
    });

    await order.save();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save order to database." });
  }
});

// Update stock in products_real_titles.json
/*
    req.body.cart.forEach((item) => {
      const product = productsData.items[item.product_id - 1];
      if (product && product.fields.stock >= item.quantity) {
        product.fields.stock -= item.quantity;
      }
      // end
    });

    fs.writeFileSync(productsFilePath, JSON.stringify(productsData, null, 2));

    res.status(201).json({ message: "Order saved to database." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save order to database." });
  }
});
*/

// *************************  RUN THE SERVER ***********************
app.listen(port, () => {
  //runs the app and prints the link
  console.log(`Server is running on http://localhost:${port}`);
});
