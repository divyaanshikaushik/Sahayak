import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Stethoscope, Mail, Lock, User, Award, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [specialty, setSpecialty] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  const validatePassword = (password: string) => {
    const requirements = [
      { test: /.{8,}/, message: 'At least 8 characters long' },
      { test: /[A-Z]/, message: 'Contains uppercase letter' },
      { test: /[a-z]/, message: 'Contains lowercase letter' },
      { test: /[0-9]/, message: 'Contains number' },
      { test: /[^A-Za-z0-9]/, message: 'Contains special character' },
    ];

    const failedRequirements = requirements.filter(req => !req.test.test(password));
    return failedRequirements.map(req => req.message);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(`Password must: \n${passwordErrors.join('\n')}`);
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password, { fullName, specialty, licenseNumber });
      navigate('/login');
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('already registered')) {
          setError('A user with this email already exists');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to create an account');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
    } catch (err) {
      setError('Failed to sign up with Google');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative flex flex-col justify-center min-h-screen py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="bg-white/10 backdrop-blur-lg p-4 rounded-full shadow-xl ring-1 ring-white/20">
              <Stethoscope className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create your doctor account
          </h2>
          <p className="mt-2 text-center text-sm text-blue-100">
            Join our medical platform and start helping patients
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/10 backdrop-blur-lg py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10 ring-1 ring-white/20">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/10 backdrop-blur-lg border border-red-400 text-red-100 px-4 py-3 rounded-lg relative">
                  <pre className="whitespace-pre-wrap text-sm">{error}</pre>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-blue-200" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-white/10 rounded-lg bg-white/5 backdrop-blur-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent sm:text-sm transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-blue-200" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-white/10 rounded-lg bg-white/5 backdrop-blur-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent sm:text-sm transition-all duration-200"
                    placeholder="Create a password"
                  />
                </div>
                <p className="mt-1 text-xs text-blue-200">
                  Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character
                </p>
              </div>

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-white">
                  Full Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-blue-200" />
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-white/10 rounded-lg bg-white/5 backdrop-blur-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent sm:text-sm transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="specialty" className="block text-sm font-medium text-white">
                  Specialty
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Award className="h-5 w-5 text-blue-200" />
                  </div>
                  <input
                    id="specialty"
                    type="text"
                    required
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-white/10 rounded-lg bg-white/5 backdrop-blur-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent sm:text-sm transition-all duration-200"
                    placeholder="Enter your medical specialty"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="licenseNumber" className="block text-sm font-medium text-white">
                  License Number
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-blue-200" />
                  </div>
                  <input
                    id="licenseNumber"
                    type="text"
                    required
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-white/10 rounded-lg bg-white/5 backdrop-blur-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent sm:text-sm transition-all duration-200"
                    placeholder="Enter your license number"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 transition-all duration-200 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-white">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleGoogleSignUp}
                  disabled={loading}
                  className="w-full flex justify-center items-center py-2 px-4 border border-white/10 rounded-lg shadow-sm text-sm font-medium text-white bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 transition-all duration-200"
                >
                  <img
                    className="h-5 w-5 mr-2"
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google logo"
                  />
                  Sign up with Google
                </button>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-white">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-200 hover:text-blue-100 transition-colors duration-200">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}