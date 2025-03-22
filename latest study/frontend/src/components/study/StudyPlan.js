import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon
} from '@mui/icons-material';
import {
  fetchStudyPlan,
  createStudyPlan,
  updateStudyPlan,
  deleteStudyPlan,
  updateTopicStatus,
  addFeedback
} from '../../store/slices/studyPlanSlice';

const StudyPlan = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentStudyPlan, loading, error } = useSelector((state) => state.studyPlan);
  const [isEditing, setIsEditing] = useState(false);
  const [isNewPlan, setIsNewPlan] = useState(!id);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topics: []
  });
  const [newTopic, setNewTopic] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchStudyPlan(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentStudyPlan && !isNewPlan) {
      setFormData(currentStudyPlan);
    }
  }, [currentStudyPlan, isNewPlan]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddTopic = () => {
    if (newTopic.trim()) {
      setFormData({
        ...formData,
        topics: [
          ...formData.topics,
          {
            title: newTopic.trim(),
            status: 'pending',
            lastStudied: null
          }
        ]
      });
      setNewTopic('');
    }
  };

  const handleRemoveTopic = (index) => {
    setFormData({
      ...formData,
      topics: formData.topics.filter((_, i) => i !== index)
    });
  };

  const handleStatusToggle = (topicIndex) => {
    const updatedTopics = [...formData.topics];
    const topic = updatedTopics[topicIndex];
    topic.status = topic.status === 'completed' ? 'pending' : 'completed';
    topic.lastStudied = topic.status === 'completed' ? new Date().toISOString() : null;
    setFormData({ ...formData, topics: updatedTopics });
  };

  const handleSubmit = async () => {
    const action = isNewPlan ? createStudyPlan : updateStudyPlan;
    const result = await dispatch(action(formData));
    if (!result.error) {
      navigate('/dashboard');
    }
  };

  const handleDelete = async () => {
    const result = await dispatch(deleteStudyPlan(id));
    if (!result.error) {
      navigate('/dashboard');
    }
  };

  const handleAddFeedback = async () => {
    if (feedback.trim()) {
      const result = await dispatch(addFeedback({ studyPlanId: id, feedback: feedback.trim() }));
      if (!result.error) {
        setFeedback('');
      }
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        {isEditing || isNewPlan ? (
          <>
            <Typography variant="h5" gutterBottom>
              {isNewPlan ? 'Create New Study Plan' : 'Edit Study Plan'}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Add Topic"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTopic()}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddTopic}
                    startIcon={<AddIcon />}
                  >
                    Add
                  </Button>
                </Box>
                <List>
                  {formData.topics.map((topic, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={topic.title} />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveTopic(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => isNewPlan ? navigate('/dashboard') : setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!formData.title || formData.topics.length === 0}
                  >
                    {isNewPlan ? 'Create Plan' : 'Save Changes'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">{currentStudyPlan.title}</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => setIsEditing(true)}
                  startIcon={<EditIcon />}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setOpenDialog(true)}
                  startIcon={<DeleteIcon />}
                >
                  Delete
                </Button>
              </Box>
            </Box>
            <Typography variant="body1" paragraph>
              {currentStudyPlan.description}
            </Typography>
            <List>
              {currentStudyPlan.topics.map((topic, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={topic.title}
                    secondary={topic.lastStudied ? `Last studied: ${new Date(topic.lastStudied).toLocaleDateString()}` : null}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleStatusToggle(index)}
                      color={topic.status === 'completed' ? 'success' : 'default'}
                    >
                      {topic.status === 'completed' ? <CheckCircleIcon /> : <UncheckedIcon />}
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Add Feedback
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  label="Your feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  multiline
                  rows={2}
                />
                <Button
                  variant="contained"
                  onClick={handleAddFeedback}
                  disabled={!feedback.trim()}
                >
                  Submit
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Delete Study Plan</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this study plan? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudyPlan; 