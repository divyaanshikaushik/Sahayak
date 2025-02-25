import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  icon: React.ReactNode;
}

export function AppLayout({ children, title, icon }: AppLayoutProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                {icon}
                <span className="ml-2 text-xl font-semibold">{title}</span>
              </div>
            </div>
            <div className="flex items-center">
              <Button
                variant="secondary"
                onClick={handleSignOut}
                className="ml-4 flex items-center"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}