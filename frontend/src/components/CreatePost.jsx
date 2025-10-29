import { useState } from 'react';
import usePostStore from '../store/usePostStore';
import useAuthStore from '../store/useAuthStore';
import { Image, Send, X } from 'lucide-react';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const { createPost, uploadImage } = usePostStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    let imageUrl = '';
    if (imagePreview) imageUrl = await uploadImage(imagePreview);
    const success = await createPost(content, imageUrl);
    if (success) {
      setContent('');
      setImagePreview('');
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* User Info */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
          {user?.firstname?.[0]}{user?.surname?.[0]}
        </div>
        <div>
          <p className="font-semibold text-gray-800">
            {user?.firstname} {user?.surname}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What do you want to talk about?"
          className="w-full p-4 border-0 focus:outline-none resize-none text-gray-700"
          rows="3"
        />

        {imagePreview && (
          <div className="mt-4 relative">
            <img src={imagePreview} alt="Preview" className="w-full max-h-96 object-cover rounded-lg" />
            <button
              type="button"
              onClick={() => setImagePreview('')}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg cursor-pointer transition">
              <Image size={20} className="text-blue-500" />
              <span className="text-sm font-medium">Photo</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || !content.trim()}
            className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;