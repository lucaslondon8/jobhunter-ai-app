import React from 'react';
import { 
  Home, 
  Upload, 
  Search, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Zap,
  User
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: any;
  onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, user, onSignOut }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'jobs', label: 'Job Matching', icon: Search },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-[#2765FF]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}>
            jobhunter ai
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                activeTab === item.id
                  ? 'bg-[#2765FF] text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50">
          <div className="w-10 h-10 bg-[#2765FF] rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user.plan} Plan</p>
          </div>
        </div>
        
        <button
          onClick={onSignOut}
          className="w-full flex items-center space-x-3 px-4 py-3 mt-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
