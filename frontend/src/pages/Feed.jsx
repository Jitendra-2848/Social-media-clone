import { useEffect, useState } from 'react';
import usePostStore from '../store/usePostStore';
import useAuthStore from '../store/useAuthStore';
import Navbar from '../components/Navbar';
import CreatePostModal from '../components/CreatePostModal';
import PostCard from '../components/PostCard';
import Loader from '../components/Loader';
import { Briefcase, Users, Image as ImageIcon } from 'lucide-react';

const Feed = () => {
  const { posts, fetchPosts, isLoading } = usePostStore();
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <>
      <Navbar />
      
      {/* Main Container with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Sidebar - User Profile Card */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-20">
              {/* Cover Image */}
              <div className="h-16 bg-gradient-to-r from-blue-500 to-purple-600"></div>
              
              {/* Profile Info */}
              <div className="px-4 pb-4 -mt-8 text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-lg">
                  {user?.firstname?.[0]}{user?.surname?.[0]}
                </div>
                <h3 className="mt-2 font-semibold text-gray-900">
                  {user?.firstname} {user?.surname}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
              </div>
              
              {/* Stats */}
              <div className="border-t border-gray-200 px-4 py-3">
                <div className="flex justify-between items-center text-sm text-gray-600 hover:bg-gray-50 -mx-4 px-4 py-2 cursor-pointer">
                  <span>Profile viewers</span>
                  <span className="text-blue-600 font-semibold">42</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 hover:bg-gray-50 -mx-4 px-4 py-2 cursor-pointer">
                  <span>Post impressions</span>
                  <span className="text-blue-600 font-semibold">128</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Feed */}
          <div className="lg:col-span-6">
            {/* Create Post Trigger - LinkedIn Style */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  {user?.firstname?.[0]}{user?.surname?.[0]}
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-left px-4 py-3 rounded-full border border-gray-300 transition font-medium"
                >
                  Start a post
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition flex-1 justify-center"
                >
                  <ImageIcon size={20} className="text-blue-600" />
                  <span className="font-medium text-sm">Photo</span>
                </button>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition flex-1 justify-center"
                >
                  <Briefcase size={20} className="text-orange-600" />
                  <span className="font-medium text-sm">Article</span>
                </button>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition flex-1 justify-center"
                >
                  <Users size={20} className="text-purple-600" />
                  <span className="font-medium text-sm">Event</span>
                </button>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center justify-between mb-4">
              <div className="h-px bg-gray-300 flex-1"></div>
              <span className="px-4 text-sm text-gray-500">Recent posts</span>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>

            {/* Posts Feed */}
            {isLoading ? (
              <Loader />
            ) : posts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No posts yet</h3>
                <p className="text-gray-500 mb-6">Be the first to share something!</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-semibold transition"
                >
                  Create your first post
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar - Suggestions */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-20">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Social News</h3>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="block hover:bg-gray-50 -mx-4 px-4 py-2 rounded">
                      <h4 className="text-sm font-medium text-gray-900">Tech industry updates</h4>
                      <p className="text-xs text-gray-500 mt-1">2h ago • 1,234 readers</p>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="block hover:bg-gray-50 -mx-4 px-4 py-2 rounded">
                      <h4 className="text-sm font-medium text-gray-900">Remote work trends</h4>
                      <p className="text-xs text-gray-500 mt-1">4h ago • 892 readers</p>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="block hover:bg-gray-50 -mx-4 px-4 py-2 rounded">
                      <h4 className="text-sm font-medium text-gray-900">Career development tips</h4>
                      <p className="text-xs text-gray-500 mt-1">1d ago • 2,567 readers</p>
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 px-4 text-center">
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-gray-600">
                <a href="#" className="hover:text-blue-600">About</a>
                <a href="#" className="hover:text-blue-600">Help</a>
                <a href="#" className="hover:text-blue-600">Privacy</a>
                <a href="#" className="hover:text-blue-600">Terms</a>
              </div>
              <p className="text-xs text-gray-500 mt-2">LinkedIn Clone © 2024</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Feed;