import { useState } from 'react';
import usePostStore from '../store/usePostStore';
import useAuthStore from '../store/useAuthStore';
import { Heart, MessageCircle, Trash2, Send, Share2, Edit2, X, Check, Image as ImageIcon, Loader2 } from 'lucide-react';
import { compressImage, validateImage, formatFileSize } from '../utils/imageUtils';
import { toast } from 'react-toastify';

const PostCard = ({ post }) => {
  const { user } = useAuthStore();
  const { deletePost, likePost, addComment, editPost, uploadImage } = usePostStore();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState(post.comments || []);
  const [isLiked, setIsLiked] = useState(post.likes?.includes(user?._id));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [imageError, setImageError] = useState(false);
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [editedImage, setEditedImage] = useState(post.image || '');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isMyPost = post.userId?._id === user?._id;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await deletePost(post._id);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(post.content);
    setEditedImage(post.image || '');
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate image
    const validation = validateImage(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setIsCompressing(true);

    try {
      // Compress image
      const compressed = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.92,
        outputFormat: 'image/jpeg',
      });

      setEditedImage(compressed.base64);
      toast.success('Image ready to upload!');
    } catch (error) {
      console.error('Image compression error:', error);
      toast.error(error.message || 'Failed to process image');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemoveImage = () => {
    setEditedImage('');
  };

  const handleSaveEdit = async () => {
    if (!editedContent.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }
    
    setIsSaving(true);

    // Upload new image if it's different from original and is base64
    let imageUrl = editedImage;
    if (editedImage && editedImage.startsWith('data:image')) {
      imageUrl = await uploadImage(editedImage);
      if (!imageUrl) {
        setIsSaving(false);
        return;
      }
    }

    const success = await editPost(post._id, editedContent, imageUrl);
    setIsSaving(false);
    
    if (success) {
      setIsEditing(false);
      post.content = editedContent;
      post.image = imageUrl;
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(post.content);
    setEditedImage(post.image || '');
  };

  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    await likePost(post._id);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComments = await addComment(post._id, commentText);
    if (newComments) {
      setLocalComments(newComments);
      setCommentText('');
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
     <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex justify-between items-start p-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
            {post.userId?.firstname?.[0]}{post.userId?.surname?.[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {post.userId?.firstname} {post.userId?.surname}
            </p>
            <p className="text-xs text-gray-500">{getTimeAgo(post.createdAt)}</p>
          </div>
        </div>

        {/* Edit/Delete Buttons */}
        {isMyPost && !isEditing && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEdit}
              className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-full transition"
              title="Edit post"
            >
              <Edit2 size={20} />
            </button>
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition"
              title="Delete post"
            >
              <Trash2 size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Content - Editable */}
      <div className="px-4 pb-3">
        {isEditing ? (
          <div className="space-y-3">
            {/* Text Editor */}
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-3 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              rows="4"
              placeholder="What's on your mind?"
              autoFocus
              disabled={isCompressing || isSaving}
            />

            {/* Image Preview/Editor */}
            {editedImage && (
              <div className="relative">
                <img
                  src={editedImage}
                  alt="Edit preview"
                  className="w-full h-auto max-h-96 object-contain rounded-xl bg-gray-50"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={isCompressing || isSaving}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            {/* Compressing Indicator */}
            {isCompressing && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="animate-spin text-blue-600 mr-2" size={24} />
                <span className="text-gray-600">Processing image...</span>
              </div>
            )}

            {/* Image Upload / Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <label className={`flex items-center space-x-2 text-blue-600 hover:text-blue-700 cursor-pointer px-4 py-2 rounded-lg hover:bg-blue-50 transition ${
                isCompressing || isSaving ? 'opacity-50 cursor-not-allowed' : ''
              }`}>
                <ImageIcon size={20} />
                <span className="font-medium">
                  {editedImage ? 'Change Image' : 'Add Image'}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isCompressing || isSaving}
                />
              </label>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={isCompressing || isSaving}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Save</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isCompressing || isSaving}
                  className="flex items-center space-x-2 bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition disabled:opacity-50"
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
        )}
      </div>

      {/* Image - Display Mode */}
      {!isEditing && post.image && !imageError && (
        <div className="w-full bg-gray-100">
          <img
            src={post.image}
            alt="Post content"
            className="w-full h-auto object-contain max-h-[600px]"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        </div>
      )}

      {/* Image Error State */}
      {!isEditing && imageError && post.image && (
        <div className="w-full bg-gray-100 p-8 text-center">
          <p className="text-gray-500">Failed to load image</p>
        </div>
      )}

      {/* Like/Comment Count */}
      {!isEditing && (likeCount > 0 || localComments.length > 0) && (
        <div className="flex justify-between items-center px-4 py-2 text-sm text-gray-500">
          <span>{likeCount > 0 && `${likeCount} ${likeCount === 1 ? 'like' : 'likes'}`}</span>
          <span>{localComments.length > 0 && `${localComments.length} ${localComments.length === 1 ? 'comment' : 'comments'}`}</span>
        </div>
      )}

      {/* Action Buttons */}
      {!isEditing && (
        <div className="flex items-center border-y px-2 py-1">
          <button
            onClick={handleLike}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg transition ${
              isLiked ? 'text-red-500' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
            <span className="font-medium">Like</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex-1 flex items-center justify-center space-x-2 text-gray-600 hover:bg-gray-100 py-2 rounded-lg transition"
          >
            <MessageCircle size={20} />
            <span className="font-medium">Comment</span>
          </button>

          <button className="flex-1 flex items-center justify-center space-x-2 text-gray-600 hover:bg-gray-100 py-2 rounded-lg transition">
            <Share2 size={20} />
            <span className="font-medium">Share</span>
          </button>
        </div>
      )}

      {/* Comments Section */}
      {!isEditing && showComments && (
        <div className="p-4 bg-gray-50">
          {/* Comment Input */}
          <form onSubmit={handleComment} className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.firstname?.[0]}
            </div>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-gray-200 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="text-blue-600 hover:text-blue-700 p-2"
            >
              <Send size={20} />
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            {localComments.map((comment, idx) => (
              <div key={idx} className="flex space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {comment.userId?.firstname?.[0]}
                </div>
                <div className="flex-1 bg-white rounded-2xl px-4 py-2 shadow-sm">
                  <p className="font-semibold text-sm text-gray-900">
                    {comment.userId?.firstname} {comment.userId?.surname}
                  </p>
                  <p className="text-gray-700 text-sm">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;