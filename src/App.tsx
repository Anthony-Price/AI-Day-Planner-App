import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Paper, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  Box,
  IconButton,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  ThemeProvider,
  createTheme,
  PaletteMode
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LockIcon from '@mui/icons-material/Lock';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PaletteIcon from '@mui/icons-material/Palette';
import InsightsIcon from '@mui/icons-material/Insights';

// Define interfaces
interface Task {
  id: number;
  text: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  reminder?: Date;
  completed: boolean;
  completionDate?: Date;
  aiSuggested?: boolean;
}

interface UserPreferences {
  theme: PaletteMode;
  primaryColor: string;
  notificationSound: string;
  showAnalytics: boolean;
}

function App() {
  // State management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');
  const [editValue, setEditValue] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [categories] = useState<string[]>(['Work', 'Personal', 'Shopping', 'Health']);
  const [userPreferences] = useState<UserPreferences>({
    theme: 'light',
    primaryColor: '#1976d2',
    notificationSound: 'default',
    showAnalytics: false
  });
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Create theme based on user preferences
  const theme = createTheme({
    palette: {
      mode: userPreferences.theme,
      primary: {
        main: userPreferences.primaryColor,
      },
    },
  });

  // Analytics calculations
  const taskAnalytics = {
    total: tasks.length,
    completed: tasks.filter(task => task.completed).length,
    byPriority: {
      high: tasks.filter(task => task.priority === 'high').length,
      medium: tasks.filter(task => task.priority === 'medium').length,
      low: tasks.filter(task => task.priority === 'low').length,
    },
    byCategory: categories.reduce((acc, category) => ({
      ...acc,
      [category]: tasks.filter(task => task.category === category).length
    }), {}),
    completionRate: tasks.length ? 
      (tasks.filter(task => task.completed).length / tasks.length) * 100 : 0
  };

  // AI Suggestions
  const generateAISuggestions = () => {
    if (!isPremium) return;
    
    const incompleteTasks = tasks.filter(task => !task.completed);
    const highPriorityTasks = incompleteTasks.filter(task => task.priority === 'high');
    
    if (highPriorityTasks.length > 0) {
      return `Consider completing these high-priority tasks first: ${highPriorityTasks.map(t => t.text).join(', ')}`;
    }
    
    return 'All high-priority tasks are completed! Great job!';
  };

  const handleAddTask = () => {
    if (input.trim()) {
      const newTask: Task = {
        id: Date.now(),
        text: input.trim(),
        priority: 'medium',
        category: categories[0],
        completed: false
      };
      setTasks([...tasks, newTask]);
      setInput('');
    }
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setEditValue(task.text);
    setShowTaskDialog(true);
  };

  const handleSaveEdit = () => {
    if (selectedTask && editValue.trim()) {
      const updatedTasks = tasks.map(task => 
        task.id === selectedTask.id ? { ...task, text: editValue.trim() } : task
      );
      setTasks(updatedTasks);
      setShowTaskDialog(false);
      setSelectedTask(null);
      setEditValue('');
    }
  };

  const handleToggleComplete = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            completed: !task.completed,
            completionDate: !task.completed ? new Date() : undefined
          }
        : task
    ));
  };

  const handleUpgradeToPremium = () => {
    // Here you would integrate with your payment provider
    setIsPremium(true);
    setShowPremiumDialog(false);
  };

  const handlePriorityChange = (taskId: number, newPriority: 'low' | 'medium' | 'high') => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, priority: newPriority } : task
    ));
  };

  const handleCategoryChange = (taskId: number, newCategory: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, category: newCategory } : task
    ));
  };

  const ActionButton = ({ 
    icon, 
    label, 
    onClick, 
    color = "default" 
  }: { 
    icon: React.ReactNode, 
    label: string, 
    onClick: () => void,
    color?: "default" | "primary" | "error"
  }) => (
    <Tooltip title={label}>
      <IconButton 
        edge="end" 
        aria-label={label}
        onClick={onClick}
        size="small"
        color={color}
        sx={{
          transition: 'opacity 0.2s, transform 0.2s',
          '&:hover': {
            transform: 'scale(1.1)',
          }
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );

  const PriorityChip = ({ priority, onClick }: { priority: 'low' | 'medium' | 'high', onClick: () => void }) => (
    <Chip 
      size="small" 
      label={priority}
      color={priority === 'high' ? 'error' : priority === 'medium' ? 'warning' : 'success'}
      onClick={onClick}
      sx={{ cursor: 'pointer' }}
    />
  );

  const CategoryChip = ({ category, onClick }: { category: string, onClick: () => void }) => (
    <Chip 
      size="small" 
      label={category}
      variant="outlined"
      onClick={onClick}
      sx={{ cursor: 'pointer' }}
    />
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              AI Day Planner
            </Typography>
            <Tooltip title="View Analytics">
              <IconButton 
                color="inherit" 
                onClick={() => setShowAnalytics(!showAnalytics)}
                sx={{
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  }
                }}
              >
                <InsightsIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={isPremium ? "Premium Active" : "Upgrade to Premium"}>
              <Button 
                color="inherit" 
                onClick={() => setShowPremiumDialog(true)}
                startIcon={isPremium ? <StarIcon /> : <LockIcon />}
                sx={{
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  }
                }}
              >
                {isPremium ? 'Premium' : 'Upgrade'}
              </Button>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Today's Tasks
            </Typography>

            {/* AI Suggestions (Premium) */}
            {isPremium && (
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <Typography variant="subtitle1">
                  <SmartToyIcon sx={{ mr: 1 }} />
                  AI Suggestion: {generateAISuggestions()}
                </Typography>
              </Paper>
            )}

            {/* Analytics Dashboard (Premium) */}
            {isPremium && showAnalytics && (
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>Analytics</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Chip label={`Completion Rate: ${taskAnalytics.completionRate.toFixed(1)}%`} />
                  <Chip label={`Total Tasks: ${taskAnalytics.total}`} />
                  <Chip label={`Completed: ${taskAnalytics.completed}`} />
                </Box>
              </Paper>
            )}

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Add a new task"
                variant="outlined"
                fullWidth
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddTask(); }}
              />
              <Button variant="contained" onClick={handleAddTask} sx={{ minWidth: 100 }}>
                Add
              </Button>
            </Box>

            <List>
              {tasks.map((task) => (
                <ListItem 
                  key={task.id} 
                  divider
                  sx={{
                    '&:hover .task-actions': {
                      opacity: 1,
                    },
                    '&:hover .task-actions button': {
                      opacity: 1,
                    }
                  }}
                >
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Switch
                          checked={task.completed}
                          onChange={() => handleToggleComplete(task.id)}
                          size="small"
                        />
                        <Typography
                          sx={{
                            textDecoration: task.completed ? 'line-through' : 'none',
                            color: task.completed ? 'text.secondary' : 'text.primary'
                          }}
                        >
                          {task.text}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        <Tooltip title="Click to change priority">
                          <PriorityChip 
                            priority={task.priority}
                            onClick={() => {
                              const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
                              const currentIndex = priorities.indexOf(task.priority);
                              const nextPriority = priorities[(currentIndex + 1) % priorities.length];
                              handlePriorityChange(task.id, nextPriority);
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="Click to change category">
                          <CategoryChip 
                            category={task.category}
                            onClick={() => {
                              const currentIndex = categories.indexOf(task.category);
                              const nextCategory = categories[(currentIndex + 1) % categories.length];
                              handleCategoryChange(task.id, nextCategory);
                            }}
                          />
                        </Tooltip>
                        {task.reminder && (
                          <Chip 
                            size="small" 
                            icon={<NotificationsIcon />}
                            label={new Date(task.reminder).toLocaleTimeString()}
                          />
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction 
                    className="task-actions" 
                    sx={{ 
                      display: 'flex',
                      gap: 1,
                      alignItems: 'center'
                    }}
                  >
                    <ActionButton
                      icon={<SmartToyIcon />}
                      label="AI Suggestions"
                      onClick={() => !isPremium && setShowPremiumDialog(true)}
                      color={isPremium ? "primary" : "default"}
                    />
                    <ActionButton
                      icon={<EditIcon />}
                      label="Edit Task"
                      onClick={() => handleEditTask(task)}
                    />
                    <ActionButton
                      icon={<DeleteIcon />}
                      label="Delete Task"
                      onClick={() => handleDeleteTask(task.id)}
                      color="error"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Container>

        {/* Premium Features Dialog */}
        <Dialog open={showPremiumDialog} onClose={() => setShowPremiumDialog(false)}>
          <DialogTitle>Upgrade to Premium</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Unlock these premium features:
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="AI-Powered Features" 
                  secondary="Smart task prioritization, automated categorization, and intelligent suggestions"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Advanced Analytics" 
                  secondary="Task completion analytics, productivity reports, and time management insights"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Enhanced Customization" 
                  secondary="Custom themes, advanced templates, and custom notification sounds"
                />
              </ListItem>
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPremiumDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleUpgradeToPremium}
              startIcon={<StarIcon />}
            >
              Upgrade Now
            </Button>
          </DialogActions>
        </Dialog>

        {/* Task Edit Dialog */}
        <Dialog open={showTaskDialog} onClose={() => setShowTaskDialog(false)}>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Priority</InputLabel>
              <Select
                value={selectedTask?.priority || 'medium'}
                onChange={(e) => setSelectedTask(prev => prev ? {...prev, priority: e.target.value as 'low' | 'medium' | 'high'} : null)}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedTask?.category || categories[0]}
                onChange={(e) => setSelectedTask(prev => prev ? {...prev, category: e.target.value} : null)}
              >
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowTaskDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveEdit}>Save</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default App;
