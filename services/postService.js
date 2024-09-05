import { supabase } from "@/lib/supabase";
import { uploadFile } from "./imageService";

export const createOrUpdatePost = async (post) => {
  try {
    // upload image
    if (post.file && typeof post.file == "object") {
      let isImage = post?.file?.type == "image";
      let folderName = isImage ? "postImages" : "postVideos";
      let fileResult = await uploadFile(folderName, post?.file?.uri, isImage);
      if (fileResult.success) {
        post.file = fileResult.data;
      } else {
        return fileResult;
      }
    }
    const { data, error } = await supabase
      .from("posts")
      .upsert(post)
      .select()
      .single();

    if (error) {
      console.log("create post error", error);
      return { success: false, msg: "Failed to create post" };
    }
    return { success: true, data: data };
  } catch (error) {
    console.log("create post error", error);
    return { success: false, msg: "Failed to create post" };
  }
};

export const fetchPosts = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        user: users (id, name, image),
        postLikes (*),
        comments (count)
        `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.log("fetch post error", error);
      return { success: false, msg: "Failed to fetch posts" };
    }
    return { success: true, data: data };
  } catch (error) {
    console.log("fetch post error", error);
    return { success: false, msg: "Failed to fetch posts" };
  }
};

export const createPostLike = async (postLike) => {
  try {
    const { data, error } = await supabase
      .from("postLikes")
      .insert(postLike)
      .select()
      .single();

    if (error) {
      console.log("post like error", error);
      return { success: false, msg: "Failed to like post" };
    }
    return { success: true, data: data };
  } catch (error) {
    console.log("post like error", error);
    return { success: false, msg: "Failed to like post" };
  }
};

export const removePostLike = async (postId, userId) => {
  try {
    const { error } = await supabase
      .from("postLikes")
      .delete()
      .eq("userId", userId)
      .eq("postId", postId);

    if (error) {
      console.log("post like error", error);
      return { success: false, msg: "Failed to unlike post" };
    }
    return { success: true };
  } catch (error) {
    console.log("post like error", error);
    return { success: false, msg: "Failed to unlike post" };
  }
};

export const fetchPostDetails = async (postId) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        user: users (id, name, image),
        postLikes (*),
        comments (*, user: users(id, name, image))
        `
      )
      .eq("id", postId)
      .order("created_at", { ascending: false, foreignTable: "comments" })
      .single();

    if (error) {
      console.log("fetch post details error", error);
      return { success: false, msg: "Failed to fetch post details" };
    }
    return { success: true, data: data };
  } catch (error) {
    console.log("fetch post details error", error);
    return { success: false, msg: "Failed to fetch post details" };
  }
};

export const createComment = async (comment) => {
  try {
    const { data, error } = await supabase
      .from("comments")
      .insert(comment)
      .select()
      .single();

    if (error) {
      console.log("comment error", error);
      return { success: false, msg: "Failed to create comment" };
    }
    return { success: true, data: data };
  } catch (error) {
    console.log("comment error", error);
    return { success: false, msg: "Failed to create comment" };
  }
};

export const removeComment = async (commentId) => {
  try {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.log("delete comment error", error);
      return { success: false, msg: "Failed to delete comment" };
    }
    return { success: true, data: { commentId } };
  } catch (error) {
    console.log("delete comment error", error);
    return { success: false, msg: "Failed to delete comment" };
  }
};
