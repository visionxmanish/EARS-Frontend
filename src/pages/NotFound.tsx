import { APP_CONFIG } from '@/constants/constants';
import { ArrowLeft, Search, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PageNotFound() {
  const navigate = useNavigate();


    const handleGoHome = () => {
        navigate('/');
    };

    const handleGoBack = () => {
        window.history.back();
    };

    const handleGoToDashboard = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
            {/* Header Logo */}
            <div className="mb-8">
                <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-xl">ERD</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">{APP_CONFIG.fullname}</h1>
                        <p className="text-sm text-gray-500">{APP_CONFIG.description}</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                {/* 404 Icon */}
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gray-100 mb-6">
                    <HelpCircle className="h-10 w-10 text-gray-400" />
                </div>

                {/* Error Message */}
                <div className="mb-8">
                    <h2 className="text-6xl font-bold text-gray-900 mb-2">404</h2>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Page Not Found</h3>
                    <p className="text-gray-600 leading-relaxed">
                        The page you're looking for doesn't exist or may have been moved. 
                        Please check the URL or navigate back to continue using our helpdesk system.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    {/* <button
                        onClick={handleGoHome}
                        className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                        <Home className="h-4 w-4 mr-2" />
                        Go to Home
                    </button> */}

                    <button
                        onClick={handleGoToDashboard}
                        className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                        <Search className="h-4 w-4 mr-2" />
                        Go to Dashboard
                    </button>

                    <button
                        onClick={handleGoBack}
                        className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                    Need help? Contact our{' '}
                    <button
                        onClick={handleGoHome}
                        className="text-blue-600 hover:text-blue-500 font-medium"
                    >
                        support team
                    </button>
                </p>
            </div>
        </div>
    );
}