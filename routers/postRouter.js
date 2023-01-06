const router = require('express').Router();
const postController = require('../controllers/postControllers');
const requireUser = require('../middlewares/requireUser');

router.get('/all',requireUser, postController.getAllPostController);


module.exports = router;