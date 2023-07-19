const express = require("express");
const session = require('express-session');
const app = express();
const port = 4000;
const bcrypt = require("bcryptjs");
const { Post, User, Comments } = require("./models");
require("dotenv").config();


app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.originalUrl}`);
  res.on("finish", () => {
 
    console.log(`Response Status: ${res.statusCode}`);
  });
  next();
});


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 3600000 
  },
}));

const authenticateUser = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'You must be logged in to view this page.' });
  }
  next();
};


const authorizeModification = async (req, res, model, id) => {
  const record = await model.findOne({ where: { id: id } });
  if (record && record.UserId !== parseInt(req.session.userId, 10)) {
    return res
      .status(403)
      .json({ message: "You are not authorized to perform that action." });
  }
};

app.post("/signup", async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  
  console.log(req.body);
  try {
    console.log(hashedPassword);
    const user = await User.create({
      name: req.body.name,
      lastName:req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
    });
    
    req.session.userId = user.id; 
  
    res.status(201).json({
      message: "User created!",
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      return res.status(422).json({ errors: error.errors.map((e) => e.message) });
    }
    
    
    console.log(error);
    res.status(500).json({
      message: "Error occurred while creating user",
    });
  }
});


app.post('/login', async (req, res) => {
  try {
   
    const user = await User.findOne({ where: { email: req.body.email } });

    if (user === null) {
      
      return res.status(401).json({
        message: 'Incorrect credentials',
      });
    }

  
    bcrypt.compare(req.body.password, user.password, (error, result) => {
      if (result) {
       
        req.session.userId = user.id;
        res.status(200).json({
          message: 'Logged in successfully',
          user: {
            name: user.name,
            email: user.email,
          },
        });
      } else {
      
        res.status(401).json({ message: 'Incorrect credentials' });
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred during the login process' });
  }
});

app.delete('/logout', (req, res) => {
  req.session.destroy(err => {
      if (err) {
          return res.sendStatus(500);
      }

      res.clearCookie('connect.sid');
      return res.sendStatus(200);
  });
});



app.get("/", (req, res) => {
  res.send("Welcome to the Blogging Platform API!!!!");
});



app.get("/posts", authenticateUser, async (req, res) => {
  try {
    
    const allPosts = await Post.findAll({
      include: [{ model: Comments }] 
    });

    res.status(200).json(allPosts);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
});


app.get("/posts/:id", authenticateUser, async (req, res) => {
  const postId = parseInt(req.params.id, 10);

  try {
    const post = await Post.findOne({ where: { id: postId } });

    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).send({ message: "Post not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
});


app.post("/posts", authenticateUser, async (req, res) => {
  try {
    const newPost = await Post.create(req.body);

    res.status(201).json(newPost);
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      return res.status(422).json({ errors: err.errors.map((e) => e.message) });
    }
    console.error(err);
    res.status(500).send({ message: err.message });
  }
});


app.patch("/posts/:id", authenticateUser, async (req, res) => {
  const postId = parseInt(req.params.id, 10);

  try {
    const record = await Post.findOne({ where: { id: postId } });
    if (record && record.UserId !== parseInt(req.session.userId, 10)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform that action." });
    }
    const [numberOfAffectedRows, affectedRows] = await Post.update(
      req.body,
      { where: { id: postId }, returning: true }
    );

    if (numberOfAffectedRows > 0) {
      res.status(200).json(affectedRows[0]);
    } else {
      res.status(404).send({ message: "Post not found" });
    }
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      return res.status(422).json({ errors: err.errors.map((e) => e.message) });
    }
    console.error(err);
    res.status(500).send({ message: err.message });
  }
}); 

// Delete a specific post
app.delete("/posts/:id", authenticateUser, async (req, res) => {
  const postId = parseInt(req.params.id, 10);

  try {
    const record = await Post.findOne({ where: { id: postId } });
    if (record && record.UserId !== parseInt(req.session.userId, 10)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform that action." });
    }
    
    const deleteOp = await Post.destroy({ where: { id: postId } });

    if (deleteOp > 0) {
      res.status(200).send({ message: "Post deleted successfully" });
    } else {
      res.status(404).send({ message: "Post not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
});

//---------- COMMENTS ----------

// Get all the comments for a post
app.get("/posts/:postId/comments", authenticateUser, async (req, res) => {
  const postId = parseInt(req.params.postId, 10);

  try {
    const allComments = await Comments.findAll({ where: { PostId: postId } });

    res.status(200).json(allComments);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
});

//Get a specific comment for a post
app.get("/posts/:postId/comments/:id", authenticateUser, async (req, res) => {
  const commentId = parseInt(req.params.id, 10);

  try {
    const oneComment = await Comments.findByPk(commentId);

    res.status(200).json(oneComment);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
});


app.post("/posts/:postId/comments", authenticateUser, async (req, res) => {
  try {
    const newComment = await Comments.create(req.body);

    res.status(201).json(newComment);
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      return res.status(422).json({ errors: err.errors.map((e) => e.message) });
    }
    console.error(err);
    res.status(500).send({ message: err.message });
  }
});


app.patch("/posts/:postId/comments/:id", authenticateUser, async (req, res) => {
  const commentId = parseInt(req.params.id, 10);

  try {
    const record = await Comments.findByPk();
    if (record && record.UserId !== parseInt(req.session.userId, 10)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform that action." });
    }
    const [numberOfAffectedRows, affectedRows] = await Comments.update(
      req.body,
      { where: { id: commentId }, returning: true }
    );

    if (numberOfAffectedRows > 0) {
      res.status(200).json(affectedRows[0]);
    } else {
      res.status(404).send({ message: "Post not found" });
    }
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      return res.status(422).json({ errors: err.errors.map((e) => e.message) });
    }
    console.error(err);
    res.status(500).send({ message: err.message });
  }
}); 



app.delete("/posts/:postId/comments/:id", authenticateUser, async (req, res) => {
  const commentId = parseInt(req.params.id, 10);

  try {
    const record = await Comment.findByPk();
    if (record && record.UserId !== parseInt(req.session.userId, 10)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform that action." });
    }
    
    const deleteOp = await Comments.destroy({ where: { id: commentId } });

    if (deleteOp > 0) {
      res.status(200).send({ message: "Post deleted successfully" });
    } else {
      res.status(404).send({ message: "Post not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});