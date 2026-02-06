import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts';
import { studentService, authService, analyticsService } from '../../services';
import type { StudentProfile, UserStatistics } from '../../types';


const TeacherStudentsPage: React.FC = () => {
    const { hasPermission } = useAuth();
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<{ id: number; name: string; stats: UserStatistics | null } | null>(null);
    const [loadingStats, setLoadingStats] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        class_group: '',
    });

    const handleViewStats = async (studentId: number, studentName: string) => {
        setLoadingStats(true);
        setSelectedStudent({ id: studentId, name: studentName, stats: null });
        try {
            const stats = await analyticsService.getStudentStats(studentId);
            setSelectedStudent({ id: studentId, name: studentName, stats });
        } catch (error) {
            console.error('Failed to load student stats:', error);
            setSelectedStudent(null);
            alert('Failed to load student statistics');
        } finally {
            setLoadingStats(false);
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const studentsData = await studentService.getStudents();
            setStudents(studentsData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Register user
            await authService.register({
                username: formData.username,
                password: formData.password,
                first_name: formData.first_name,
                last_name: formData.last_name,
                role: 'student'
            });

            // If class selected, assign it
            // We need new user's profiled ID. 
            // Register returns User. We need to fetch student profile or assume.
            // But we can't easily get the profile ID from User object unless we fetch it.
            // Alternatively, updated authService.register to return full profile? 
            // Backend returns UserSnippet.

            // Let's just reload for now, user can assign manually if needed or we improve backend later.
            // Actually, we can try to find the student in the list after reload.

            // Hacky: reload then assign? No. 
            // For now, simple registration is good. Assignment can be done later if I implement that UI.

            setIsCreating(false);
            setFormData({
                username: '',
                password: '',
                first_name: '',
                last_name: '',
                class_group: '',
            });
            alert('Student created successfully!');
            loadData();
        } catch (error) {
            alert('Failed to create student. Username might be taken.');
            console.error(error);
        }
    };

    if (loading) {
        return <div className="loading-overlay"><div className="spinner"></div></div>;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Students</h1>
                {hasPermission('can_create_students') && (
                    <button
                        className="btn btn-primary"
                        onClick={() => setIsCreating(!isCreating)}
                    >
                        {isCreating ? 'Cancel' : 'Register Student'}
                    </button>
                )}
            </div>

            {isCreating && (
                <div className="card mb-6">
                    <div className="card-body">
                        <h2 className="text-lg font-semibold mb-4">Register New Student</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Username</label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    required
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Password</label>
                                <input
                                    type="password"
                                    className="input input-bordered w-full"
                                    required
                                    minLength={6}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">First Name</label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={formData.first_name}
                                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Last Name</label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={formData.last_name}
                                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                />
                            </div>
                            {/* 
                            <div>
                                <label className="block text-sm font-medium mb-1">Assign Class (Optional)</label>
                                <select 
                                    className="input input-bordered w-full"
                                    value={formData.class_group}
                                    onChange={e => setFormData({...formData, class_group: e.target.value})}
                                >
                                    <option value="">Select a class...</option>
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.section})</option>
                                    ))}
                                </select>
                                <p className="text-xs text-secondary mt-1">
                                    Note: Class assignment happens after creation.
                                </p>
                            </div> 
                            */}
                            <div className="md:col-span-2">
                                <button type="submit" className="btn btn-success">Register Student</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto card">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Class</th>
                            <th>Performance</th>
                            <th>Last Active</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id}>
                                <td className="font-medium">
                                    <div className="flex items-center gap-3">
                                        {student.student.avatar ? (
                                            <img
                                                src={student.student.avatar}
                                                alt={student.student.full_name}
                                                className="w-6 h-6 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="avatar placeholder">
                                                <div className="bg-neutral-focus text-neutral-content rounded-full w-6 h-6 flex items-center justify-center text-xs">
                                                    <span>{student.student.first_name?.[0] || student.student.username[0]}</span>
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-bold">{student.student.full_name}</div>
                                            <div className="text-xs text-secondary">@{student.student.username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    {student.class_group_name ? (
                                        <span className="badge badge-outline">{student.class_group_name}</span>
                                    ) : (
                                        <span className="text-gray-400 italic">Unassigned</span>
                                    )}
                                </td>
                                <td>
                                    <div className="flex flex-col text-xs">
                                        <span>Avg: {student.average_score}%</span>
                                        <span>Quizzes: {student.total_quizzes_taken}</span>
                                        <span>Streak: {student.current_streak} 🔥</span>
                                    </div>
                                </td>
                                <td className="text-sm">
                                    {student.last_activity_date || 'Never'}
                                </td>
                                <td>
                                    <button
                                        className="btn btn-xs btn-primary"
                                        onClick={() => handleViewStats(student.student.id, student.student.full_name)}
                                    >
                                        View Stats
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {students.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500">
                                    No students found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Stats Modal */}
            {selectedStudent && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setSelectedStudent(null)}
                >
                    <div
                        className="card bg-white p-6 max-w-lg w-full mx-4"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{selectedStudent.name}'s Stats</h2>
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setSelectedStudent(null)}
                            >
                                ✕
                            </button>
                        </div>

                        {loadingStats ? (
                            <div className="flex justify-center py-8">
                                <div className="spinner"></div>
                            </div>
                        ) : selectedStudent.stats ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="stat-card">
                                    <div className="stat-card-label">Quizzes Completed</div>
                                    <div className="stat-card-value">{selectedStudent.stats.total_quizzes_completed}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-label">Average Score</div>
                                    <div className="stat-card-value">{selectedStudent.stats.average_score_percentage?.toFixed(1)}%</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-label">Current Streak</div>
                                    <div className="stat-card-value">{selectedStudent.stats.current_streak_days} 🔥</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-label">Longest Streak</div>
                                    <div className="stat-card-value">{selectedStudent.stats.longest_streak_days}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-label">Class Rank</div>
                                    <div className="stat-card-value">#{selectedStudent.stats.class_rank || 'N/A'}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-label">Global Rank</div>
                                    <div className="stat-card-value">#{selectedStudent.stats.global_rank || 'N/A'}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-label">Total Points</div>
                                    <div className="stat-card-value">{selectedStudent.stats.total_points_earned}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-label">Highest Score</div>
                                    <div className="stat-card-value">{selectedStudent.stats.highest_score_percentage?.toFixed(1)}%</div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">No statistics available</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherStudentsPage;
