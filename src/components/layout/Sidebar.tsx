import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts';

interface NavItem {
    label: string;
    path: string;
    icon: string;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

const Sidebar: React.FC = () => {
    const { user, hasPermission } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Get navigation items based on user role
    const getNavSections = (): NavSection[] => {
        if (!user) return [];

        const commonItems: NavItem[] = [
            { label: 'Dashboard', path: getDashboardPath(), icon: '🏠' },
        ];

        switch (user.role) {
            case 'superuser':
                return [
                    { title: 'Overview', items: commonItems },
                    {
                        title: 'Content',
                        items: [
                            { label: 'Quizzes', path: '/quizzes', icon: '📝' },
                            { label: 'Resources', path: '/resources', icon: '📚' },
                            { label: 'News', path: '/news', icon: '📰' },
                            { label: 'Kahoot', path: '/kahoot', icon: '🎮' },
                        ],
                    },
                    {
                        title: 'Analytics',
                        items: [
                            { label: 'Leaderboard', path: '/leaderboard', icon: '🏆' },
                            { label: 'Statistics', path: '/admin/stats', icon: '📊' },
                        ],
                    },
                    {
                        title: 'Administration',
                        items: [
                            { label: 'Users', path: '/admin/users', icon: '👥' },
                            { label: 'Organizations', path: '/admin/organizations', icon: '🏫' },
                            { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
                        ],
                    },
                    {
                        title: 'More',
                        items: [{ label: 'About', path: '/about', icon: 'ℹ️' }],
                    },
                ];

            case 'teacher':
                const teacherSections: NavSection[] = [
                    { title: 'Overview', items: commonItems },
                    {
                        title: 'Content',
                        items: [
                            { label: 'Quizzes', path: '/quizzes', icon: '📝' },
                            { label: 'Resources', path: '/resources', icon: '📚' },
                            { label: 'News', path: '/news', icon: '📰' },
                        ],
                    },
                ];

                // Add Kahoot if has permission
                if (hasPermission('can_host_kahoot')) {
                    teacherSections[1].items.push({ label: 'Host Kahoot', path: '/kahoot/host', icon: '🎮' });
                }

                // Add management section if has permissions
                const managementItems: NavItem[] = [];
                if (hasPermission('can_view_student_stats')) {
                    managementItems.push({ label: 'Class Stats', path: '/teacher/class-stats', icon: '📊' });
                }
                if (hasPermission('can_create_students')) {
                    managementItems.push({ label: 'Students', path: '/teacher/students', icon: '👥' });
                }

                if (managementItems.length > 0) {
                    teacherSections.push({ title: 'Management', items: managementItems });
                }

                teacherSections.push({
                    title: 'Account',
                    items: [
                        { label: 'Profile', path: '/profile', icon: '👤' },
                        { label: 'About', path: '/about', icon: 'ℹ️' },
                    ],
                });

                return teacherSections;

            case 'student':
                return [
                    { title: 'Overview', items: commonItems },
                    {
                        title: 'Learning',
                        items: [
                            { label: 'Quizzes', path: '/quizzes', icon: '📝' },
                            { label: 'Resources', path: '/resources', icon: '📚' },
                            { label: 'Join Kahoot', path: '/kahoot/join', icon: '🎮' },
                        ],
                    },
                    {
                        title: 'Progress',
                        items: [
                            { label: 'My Stats', path: '/profile/stats', icon: '📊' },
                            { label: 'Leaderboard', path: '/leaderboard', icon: '🏆' },
                        ],
                    },
                    {
                        title: 'Information',
                        items: [{ label: 'News', path: '/news', icon: '📰' }],
                    },
                    {
                        title: 'Account',
                        items: [
                            { label: 'Profile', path: '/profile', icon: '👤' },
                            { label: 'About', path: '/about', icon: 'ℹ️' },
                        ],
                    },
                ];

            case 'guest':
            default:
                return [
                    { title: 'Overview', items: commonItems },
                    {
                        title: 'Explore',
                        items: [
                            { label: 'Quizzes', path: '/quizzes', icon: '📝' },
                            { label: 'Resources', path: '/resources', icon: '📚' },
                            { label: 'Join Kahoot', path: '/kahoot/join', icon: '🎮' },
                            { label: 'News', path: '/news', icon: '📰' },
                            { label: 'About', path: '/about', icon: 'ℹ️' },
                        ],
                    },
                ];
        }
    };

    const getDashboardPath = (): string => {
        switch (user?.role) {
            case 'superuser':
                return '/admin';
            case 'teacher':
                return '/teacher';
            case 'student':
                return '/student';
            default:
                return '/guest';
        }
    };

    const navSections = getNavSections();

    return (
        <aside className="sidebar">
            <div
                className="sidebar-header"
                onClick={() => navigate(getDashboardPath())}
                style={{ cursor: 'pointer' }}
                title="Go to Dashboard"
            >
                <div className="sidebar-logo">M</div>
                <span className="sidebar-title">Meroos</span>
            </div>

            <nav className="sidebar-nav">
                {navSections.map((section, idx) => (
                    <div key={idx} className="nav-section">
                        <div className="nav-section-title">{section.title}</div>
                        {section.items.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `nav-item ${isActive || location.pathname === item.path ? 'active' : ''}`
                                }
                            >
                                <span className="nav-item-icon">{item.icon}</span>
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
