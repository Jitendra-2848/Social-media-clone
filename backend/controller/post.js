const Post = require("../model/Post");
const User = require("../model/User");

const create = async (req, res) => {
  try {
    const userId = req.user._id;
    const { content, image } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Post content cannot be empty" });
    }

    const newPost = new Post({
      userId,
      content,
      image: image || "",
    });

    await newPost.save();

    const populatedPost = await Post.findById(newPost._id).populate(
      "userId",
      "firstname surname profileImage"
    );

    res.status(201).json({
      message: "Post created successfully",
      data: populatedPost,
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("userId", "firstname surname profileImage")
      .populate("comments.userId", "firstname surname profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Posts fetched successfully",
      data: posts,
    });
  } catch (error) {
    console.error("Get all posts error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getMine = async (req, res) => {
  try {
    const userId = req.user._id;
    const posts = await Post.find({ userId })
      .populate("userId", "firstname surname profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Your posts fetched successfully",
      data: posts,
    });
  } catch (error) {
    console.error("Get my posts error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const delPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      message: isLiked ? "Post unliked" : "Post liked",
      likes: post.likes.length,
    });
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ userId, text });
    await post.save();

    const updatedPost = await Post.findById(postId).populate(
      "comments.userId",
      "firstname surname profileImage"
    );

    res.status(200).json({
      message: "Comment added",
      comments: updatedPost.comments,
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const editPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, image } = req.body;  // ← Now accepts image too
    const userId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Post content cannot be empty" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Check if user owns the post
    if (post.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only edit your own posts" });
    }

    // Update post content and image
    post.content = content;
    
    // If image is provided, update it (even if empty string to remove image)
    if (image !== undefined) {
      post.image = image;
    }

    await post.save();

    const updatedPost = await Post.findById(postId).populate(
      "userId",
      "firstname surname profileImage"
    );

    res.status(200).json({
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    console.error("Edit post error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
module.exports = { create, getAll, getMine, delPost, likePost, addComment, editPost };
