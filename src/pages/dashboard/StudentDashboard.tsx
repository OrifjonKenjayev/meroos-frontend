import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts';
import { analyticsService, quizService, newsService, resourceService } from '../../services';
import type { UserStatistics, Quiz, NewsPost } from '../../types';

// Mock teachers data (API not available to students)
const mockTeachers = [
    { id: 1, name: 'Dr. Sarah Chen', subject: 'Mathematics', initials: 'SC', color: '#6366f1' },
    { id: 2, name: 'Prof. James Wilson', subject: 'Physics', initials: 'JW', color: '#14b8a6' },
    { id: 3, name: 'Ms. Emily Davis', subject: 'Literature', initials: 'ED', color: '#f43f5e' },
    { id: 4, name: 'Mr. David Kim', subject: 'Chemistry', initials: 'DK', color: '#f59e0b' },
    { id: 5, name: 'Dr. Lisa Patel', subject: 'Biology', initials: 'LP', color: '#8b5cf6' },
];

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<UserStatistics | null>(null);
    const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);
    const [latestNews, setLatestNews] = useState<NewsPost[]>([]);
    const [resourceCount, setResourceCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, quizzesData, newsData, resourcesData] = await Promise.all([
                    analyticsService.getMyStats(),
                    quizService.getQuizzes({ page: 1 }),
                    newsService.getPosts({ page: 1 }).catch(() => ({ results: [] })),
                    resourceService.getResources({ page: 1 }).catch(() => ({ results: [], count: 0 })),
                ]);
                setStats(statsData);
                setRecentQuizzes(quizzesData.results.slice(0, 4));
                setLatestNews(newsData.results?.slice(0, 3) || []);
                setResourceCount(resourcesData.count || resourcesData.results?.length || 0);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/quizzes?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    if (loading) {
        return (
            <div className="loading-overlay" style={{ position: 'relative', minHeight: '400px' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-greeting">
                        Welcome back, {user?.first_name || user?.username}! 👋
                    </h1>
                    <p className="hero-subtitle">
                        {stats?.current_streak_days
                            ? `Amazing! You're on a ${stats.current_streak_days} day learning streak. Keep the momentum going!`
                            : 'Ready to expand your knowledge today? Your next achievement awaits!'}
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="hero-search">
                        <span className="hero-search-icon">🔍</span>
                        <input
                            type="text"
                            className="hero-search-input"
                            placeholder="What do you want to learn today?"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary btn-sm">
                            Search
                        </button>
                    </form>

                    {/* Hero Actions */}
                    <div className="hero-actions">
                        <Link to="/quizzes" className="btn btn-primary btn-lg">
                            📚 Start Learning
                        </Link>
                        <Link to="/kahoot/join" className="btn btn-secondary btn-lg" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white' }}>
                            🎮 Join Kahoot Game
                        </Link>
                    </div>

                    {/* Hero Stats */}
                    <div className="hero-stats">
                        <div className="hero-stat">
                            <div className="hero-stat-value">{stats?.total_quizzes_completed || 0}</div>
                            <div className="hero-stat-label">Quizzes Completed</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value">{stats?.total_points_earned || 0}</div>
                            <div className="hero-stat-label">Points Earned</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value">{stats?.average_score_percentage?.toFixed(0) || 0}%</div>
                            <div className="hero-stat-label">Avg. Score</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value">🔥 {stats?.current_streak_days || 0}</div>
                            <div className="hero-stat-label">Day Streak</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Expert Teachers Section */}
            <section className="teachers-section">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">Our Expert Mentors</h2>
                        <p className="section-subtitle">Learn from the best educators in their fields</p>
                    </div>
                </div>
                <div className="teachers-grid">
                    {mockTeachers.map((teacher) => (
                        <div key={teacher.id} className="teacher-card">
                            <div className="teacher-avatar-wrapper">
                                <div
                                    className="teacher-avatar"
                                    style={{ background: `linear-gradient(135deg, ${teacher.color}, ${teacher.color}dd)` }}
                                >
                                    {teacher.initials}
                                </div>
                                <div className="teacher-status"></div>
                            </div>
                            <div className="teacher-name">{teacher.name}</div>
                            <div className="teacher-subject">{teacher.subject}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Bento Grid - Learning Hub */}
            <section>
                <div className="section-header">
                    <div>
                        <h2 className="section-title">Learning Hub</h2>
                        <p className="section-subtitle">Everything you need in one place</p>
                    </div>
                </div>

                <div className="bento-grid">
                    {/* Library Card - Large */}
                    <Link to="/resources" className="bento-card library large">
                        <div className="bento-card-icon">📚</div>
                        <h3 className="bento-card-title">Library</h3>
                        <p className="bento-card-description">
                            Explore our extensive collection of books, articles, and study materials.
                            Find resources tailored to your learning journey.
                        </p>
                        <div className="bento-card-footer">
                            <span className="bento-card-stat">{resourceCount}+ Resources</span>
                            <span className="bento-card-arrow">→</span>
                        </div>
                    </Link>

                    {/* Quizzes Card */}
                    <Link to="/quizzes" className="bento-card quizzes">
                        <div className="bento-card-icon">🎯</div>
                        <h3 className="bento-card-title">Quizzes & Tests</h3>
                        <p className="bento-card-description">
                            Challenge yourself with interactive quizzes and track your progress.
                        </p>
                        <div className="bento-card-footer">
                            <span className="bento-card-stat">Gamified Learning</span>
                            <span className="bento-card-arrow">→</span>
                        </div>
                    </Link>

                    {/* Video Lounge Card */}
                    <Link to="/resources?type=video" className="bento-card videos">
                        <div className="bento-card-icon">🎬</div>
                        <h3 className="bento-card-title">Video Lounge</h3>
                        <p className="bento-card-description">
                            Watch educational videos from top instructors.
                        </p>
                        <div className="bento-card-footer">
                            <span className="bento-card-stat">Video Lessons</span>
                            <span className="bento-card-arrow">→</span>
                        </div>
                    </Link>

                    {/* News Card - Wide */}
                    <Link to="/news" className="bento-card news wide">
                        <div className="bento-card-icon">📰</div>
                        <h3 className="bento-card-title">News & Updates</h3>
                        {latestNews.length > 0 ? (
                            <div className="news-preview">
                                {latestNews.map((news) => (
                                    <div key={news.id} className="news-preview-item">
                                        <div className="news-preview-dot"></div>
                                        <div className="news-preview-content">
                                            <div className="news-preview-title">{news.title}</div>
                                            <div className="news-preview-date">
                                                {new Date(news.published_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="bento-card-description">
                                Stay updated with the latest announcements and school news.
                            </p>
                        )}
                        <div className="bento-card-footer">
                            <span className="bento-card-stat">Latest Updates</span>
                            <span className="bento-card-arrow">→</span>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Stats Strip */}
            <section className="stats-strip">
                <div className="stats-strip-item">
                    <div className="stats-strip-icon">📝</div>
                    <div className="stats-strip-value">{stats?.total_quizzes_completed || 0}</div>
                    <div className="stats-strip-label">Quizzes Completed</div>
                </div>
                <div className="stats-strip-item">
                    <div className="stats-strip-icon">⭐</div>
                    <div className="stats-strip-value">{stats?.total_points_earned || 0}</div>
                    <div className="stats-strip-label">Total Points</div>
                </div>
                <div className="stats-strip-item">
                    <div className="stats-strip-icon">📊</div>
                    <div className="stats-strip-value">{stats?.average_score_percentage?.toFixed(1) || 0}%</div>
                    <div className="stats-strip-label">Average Score</div>
                </div>
                <div className="stats-strip-item">
                    <div className="stats-strip-icon">🏆</div>
                    <div className="stats-strip-value">#{stats?.class_rank || '-'}</div>
                    <div className="stats-strip-label">Class Rank</div>
                </div>
                <div className="stats-strip-item">
                    <div className="stats-strip-icon">🔥</div>
                    <div className="stats-strip-value">{stats?.current_streak_days || 0}</div>
                    <div className="stats-strip-label">Day Streak</div>
                </div>
            </section>

            {/* Available Quizzes Section */}
            <section>
                <div className="section-header">
                    <div>
                        <h2 className="section-title">Available Quizzes</h2>
                        <p className="section-subtitle">Test your knowledge and earn points</p>
                    </div>
                    <Link to="/quizzes" className="btn btn-ghost">
                        View All →
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {recentQuizzes.map((quiz) => (
                        <div key={quiz.id} className="quiz-card-enhanced">
                            <div className="quiz-card-header">
                                <div className="flex justify-between items-center">
                                    <span className="badge badge-primary">{quiz.category?.name}</span>
                                    <span className={`badge ${quiz.difficulty === 'easy' ? 'badge-success' :
                                        quiz.difficulty === 'medium' ? 'badge-warning' : 'badge-error'
                                        }`}>
                                        {quiz.difficulty}
                                    </span>
                                </div>
                            </div>
                            <div className="quiz-card-body">
                                <h3 className="quiz-card-title">{quiz.title}</h3>
                                <div className="quiz-card-meta">
                                    <span>📝 {quiz.total_questions} questions</span>
                                    <span>⭐ {quiz.total_points} points</span>
                                </div>
                                <Link
                                    to={`/quizzes/${quiz.id}`}
                                    className="btn btn-primary"
                                    style={{ width: '100%', marginTop: 'var(--space-4)' }}
                                >
                                    Start Quiz
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {recentQuizzes.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">📝</div>
                        <h3 className="empty-state-title">No quizzes available</h3>
                        <p className="empty-state-description">Check back later for new quizzes!</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default StudentDashboard;
