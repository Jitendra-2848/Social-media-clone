import { create } from 'zustand';
import api from '../api/axios';
import { toast } from 'react-toastify';

const usePostStore = create((set, get) => ({
  posts: [],
  myPosts: [],
  isLoading: false,

  fetchPosts: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/posts');
      set({ posts: res.data.data, isLoading: false });
    } catch (error) {
      toast.error('Failed to fetch posts');
      set({ isLoading: false });
    }
  },

  fetchMyPosts: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/posts/mine');
      set({ myPosts: res.data.data, isLoading: false });
    } catch (error) {
      toast.error('Failed to fetch your posts');
      set({ isLoading: false });
    }
  },

  createPost: async (content, image) => {
    try {
      const res = await api.post('/posts', { content, image });
      set({ posts: [res.data.data, ...get().posts] });
      toast.success('Post created!');
      return true;
    } catch (error) {
      toast.error('Failed to create post');
      return false;
    }
  },

  // UPDATE: Edit post
  // Edit post with image support
editPost: async (postId, content, image) => {  // ← Added image parameter
  try {
    const res = await api.put(`/posts/${postId}`, { content, image });
    
    // Update in posts array
    set({
      posts: get().posts.map(p => p._id === postId ? res.data.data : p),
      myPosts: get().myPosts.map(p => p._id === postId ? res.data.data : p)
    });
    
    toast.success('Post updated!');
    return true;
  } catch (error) {
    toast.error('Failed to update post');
    return false;
  }
},

  // UPDATE: Delete post
  deletePost: async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      set({
        posts: get().posts.filter(p => p._id !== postId),
        myPosts: get().myPosts.filter(p => p._id !== postId)
      });
      toast.success('Post deleted');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  },

  likePost: async (postId) => {
    try {
      await api.post(`/posts/${postId}/like`);
      // Update like count locally (you can improve this)
      set({
        posts: get().posts.map(p =>
          p._id === postId ? { ...p, likes: p.likes.includes('temp') ? p.likes.filter(l => l !== 'temp') : [...p.likes, 'temp'] } : p
        )
      });
    } catch (error) {
      toast.error('Failed to like post');
    }
  },

  addComment: async (postId, text) => {
    try {
      const res = await api.post(`/posts/${postId}/comment`, { text });
      toast.success('Comment added');
      return res.data.comments;
    } catch (error) {
      toast.error('Failed to add comment');
      return null;
    }
  },

  uploadImage: async (base64Image) => {
    try {
      const res = await api.post('/upload', { image: base64Image });
      return res.data.url;
    } catch (error) {
      toast.error('Image upload failed');
      return null;
    }
  },
}));

export default usePostStore;