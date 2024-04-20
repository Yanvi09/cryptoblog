const express = require('express');
const router = express.Router();
const Post = require('../routes/models/Post');
const User = require('../routes/models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const adminLayout = 'layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

// 
//check Login
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
}








// GET
//Admin -LoginPage

router.get('/admin', async (req, res) => {

    try {

        const locals = {
            title: "Admin",
            description: "Simple Blog created with NodeJs,Express & MongoDb."


        }
        res.render('admin/index', { locals, layout: adminLayout });
    } catch (error) {
        console.log(error);

    }
});


// GET
//Admin -check login


router.post('/admin', async (req, res) => {

    try {

        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.cookie('token', token, { httpOnly: true });

        res.redirect('/dashboard');





    } catch (error) {
        console.log(error);

    }
});


// GET
//Admin Dashboard


router.get('/dashboard', authMiddleware, async (req, res) => {

    try {
        const locals = {
            title: 'Dashboard',
            description: 'Unlocking the Secrets of the Digital Treasure Chest: Your Guide to Crypto'
        }


        const data = await Post.find();
        res.render('admin/dashboard', {
            locals,
            data,
            layout: adminLayout

        });
    }
    catch (error) {
        console.log(error)
    }
});

// GET
//Admin create New Post

router.get('/add-post', authMiddleware, async (req, res) => {

    try {
        const locals = {
            title: 'Add Post',
            description: 'Unlocking the Secrets of the Digital Treasure Chest: Your Guide to Crypto'
        }


        const data = await Post.findOne();
        res.render('admin/add-post', {
            locals,
            layout: adminLayout

        });
    }
    catch (error) {
        console.log(error)
    }
});


// POST
//Admin create New Post
router.post('/add-post', authMiddleware, async (req, res) => {
    try {
        const newPost = new Post({
            title: req.body.title,
            body: req.body.body
        });

        await newPost.save(); // Save the new post

        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});
// GET
// Admin edit Post
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Edit Post",
            description: "Unlocking the Secrets of the Digital Treasure Chest: Your Guide to Crypto",
        };

        const data = await Post.findOne({ _id: req.params.id }); // Accessing the 'id' parameter correctly

        res.render('admin/edit-post', {
            locals,
            data,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error);
    }
});


// PUT
//Admin editPost

router.put('/edit-post/:id', authMiddleware, async (req, res) => {

    try {

        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        });

        res.redirect(`/edit-post/${req.params.id}`);

    }
    catch (error) {
        console.log(error)
    }
});


// router.post('/admin', async (req, res) => {

//     try {

//         const { username, password } = req.body;
//         console.log(req.body);

//         if (req.body.username === 'admin' && req.body.password === 'password') {
//             res.send('You are logged in.');
//         } else {
//             res.send('Wrong username or password')
//         }


//         res.redirect('/admin');
//     } catch (error) {
//         console.log(error);

//     }
// });



// GET
//Admin -check Register


router.post('/register', async (req, res) => {

    try {

        const { username, password } = req.body;
        console.log(req.body);
        const hashedPassword = await bcrypt.hash(password, 10);


        try {
            const user = await User.create({ username, password: hashedPassword });
            res.status(201).json({ message: 'User Created', user });

        } catch (error) {
            if (error.code == 11000) {
                res.status(409).json({ message: 'User already in use' });
            }
            res.status(500).json({ message: 'Internal server error' })

        }




        res.redirect('/admin');
    } catch (error) {
        console.log(error);

    }
});

// DELETE
// Admin Delete Post

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        // Extract the post ID from the request parameters
        const postId = req.params.id;

        // Delete the post with the specified ID
        await Post.deleteOne({ _id: postId });

        // Send a success response
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        // Log the error
        console.error('Error deleting post:', error);
        
        // Send an error response
        res.status(500).json({ message: 'Internal server error' });
    }
});




// GET
// Admin logout

router.get('/logout',(req,res)=>{
   res.clearCookie('token');
//    res.json({message:'Logout successful.'});
   res.redirect('/');
});


//GET
//Scraper
// Define route for /api/price-feed endpoint
router.get('/api/price-feed', async (req, res) => {
    try {
        // Call getPriceFeed function to perform web scraping
        const priceFeed = await getPriceFeed();
        // Send the scraped data as JSON response
        res.status(200).json({ priceFeed });
    } catch(err) {
        // Handle errors
        console.error(err);
        res.status(500).json({ error: 'An error occurred while performing web scraping.' });
    }
});



module.exports = router;