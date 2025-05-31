import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Camera, Users, Calendar, Package, LogOut, User, ClipboardList } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  if (!user) return null;

  return (
    <header className="bg-primary-900 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <Camera size={24} />
            <span>TFPS</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <NavLink to="/members" active={location.pathname.startsWith('/members')}>
              <Users size={18} className="mr-1" />
              Members
            </NavLink>
            <NavLink to="/calendar" active={location.pathname.startsWith('/calendar')}>
              <Calendar size={18} className="mr-1" />
              Calendar
            </NavLink>
            <NavLink to="/equipment" active={location.pathname.startsWith('/equipment')}>
              <Package size={18} className="mr-1" />
              Equipment
            </NavLink>
            <NavLink to="/requests" active={location.pathname.startsWith('/requests')}>
              <ClipboardList size={18} className="mr-1" />
              Requests
            </NavLink>
            {user.is_admin && (
              <NavLink to="/admin" active={location.pathname.startsWith('/admin')}>
                <User size={18} className="mr-1" />
                Admin
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="avatar h-8 w-8 text-sm">
                {getInitial(user.name)}
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium">{user.name}</div>
                {user.is_admin && (
                  <div className="text-xs text-primary-200">Admin</div>
                )}
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm font-medium text-white hover:text-gray-200"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div className="md:hidden border-t border-primary-800 py-2">
          <div className="flex justify-between">
            <MobileNavLink to="/members" active={location.pathname.startsWith('/members')}>
              <Users size={20} />
            </MobileNavLink>
            <MobileNavLink to="/calendar" active={location.pathname.startsWith('/calendar')}>
              <Calendar size={20} />
            </MobileNavLink>
            <MobileNavLink to="/equipment" active={location.pathname.startsWith('/equipment')}>
              <Package size={20} />
            </MobileNavLink>
            <MobileNavLink to="/requests" active={location.pathname.startsWith('/requests')}>
              <ClipboardList size={20} />
            </MobileNavLink>
            {user.is_admin && (
              <MobileNavLink to="/admin" active={location.pathname.startsWith('/admin')}>
                <User size={20} />
              </MobileNavLink>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink = ({ to, active, children }: NavLinkProps) => (
  <Link
    to={to}
    className={`flex items-center text-sm font-medium transition-colors ${
      active ? 'text-white' : 'text-primary-100 hover:text-white'
    }`}
  >
    {children}
  </Link>
);

const MobileNavLink = ({ to, active, children }: NavLinkProps) => (
  <Link
    to={to}
    className={`p-2 rounded-full ${
      active ? 'bg-primary-800 text-white' : 'text-primary-100 hover:text-white'
    }`}
  >
    {children}
  </Link>
);

export default Navbar;