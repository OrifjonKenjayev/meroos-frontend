import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../../services';
import type { Quiz } from '../../types';

const KahootHostSetupPage: React.FC = () => {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
    const [maxPlayers, setMaxPlayers] = useState(50);
    const [allowLateJoin, setAllowLateJoin] = useState(true);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            // Filter for 'kahoot' type quizzes
            const data = await quizService.getQuizzes({ quiz_type: 'kahoot' });
            setQuizzes(data.results);
        } catch (error) {
            console.error('Failed to fetch quizzes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async () => {
        if (!selectedQuizId) return;

        setCreating(true);
        try {
            const room = await quizService.createKahootRoom(selectedQuizId, maxPlayers, allowLateJoin);
            navigate(`/teacher/kahoot/lobby/${room.room_code}`);
        } catch (error) {
            console.error('Failed to create room:', error);
            alert('Failed to create room. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 bg-indigo-600">
                        <h3 className="text-xl leading-6 font-medium text-white">
                            Host a Kahoot Game
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-indigo-100">
                            Select a quiz and configure your game room.
                        </p>
                    </div>

                    <div className="px-4 py-5 sm:p-6 space-y-6">
                        {/* Quiz Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select a Quiz
                            </label>
                            {quizzes.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-md border-2 border-dashed border-gray-300">
                                    <p className="text-gray-500">No Kahoot-style quizzes available.</p>
                                    <button
                                        onClick={() => navigate('/teacher/quizzes/create')}
                                        className="mt-2 text-indigo-600 hover:text-indigo-500 font-medium"
                                    >
                                        Create one now
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {quizzes.map((quiz) => (
                                        <div
                                            key={quiz.id}
                                            onClick={() => setSelectedQuizId(quiz.id)}
                                            className={`relative rounded-lg border p-4 cursor-pointer hover:shadow-md transition-shadow ${selectedQuizId === quiz.id
                                                    ? 'border-indigo-500 ring-2 ring-indigo-500 bg-indigo-50'
                                                    : 'border-gray-300 bg-white'
                                                }`}
                                        >
                                            <div className="flex flex-col h-full">
                                                <h4 className="text-lg font-medium text-gray-900 mb-1">
                                                    {quiz.title}
                                                </h4>
                                                <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                                                    {quiz.description || 'No description'}
                                                </p>
                                                <div className="mt-auto flex items-center justify-between text-xs text-gray-400">
                                                    <span>{quiz.total_questions} questions</span>
                                                    <span>{quiz.category?.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedQuizId && (
                            <div className="border-t border-gray-200 pt-6">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Game Settings</h4>
                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                    <div className="sm:col-span-3">
                                        <label htmlFor="max-players" className="block text-sm font-medium text-gray-700">
                                            Max Players
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                type="number"
                                                name="max-players"
                                                id="max-players"
                                                min="2"
                                                max="100"
                                                value={maxPlayers}
                                                onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <div className="flex items-start mt-6">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id="allow-late-join"
                                                    name="allow-late-join"
                                                    type="checkbox"
                                                    checked={allowLateJoin}
                                                    onChange={(e) => setAllowLateJoin(e.target.checked)}
                                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor="allow-late-join" className="font-medium text-gray-700">
                                                    Allow Late Join
                                                </label>
                                                <p className="text-gray-500">Players can join after the game starts.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleCreateRoom}
                                        disabled={creating}
                                        className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${creating ? 'opacity-75 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        {creating ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Creating Room...
                                            </>
                                        ) : (
                                            'Create Game Room'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KahootHostSetupPage;
