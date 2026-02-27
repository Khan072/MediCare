const express = require("express");
const Blog = require("../models/Blog");
const { protect, admin } = require("../middleware/auth");

const router = express.Router();

// GET /api/blogs — Public, list published blogs
router.get("/", async (req, res) => {
    try {
        const blogs = await Blog.find({ published: true }).sort({ createdAt: -1 });
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/blogs/admin — Admin, list all blogs
router.get("/admin", protect, admin, async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/blogs/:id — Public, single blog
router.get("/:id", async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: "Blog not found" });
        res.json(blog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/blogs — Admin, create blog
router.post("/", protect, admin, async (req, res) => {
    try {
        const { title, content, tags, published } = req.body;
        const blog = await Blog.create({
            title,
            content,
            author: req.user._id,
            authorName: req.user.name,
            tags: tags || [],
            published: published !== undefined ? published : true,
        });
        res.status(201).json(blog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/blogs/:id — Admin, update blog
router.put("/:id", protect, admin, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: "Blog not found" });

        const { title, content, tags, published } = req.body;
        if (title !== undefined) blog.title = title;
        if (content !== undefined) blog.content = content;
        if (tags !== undefined) blog.tags = tags;
        if (published !== undefined) blog.published = published;

        const updated = await blog.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/blogs/:id — Admin, delete blog
router.delete("/:id", protect, admin, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: "Blog not found" });
        await blog.deleteOne();
        res.json({ message: "Blog deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
