import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-4xl font-bold mb-4 text-blue-600">
        Dental Clinic Management System
      </h1>

      <p className="text-gray-600 max-w-xl text-center mb-8">
        Manage patients, appointments, and schedules securely and efficiently.
      </p>

      <div className="flex gap-4">
        <Link
          to="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Login
        </Link>

        <Link
          to="/register"
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
        >
          Register
        </Link>
      </div>
    </div>
  );
};

export default Home;
