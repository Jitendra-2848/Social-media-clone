const express = require("express");
const router = express.Router();

const user = require("../controller/user");
const { create, getAll, getMine, delPost, likePost, addComment, editPost } = require("../controller/post");
const { uploadImage } = require("../controller/upload");
const verify = require("../middleware/authMiddleware");

router.get("/",(req,res)=>{
    console.log("hello backend");
    return res.send("ok");
})
// User routes
router.post("/auth/signup", user.reg);
router.post("/auth/login", user.log);
router.get("/auth/logout", user.logout);
router.get("/auth/check", verify, user.check);
router.get("/users/:id", verify, user.getUserDetail);
router.get("/users", verify, user.getAllUsers);

// Post routes
router.post("/posts", verify, create);
router.get("/posts", verify, getAll);
router.get("/posts/mine", verify, getMine);
router.delete("/posts/:postId", verify, delPost);
router.put("/posts/:postId", verify, editPost);  // ← NEW: Edit route
router.post("/posts/:postId/like", verify, likePost);
router.post("/posts/:postId/comment", verify, addComment);

// Upload route
router.post("/upload", verify, uploadImage);

module.exports = router;
