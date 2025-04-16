'use client';
import { useEffect, useState } from 'react';
import {
    Divider,
    Typography,
    Row,
    Col,
    Card,
    Spin,
    Avatar,
    Tag,
    List,
    Space,
    Empty,
    Alert,
} from 'antd';
import { UserOutlined } from '@ant-design/icons';


import {
    LineChart,
    Line as RechartsLine,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';


import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { eachDayOfInterval, format } from 'date-fns';


import { Tooltip as ReactTooltip } from 'react-tooltip';


const { Title, Text } = Typography;


const generateColorFromString = (str: string): string => {
    if (!str) return '#CCCCCC';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    const color = `hsl(${hash % 360}, 70%, 50%)`;
    return color;
};


const getLastYearRange = (): { startDate: Date; endDate: Date } => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), 0, 1);
    const endDate = new Date(now.getFullYear(), 11, 31);
    return { startDate, endDate };
};



const formatMonthLabel = (dateString: string) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);

        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
    } catch (e) {
        return dateString;
    }
};

export default function ProfilePage() {
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [tooltipContent, setTooltipContent] = useState('');
    const { startDate, endDate } = getLastYearRange();


    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/profile`);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();

                if (data.profileData) {

                    if (data.profileData.score_history) {
                        console.log(data.profileData.score_history);
                        data.profileData.score_history = data.profileData.score_history
                            .map((item: any) => ({
                                month: item.month,
                                score: Number(item.score) || 0,
                            }))
                            .sort((a: any, b: any) => new Date(a.month).getTime() - new Date(b.month).getTime());

                        if (data.profileData.score_history.length > 0) {
                            const firstMonthDate = new Date(data.profileData.score_history[0].month);
                            firstMonthDate.setMonth(firstMonthDate.getMonth() - 1);
                            const startMonth = firstMonthDate.toISOString().split('T')[0];

                            data.profileData.score_history.unshift({
                                month: startMonth,
                                score: 0,
                            });
                        }
                    }


                    if (data.profileData.heatmap) {

                        const heatmap = data.profileData.heatmap.map((item: any) => ({
                            date: item.day,
                            count: Number(item.count) || 0,
                        }));


                        const heatmapMap = new Map<string, number>();
                        heatmap.forEach(item => {
                            heatmapMap.set(item.date, item.count);
                        });


                        const allDates = eachDayOfInterval({
                            start: new Date(startDate),
                            end: new Date(endDate),
                        });


                        data.profileData.heatmap = allDates.map((dateObj) => {
                            const dateStr = format(dateObj, 'yyyy-MM-dd');
                            return {
                                date: dateStr,
                                count: heatmapMap.get(dateStr) || 0,
                            };
                        });
                    }
                    setProfileData(data.profileData);
                } else {
                    setError('Profile data not found.');
                    setProfileData(null);
                }
            } catch (err: any) {
                console.error('Error fetching profile data:', err);
                setError(`Failed to load profile data: ${err.message}`);
                setProfileData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Spin size="large" tip="Loading Profile..." />
            </div>
        );
    }

    if (error) {
        return <Alert message="Error" description={error} type="error" showIcon style={{ margin: '24px' }} />;
    }

    if (!profileData) {
        return <Empty description="No profile data available." style={{ padding: '50px' }} />;
    }


    const scoreHistoryData = profileData.score_history || [];
    const heatmapData = profileData.heatmap || [];




    const getClassForValue = (value: { date: string; count: number } | null): string => {
        if (!value || value.count === 0) {
            return 'color-github-0';
        }

        if (value.count <= 2) {
            return 'color-github-1';
        }
        if (value.count <= 5) {
            return 'color-github-2';
        }
        if (value.count <= 10) {
            return 'color-github-3';
        }
        return 'color-github-4';
    };


    const userInitial = profileData.username?.[0]?.toUpperCase() || '';
    const avatarColor = generateColorFromString(profileData.username || '');

    return (
        <div style={{ padding: '24px', minHeight: '100vh' }}>
            {/* Tooltip component needed for react-calendar-heatmap */}
            <ReactTooltip id="heatmap-tooltip" />

            <Row gutter={[24, 24]}>
                {/* Left Column (Same as before) */}
                <Col xs={24} sm={24} md={7} lg={7} xl={7}>
                    <Card>
                        {/* Profile Info */}
                        <Space direction="horizontal" align="center" style={{ width: '100%', marginBottom: 20 }}>
                            <Avatar size={100} style={{ backgroundColor: avatarColor }} icon={!userInitial ? <UserOutlined /> : null}>
                                {userInitial}
                            </Avatar>
                            <Space direction="vertical" align="start" style={{ marginLeft: 16 }}>
                                <Title level={3} style={{ marginBottom: 0 }}>{profileData.username}</Title>
                                <Text type="secondary">{profileData.email}</Text>
                                <Tag color="blue" style={{ marginTop: 8 }}>Rank: {profileData.rank || 'N/A'}</Tag>
                            </Space>
                        </Space>


                        {/* Difficulty Breakdown */}
                        <Divider orientation="left" plain><Text strong>Difficulty Breakdown</Text></Divider>
                        {profileData.difficulties?.length > 0 ? (
                            <List
                                size="small"
                                dataSource={profileData.difficulties}
                                renderItem={(difficulty: any) => {
                                    let color;
                                    switch (difficulty.difficulty_name?.toLowerCase()) {
                                        case 'easy': color = 'success'; break;
                                        case 'medium': color = 'warning'; break;
                                        case 'hard': color = 'error'; break;
                                        default: color = 'default';
                                    }
                                    return (
                                        <List.Item>
                                            <Text style={{ minWidth: '60px', flexShrink: 0, marginRight: '8px' }}>{difficulty.difficulty_name}</Text>
                                            <div style={{ width: '100%', textAlign: 'right' }}>
                                                <Tag color={color}>{difficulty.solved_problem_count} solved</Tag>
                                            </div>
                                        </List.Item>
                                    );
                                }}
                            />
                        ) : <Text type="secondary" style={{ display: 'block', paddingLeft: '10px' }}>No difficulty data.</Text>}

                        {/* Languages Solved */}
                        <Divider orientation="left" plain><Text strong>Languages</Text></Divider>
                        {profileData.languages?.length > 0 ? (
                            <List
                                size="small"
                                dataSource={profileData.languages}
                                renderItem={(lang: any) => (
                                    <List.Item>
                                        <Text>{lang.language}</Text>
                                        <Tag color="geekblue">{lang.count} solved</Tag>
                                    </List.Item>
                                )}
                            />
                        ) : <Text type="secondary" style={{ display: 'block', paddingLeft: '10px' }}>No language data.</Text>}

                        {/* Skills Solved */}
                        <Divider orientation="left" plain><Text strong>Skills</Text></Divider>
                        {profileData.skills?.length > 0 ? (
                            <Space wrap size={[4, 8]} style={{ paddingLeft: '10px' }}>
                                {profileData.skills.map((skill: any, index: number) => (
                                    <Tag key={index} color="purple">
                                        {skill.tag_name}: {skill.solved_problem_count}
                                    </Tag>
                                ))}
                            </Space>
                        ) : <Text type="secondary" style={{ display: 'block', paddingLeft: '10px' }}>No skill data.</Text>}
                    </Card>
                </Col>

                {/* Right Column */}
                <Col xs={24} sm={24} md={17} lg={17} xl={17}>
                    {/* Row 1: Score History (Recharts) */}
                    <Card title="Score Progression (Monthly)" style={{ marginBottom: 24 }}>
                        {scoreHistoryData.length > 1 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart
                                    data={scoreHistoryData}
                                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis
                                        dataKey="month"
                                        tickFormatter={formatMonthLabel}
                                        angle={0}
                                        dy={5}
                                        tick={{ fontSize: 11 }}


                                    />
                                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                    <RechartsTooltip

                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="custom-recharts-tooltip">
                                                        <p className="label">{`Date: ${formatMonthLabel(label)}`}</p>
                                                        <p className="intro">{`Score: ${payload[0].value}`}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <RechartsLine
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        activeDot={{ r: 6 }}
                                        dot={{ r: 3 }}
                                        name="Monthly Score"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={scoreHistoryData.length === 1 ? "Not enough data for a line chart (need at least 2 months)." : "No score history available."} />
                        )}
                    </Card>

                    {/* Row 2: Submission Activity Calendar (react-calendar-heatmap) */}
                    <Card title="Submission Activity (Last Year)" style={{ marginBottom: 24 }}>
                        {heatmapData ? (
                            <div style={{ overflowX: 'auto', paddingBottom: '10px' }}> {/* Add scroll for smaller screens */}
                                <CalendarHeatmap
                                    startDate={startDate}
                                    endDate={endDate}
                                    values={heatmapData}
                                    classForValue={getClassForValue}
                                    tooltipDataAttrs={(value: { date: string; count: number }) => {

                                        const dateStr = value.date ? new Date(value.date).toLocaleDateString() : '';
                                        const countStr = value.count !== 0 ? `${value.count} submissions` : 'No submission';
                                        return {
                                            'data-tooltip-id': 'heatmap-tooltip',
                                            'data-tooltip-content': `${countStr} on ${dateStr}`,
                                        };
                                    }}
                                    showWeekdayLabels={true}
                                    weekdayLabels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
                                    onClick={(value) => {
                                        if (value) {
                                            alert(`Clicked on ${value.date} with count ${value.count}`);
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No submission data available." />
                        )}
                    </Card>


                    <Card title="Recent Accepted Submissions">
                        {profileData.recentAcProblems?.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={profileData.recentAcProblems}
                                renderItem={(problem: any) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={<Text strong>{problem.problem_name || `Problem ID: ${problem.problem_id}`}</Text>}
                                            description={`ID: ${problem.problem_id}`}
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No recent accepted problems." />
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
