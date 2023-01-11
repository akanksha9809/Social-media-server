const Post = require("../models/Post");
const User = require("../models/User");
const { error, success } = require("../utils/responseWrapper");

const followOrUnfollowUserController = async (req, res) => {
    try {
        const {userIdToFollow} = req.body;
        const curUserId = req._id;

        const userToFollow = await User.findById(userIdToFollow);
        const curUser = await User.findById(curUserId);

        if(curUserId === userIdToFollow) {
            return res.send(error(409, 'Users cannot follow themselves'))
        }

        if(!userToFollow) {
            return res.send(error(404, 'User to follow not found'));
        }

        if (curUser.followings.includes(userIdToFollow)) {//userToFollow & curUser
            // already following
            const followingIndex = curUser.followings.indexOf(userIdToFollow);
            curUser.followings.splice(followingIndex, 1);

            const followerIndex = userToFollow.followers.indexOf(curUser);
            userToFollow.followers.splice(followerIndex, 1);

            await userToFollow.save();
            await curUser.save();

            return res.send(success(200, "User Unfollowed"));
        } else {
            //not following
            userToFollow.followers.push(curUserId);
            curUser.followings.push(userIdToFollow);

            await userToFollow.save();
            await curUser.save();

            return res.send(success(200, "User Followed"));
        }
    } catch (e) {
        console.log(e);
         return res.send(error(500, e.message));
    }

}

const getPostsOfFollowing = async (req, res) => {
    try {
        console.log('$$$$$$$$$$$$$$$$$');
        const curUserId = req._id;
        const curUser = await User.findById(curUserId);
        
        const posts = await Post.find({
            owner: curUser.followings,
            //OR
            // owner: {
            //     $in: curUser.followings,
            // },
        });

        return res.send(success(200, {posts}));
    } catch (err) {
        console.log(err);
        return res.send(error(500, err.message));
    }
};

const getMyPosts = async (req, res) => {
    try {
        const curUserId = req._id;
        const curUser = await User.findById(curUserId);
        
       
        const myALLPosts = await Post.find({
            owner: curUser,
        }).populate("likes");

        console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',curUserId);
        console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&',curUser);
        return res.send(success(200, { myALLPosts }));
    } catch (err) {
        console.log(err);
        console.log(err);
        return res.send(error(500, err.message));
    }
};

const getUserPosts = async (req, res) => {
    try {
        const {userId } = req.body;
        
        if(!userId) {
            return res.send(error(400, 'Caption is required'))
        }

        const posts = await Post.find({
            'owner': userId 
        }).populate('likes')
    
        return res.send(success(200, posts)); 
    } catch (error) {
        console.log(e);
        return res.send(error(500, e.message));
    }
}

const deleteMyProfile = async (req, res) => {
    try {
        const curUserId = req._id;
        const curUser = await User.findById(curUserId);

        //delete all posts
        await Post.deleteMany({
            owner: curUserId
        })

        //remove myself from followers' following
        curUser.followers.forEach( async(followerId) => {
            const follower = await User.findById(followerId);
            const index = follower.followings.indexOf(curUserId);
            follower.followings.splice(index, 1);
            await follower.save();
        })

        //remove myself from followings' followers
        curUser.followings.forEach( async(followingId) => {
            const following = await User.findById(followingId);
            const index = following.followers.indexOf(curUserId);
            following.followers.splice(index, 1);
            await follower.save();
        })

        //remove myself from all likes
        const allPosts = await Post.find();
        allPosts.forEach(async(post) => {
            const index = post.likes.indexOf(curUserId);
            post.likes.splice(index, 1);
            await post.save();
        })

        //delete user
        await curUser.remove();

        res.clearCookie('jwt', {
            httpOnly: true,
            secure: true
        })

        return res.send(success(200, 'User deleted'))

     } catch (e) {
        console.log(e);
        return res.send(error(500, e.message));
     }
     
}


module.exports = {
    followOrUnfollowUserController,
    getPostsOfFollowing,
    getMyPosts,
    getUserPosts, 
    deleteMyProfile
}