import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Book,
  Timeline,
  CheckCircle,
  Warning,
  TrendingUp
} from '@mui/icons-material';
import { fetchStudyPlans } from '../../store/slices/studyPlanSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { studyPlans, loading } = useSelector((state) => state.studyPlan);

  useEffect(() => {
    dispatch(fetchStudyPlans());
  }, [dispatch]);

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'success';
    if (progress >= 50) return 'warning';
    return 'error';
  };

  const getRecentActivity = () => {
    if (!studyPlans) return [];
    return studyPlans
      .flatMap(plan => plan.topics)
      .filter(topic => topic.lastStudied)
      .sort((a, b) => new Date(b.lastStudied) - new Date(a.lastStudied))
      .slice(0, 5);
  };

  const getOverallProgress = () => {
    if (!studyPlans || studyPlans.length === 0) return 0;
    const totalTopics = studyPlans.reduce((acc, plan) => acc + plan.topics.length, 0);
    const completedTopics = studyPlans.reduce(
      (acc, plan) => acc + plan.topics.filter(topic => topic.status === 'completed').length,
      0
    );
    return Math.round((completedTopics / totalTopics) * 100);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.name}!
      </Typography>
      
      <Grid container spacing={3}>
        {/* Progress Overview */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Overall Progress
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ flexGrow: 1, mr: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={getOverallProgress()}
                  color={getProgressColor(getOverallProgress())}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {getOverallProgress()}%
              </Typography>
            </Box>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/analytics')}
              startIcon={<Timeline />}
            >
              View Detailed Analytics
            </Button>
          </Paper>
        </Grid>

        {/* Study Plans */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Your Study Plans
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/study-plan')}
                startIcon={<Book />}
              >
                Create New Plan
              </Button>
            </Box>
            {loading ? (
              <LinearProgress />
            ) : studyPlans && studyPlans.length > 0 ? (
              <Grid container spacing={2}>
                {studyPlans.map((plan) => (
                  <Grid item xs={12} key={plan._id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {plan.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ flexGrow: 1, mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={(plan.topics.filter(t => t.status === 'completed').length / plan.topics.length) * 100}
                              color={getProgressColor((plan.topics.filter(t => t.status === 'completed').length / plan.topics.length) * 100)}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {Math.round((plan.topics.filter(t => t.status === 'completed').length / plan.topics.length) * 100)}%
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {plan.topics.filter(t => t.status === 'completed').length} of {plan.topics.length} topics completed
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body1" color="text.secondary" align="center">
                No study plans yet. Create one to get started!
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {getRecentActivity().map((topic, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {topic.status === 'completed' ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Warning color="warning" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={topic.title}
                    secondary={`Last studied: ${new Date(topic.lastStudied).toLocaleDateString()}`}
                  />
                </ListItem>
              ))}
              {getRecentActivity().length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No recent activity"
                    secondary="Start studying to see your progress here!"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 