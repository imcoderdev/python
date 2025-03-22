import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert
} from '@mui/material';
import {
  Timeline,
  TrendingUp,
  CheckCircle,
  Warning,
  Timer,
  EmojiEvents
} from '@mui/icons-material';
import { fetchAnalytics, fetchStudyInsights } from '../../store/slices/analyticsSlice';
import { fetchStudyPlans } from '../../store/slices/studyPlanSlice';

const Analytics = () => {
  const dispatch = useDispatch();
  const { analytics, insights, loading, error } = useSelector((state) => state.analytics);
  const { studyPlans } = useSelector((state) => state.studyPlan);
  const [selectedPlan, setSelectedPlan] = useState('');

  useEffect(() => {
    dispatch(fetchStudyPlans());
  }, [dispatch]);

  useEffect(() => {
    if (selectedPlan) {
      dispatch(fetchAnalytics(selectedPlan));
      dispatch(fetchStudyInsights(selectedPlan));
    }
  }, [dispatch, selectedPlan]);

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'success';
    if (progress >= 50) return 'warning';
    return 'error';
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Study Analytics
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Study Plan</InputLabel>
        <Select
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
          label="Select Study Plan"
        >
          {studyPlans?.map((plan) => (
            <MenuItem key={plan._id} value={plan._id}>
              {plan.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedPlan && analytics ? (
        <Grid container spacing={3}>
          {/* Progress Overview */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Overall Progress
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ flexGrow: 1, mr: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={analytics.overallProgress}
                      color={getProgressColor(analytics.overallProgress)}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {analytics.overallProgress}%
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {analytics.completedTopics} of {analytics.totalTopics} topics completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Study Time */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Study Time
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Timer sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h4">
                    {formatDuration(analytics.totalStudyTime)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Average {formatDuration(analytics.averageStudyTime)} per session
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Streak */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Streak
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmojiEvents sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="h4">
                    {analytics.currentStreak} days
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Longest streak: {analytics.longestStreak} days
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Topic Progress */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Topic Progress
              </Typography>
              <List>
                {analytics.topicProgress.map((topic, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {topic.progress >= 100 ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Warning color="warning" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={topic.title}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={topic.progress}
                              color={getProgressColor(topic.progress)}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {topic.progress}%
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Study Insights */}
          {insights && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Study Insights
                </Typography>
                <List>
                  {insights.map((insight, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <TrendingUp color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={insight} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          )}
        </Grid>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Select a study plan to view analytics
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Analytics; 