import { useState } from 'react';
import usePostStore from '../store/usePostStore';
import useAuthStore from '../store/useAuthStore';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { compressImage, formatFileSize, validateImage, getCompressionRatio } from '../utils/imageUtils';
import { toast } from 'react-toastify';

const CreatePostModal = ({ isOpen, onClose }) => {
  const [content, setContent] = useState('');
  const [imageData, setImageData] = useState(null); // Store full image data
  const [isLoading, setIsLoading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  
  const { user } = useAuthStore();
  const { createPost, uploadImage } = usePostStore();

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
      // Compress with HIGH QUALITY settings
      const compressed = await compressImage(file, {
        maxWidth: 1920,      // High resolution
        maxHeight: 1920,
        quality: 0.92,       // 92% quality (excellent)
        outputFormat: 'image/jpeg',
        createThumbnail: true
      });

      setImageData(compressed);

      // Show compression stats
      const stats = getCompressionRatio(compressed.originalSize, compressed.base64);
      
      toast.success(
        `Image optimized! ${formatFileSize(stats.originalSize)} → ${formatFileSize(stats.compressedSize)} (${stats.savedPercentage}% smaller)`,
        { autoClose: 3000 }
      );
    } catch (error) {
      console.error('Image compression error:', error);
      toast.error(error.message || 'Failed to process image');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Please write something!');
      return;
    }

    setIsLoading(true);
    let imageUrl = '';
    
    if (imageData) {
      // Upload high-quality version
      imageUrl = await uploadImage(imageData.base64);
      if (!imageUrl) {
        setIsLoading(false);
        return;
      }
    }
    
    const success = await createPost(content, imageUrl);
    if (success) {
      setContent('');
      setImageData(null);
      onClose();
    }
    setIsLoading(false);
  };

  const removeImage = () => {
    setImageData(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Create Post</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-3 px-6 py-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {user?.firstname?.[0]}{user?.surname?.[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {user?.firstname} {user?.surname}
            </p>
            <p className="text-xs text-gray-500">Public</p>
          </div>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Text Area - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`What's on your mind, ${user?.firstname}?`}
              className="w-full text-gray-800 text-lg focus:outline-none resize-none min-h-[120px]"
              autoFocus
              disabled={isLoading || isCompressing}
            />

            {/* Image Preview - HIGH QUALITY */}
            {imageData && (
              <div className="relative mb-4">
                <img
                  src={imageData.base64}
                  alt="Preview"
                  className="w-full h-auto max-h-96 object-contain rounded-xl bg-gray-50"
                  style={{ imageRendering: 'high-quality' }}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  disabled={isLoading}
                  className="absolute top-2 right-2 bg-gray-900 bg-opacity-75 text-white rounded-full p-2 shadow-lg hover:bg-opacity-90 transition"
                >
                  <X size={20} />
                </button>
                
                {/* Image Info Badge */}
                <div className="absolute bottom-2 left-2 bg-gray-900 bg-opacity-75 text-white text-xs px-3 py-1 rounded-full flex items-center space-x-2">
                  <span>{imageData.dimensions.width} × {imageData.dimensions.height}</span>
                  <span>•</span>
                  <span>{formatFileSize(Math.round((imageData.base64.length * 3) / 4))}</span>
                </div>
              </div>
            )}

            {/* Compressing Indicator */}
            {isCompressing && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="animate-spin text-blue-600 mx-auto mb-2" size={32} />
                  <p className="text-gray-600 font-medium">Optimizing image...</p>
                  <p className="text-gray-500 text-sm mt-1">Maintaining high quality</p>
                </div>
              </div>
            )}
          </div>

          {/* Add to Post */}
          <div className="px-6 py-3 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">Add to your post</span>
              <div className="flex space-x-2">
                <label className={`cursor-pointer p-2 hover:bg-gray-200 rounded-full transition ${
                  imageData || isCompressing ? 'opacity-50 cursor-not-allowed' : ''
                }`}>
                  <ImageIcon size={24} className="text-green-500" />
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isLoading || isCompressing || imageData}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="px-6 py-4 border-t">
            <button
              type="submit"
              disabled={isLoading || isCompressing || !content.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-lg flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Posting...</span>
                </>
              ) : (
                <span>Post</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;