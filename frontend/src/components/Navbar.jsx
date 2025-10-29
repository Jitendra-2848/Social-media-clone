import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { LogOut, Home, User, Bell, Search } from 'lucide-react';
import { toast } from 'react-toastify';
const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40 border-b">
      <div className="max-w-full mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {/* Logo */}
          <Link to="/feed" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
              SC
            </div>
            <span className="text-xl font-bold text-gray-800 hidden sm:block">Social-media Clone</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-gray-100 pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Nav Items */}
          <div className="flex items-center space-x-2">
            <Link
              to="/feed"
              className="flex flex-col items-center text-gray-600 hover:text-primary px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              <Home size={24} />
              <span className="text-xs mt-1 hidden sm:block">Home</span>
            </Link>

            <Link
              to="/my-posts"
              className="flex flex-col items-center text-gray-600 hover:text-primary px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              <User size={24} />
              <span className="text-xs mt-1 hidden sm:block">Profile</span>
            </Link>

            <button onClick={()=>{toast.success("For the internship purpose made by jitendra prajapati")}} className="flex flex-col items-center text-gray-600 hover:text-primary px-4 py-2 rounded-lg hover:bg-gray-100 transition">
              <Bell size={24} />
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-3 ml-4 pl-4 border-l">
              <div className="hidden lg:block text-right">
                <p className="text-sm font-semibold text-gray-800">
                  {user?.firstname} {user?.surname}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition shadow-lg"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;