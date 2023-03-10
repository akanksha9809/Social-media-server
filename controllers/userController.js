const Post = require("../models/Post");
const User = require("../models/User");
const { error, success } = require("../utils/responseWrapper");
const cloudinary = require("cloudinary").v2;
const { mapPostOutput } = require("../utils/Utils");

const followOrUnfollowUserController = async (req, res) => {
  try {
    const { userIdToFollow } = req.body;
    const curUserId = req._id;

    const userToFollow = await User.findById(userIdToFollow);
    const curUser = await User.findById(curUserId);

    if (curUserId === userIdToFollow) {
      return res.send(error(409, "Users cannot follow themselves"));
    }

    if (!userToFollow) {
      return res.send(error(404, "User to follow not found"));
    }

    if (curUser.followings.includes(userIdToFollow)) {
      //userToFollow & curUser
      // already following
      const followingIndex = curUser.followings.indexOf(userIdToFollow);
      curUser.followings.splice(followingIndex, 1);

      const followerIndex = userToFollow.followers.indexOf(curUserId);
      userToFollow.followers.splice(followerIndex, 1);

      //   return res.send(success(200, "User Unfollowed"));
    } else {
      //not following
      userToFollow.followers.push(curUserId);
      curUser.followings.push(userIdToFollow);

      //   return res.send(success(200, "User Followed"));
    }
    await userToFollow.save();
    await curUser.save();
    return res.send(success(200, { user: userToFollow }));
  } catch (e) {
    console.log(e);
    return res.send(error(500, e.message));
  }
};

const getPostsOfFollowing = async (req, res) => {
  try {
    const curUserId = req._id;
    const curUser = await User.findById(curUserId).populate("followings");

    const fullPosts = await Post.find({
      // owner: curUser.followings,
      //OR
      owner: {
        $in: curUser.followings,
      },
    }).populate("owner");

    const posts = fullPosts
      .map((item) => mapPostOutput(item, req._id))
      .reverse();

    // console.log("posts here!!!!", posts);

    const followingsIds = curUser.followings.map((item) => item._id);
    followingsIds.push(req._id);
    const suggestions = await User.find({
      _id: {
        $nin: followingsIds,
      },
    });

    return res.send(success(200, { ...curUser._doc, suggestions, posts }));
    //._doc=>only that data which is added in mongodb
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

    return res.send(success(200, { myALLPosts }));
  } catch (err) {
    console.log(err);
    console.log(err);
    return res.send(error(500, err.message));
  }
};

const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.send(error(400, "Caption is required"));
    }

    const posts = await Post.find({
      owner: userId,
    }).populate("likes");

    return res.send(success(200, posts));
  } catch (error) {
    console.log(e);
    return res.send(error(500, e.message));
  }
};

const deleteMyProfile = async (req, res) => {
  try {
    const curUserId = req._id;
    const curUser = await User.findById(curUserId);

    // All posts Deletion

    await Post.deleteMany({
      owner: curUser,
    });

    //Removing Myself from follower's followings

    curUser.followers.forEach(async (followerId) => {
      const follower = await User.findById(followerId);
      const index = follower.followings.indexOf(curUser);
      follower.followings.splice(index, 1);
      await follower.save();
    });

    //Removing Myself from following's followers

    curUser.followings.forEach(async (followingId) => {
      const following = await User.findById(followingId);
      const index = following.followers.indexOf(curUser);
      following.followers.splice(index, 1);
      await following.save();
    });

    //Removing Myself from all likes

    const allPosts = await Post.find();
    allPosts.forEach(async (post) => {
      const index = await post.likes.indexOf(curUser);
      post.likes.splice(index, 1);
      await post.save();
    });

    await curUser.remove();

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
    });

    return res.send(success(200, "User Deleted"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
};

const getMyInfo = async (req, res) => {
  try {
    const user = await User.findById(req._id);

    return res.send(success(200, { user }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, bio, userImg } = req.body;

    const user = await User.findById(req._id);

    if (name) {
      user.name = name;
    }
    if (bio) {
      user.bio = bio;
    }
    if (userImg) {
      const cloudImg = await cloudinary.uploader.upload(userImg, {
        folder: "profileImg",
      });
      user.avatar = {
        url: cloudImg.secure_url,
        publicId: cloudImg.public_id,
      };
    }
    await user.save();
    return res.send(success(200, { user }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findById(userId).populate({
      path: "posts",
      populate: {
        path: "owner",
      },
    });

    const fullPosts = user.posts;
    const posts = fullPosts
      .map((item) => mapPostOutput(item, req._id))
      .reverse();

    return res.send(success(200, { ...user._doc, posts }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

module.exports = {
  followOrUnfollowUserController,
  getPostsOfFollowing,
  getMyPosts,
  getUserPosts,
  deleteMyProfile,
  getMyInfo,
  updateUserProfile,
  getUserProfile,
};
