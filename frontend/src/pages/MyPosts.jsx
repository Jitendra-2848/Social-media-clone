import { useEffect } from 'react';
import usePostStore from '../store/usePostStore';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import Loader from '../components/Loader';
import { FileText } from 'lucide-react';

const MyPosts = () => {
  const { myPosts, fetchMyPosts, isLoading } = usePostStore();

  useEffect(() => {
    fetchMyPosts();
  }, []);

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Posts</h1>
              <p className="text-gray-600">Manage and view all your posts</p>
            </div>
          </div>
        </div>

        {/* Posts */}
        {isLoading ? (
          <Loader />
        ) : myPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No posts yet</h3>
            <p className="text-gray-500">Start sharing your thoughts with the world</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyPosts;