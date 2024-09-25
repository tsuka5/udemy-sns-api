const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const isAuthenticated = require("../middlewares/isAuthenticated");

router.get("/find", isAuthenticated, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId }
        });
        if(!user){
            res.status(404).json({ error: "ユーザーが見つかりません" });
        }
        res.status(200).json({user: { id: user.id, email: user.email, username: user.username}});
    }catch(err) {
        res.status(500).json({ error: err.message });
    }
})

router.get("/profile/:userId", async (req, res) => {
    const {userId} = req.params;
    console.log(req.params);
    try{
        const profile = await prisma.profile.findUnique({
            where: { userId: parseInt(userId) },
            include: {
                user: {
                    include: {
                        profile: true,
                    }
                }
            }
        })
        if(!profile) {
            return res.status(404).json({ error: "プロフィールが見つかりません" }); 
        }
        res.status(200).json({ profile });
    }
    catch(err) {
        console.log(err);
        res.status(500).json({ error: err.message });   
    }
   
})

//ユーザーの投稿を削除
router.delete("/profile/:userId/:postId", async (req, res) => {
    const { userId, postId } = req.params;
    try {
        const deletePost = await prisma.post.delete({
            where: { id: parseInt(postId) }
        })
        if(!deletePost) {
            res.status(404).json({ error: "投稿が見つかりません" });
        }
        res.status(200).json({ message: "投稿を削除しました" });
    }catch(err) {
        console.log(err);
        res.status(500).json({ error: err.message });   
    }
})

//投稿の編集
router.put("/profile/:userId/:postId", async (req, res) => {
    const { userId, postId } = req.params;
    console.log(req.body);
    const { content } = req.body;

    try {   
        const checkPost = await prisma.post.findUnique({
            where: { id: parseInt(postId) },
        })
        if(!checkPost) {
            res.status(404).json({ error: "投稿が見つかりません" });
        }
        if(checkPost.authorId !== parseInt(userId)) {
            return res.status(403).json({ error: "権限がありません" });
        }

        const updatePost = await prisma.post.update({
            where: { id: parseInt(postId) },
            data: {
                content: content || checkPost.content,
            }
        });
        if(!updatePost) {
            res.status(404).json({ error: "投稿が見つかりません" });
        }
        res.status(200).json({ message: "投稿を更新しました" });
    }catch(err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }

})

module.exports = router;