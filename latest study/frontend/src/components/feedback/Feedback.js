import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Feedback as FeedbackIcon,
  Send as SendIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon
} from '@mui/icons-material';
import { fetchStudyPlans } from '../../store/slices/studyPlanSlice';
import { addFeedback } from '../../store/slices/studyPlanSlice';

const Feedback = () => {
  const dispatch = useDispatch();
  const { studyPlans } = useSelector((state) => state.studyPlan);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchStudyPlans());
  }, [dispatch]);

  const handleSubmit = async () => {
    if (!feedback.trim() || !selectedPlan) return;

    setLoading(true);
    try {
      await dispatch(addFeedback({ studyPlanId: selectedPlan, feedback: feedback.trim() }));
      setFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedPlan = () => {
    return studyPlans?.find(plan => plan._id === selectedPlan);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Study Feedback
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

      {selectedPlan ? (
        <Grid container spacing={3}>
          {/* Feedback Form */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Add Feedback
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Your feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!feedback.trim() || loading}
                  startIcon={<SendIcon />}
                >
                  Submit Feedback
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Feedback List */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Feedback History
              </Typography>
              <List>
                {getSelectedPlan()?.feedback?.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar>
                          <FeedbackIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </Typography>
                            {item.sentiment && (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {item.sentiment === 'positive' ? (
                                  <ThumbUpIcon color="success" fontSize="small" />
                                ) : (
                                  <ThumbDownIcon color="error" fontSize="small" />
                                )}
                              </Box>
                            )}
                          </Box>
                        }
                        secondary={
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {item.content}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < getSelectedPlan()?.feedback?.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
                {(!getSelectedPlan()?.feedback || getSelectedPlan()?.feedback.length === 0) && (
                  <ListItem>
                    <ListItemText
                      primary="No feedback yet"
                      secondary="Be the first to share your thoughts about this study plan!"
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Select a study plan to view and add feedback
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Feedback; 