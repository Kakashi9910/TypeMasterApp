import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const URL = import.meta.env.VITE_BACKEND_URL
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageWPM: 0,
    averageAccuracy: 0,
    totalSessions: 0,
    bestWPM: 0
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${URL}/api/sessions/user`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const sessionData = response.data;
      setSessions(sessionData);
      
      if (sessionData.length > 0) {
        const avgWPM = sessionData.reduce((acc, session) => acc + session.wpm, 0) / sessionData.length;
        const avgAccuracy = sessionData.reduce((acc, session) => acc + session.accuracy, 0) / sessionData.length;
        const bestWPM = Math.max(...sessionData.map(session => session.wpm));
        
        setStats({
          averageWPM: Math.round(avgWPM),
          averageAccuracy: Math.round(avgAccuracy),
          totalSessions: sessionData.length,
          bestWPM: Math.round(bestWPM)
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Typing Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Average WPM</h3>
          <p className="text-3xl font-bold text-primary">{stats.averageWPM}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Average Accuracy</h3>
          <p className="text-3xl font-bold text-primary">{stats.averageAccuracy}%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Total Tests</h3>
          <p className="text-3xl font-bold text-primary">{stats.totalSessions}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-500">Best WPM</h3>
          <p className="text-3xl font-bold text-primary">{stats.bestWPM}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Progress Chart</h2>
        <div className="w-full h-[400px]">
          <LineChart
            width={800}
            height={350}
            data={sessions}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="createdAt" 
              tickFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(date) => new Date(date).toLocaleString()}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="wpm" 
              stroke="#1a73e8" 
              name="WPM"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="accuracy" 
              stroke="#34A853" 
              name="Accuracy"
              strokeWidth={2}
            />
          </LineChart>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 p-6 border-b">Recent Tests</h2>
        <div className="divide-y">
          {sessions.slice(0, 5).map((session, index) => (
            <div key={index} className="p-6 hover:bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">WPM</p>
                  <p className="text-lg font-semibold">{session.wpm}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Accuracy</p>
                  <p className="text-lg font-semibold">{session.accuracy}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="text-lg font-semibold">{session.duration}s</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-lg font-semibold">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profile;