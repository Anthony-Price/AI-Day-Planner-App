import React, { useState, useMemo, useEffect } from 'react';
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
  PaletteMode,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment
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
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import * as dateFns from 'date-fns';
import TimerIcon from '@mui/icons-material/Timer';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import Advertisement from './components/Advertisement';

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

interface PomodoroState {
  isRunning: boolean;
  timeLeft: number;
  mode: 'work' | 'break' | 'longBreak';
  cycles: number;
}

type SortOption = 'priority' | 'date' | 'category';
type FilterOption = 'all' | 'today' | 'completed' | 'pending';

function App() {
  // State management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');
  const [editValue, setEditValue] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [showCustomizationDialog, setShowCustomizationDialog] = useState(false);
  const [showPomodoroDialog, setShowPomodoroDialog] = useState(false);
  const [categories] = useState<string[]>(['Work', 'Personal', 'Shopping', 'Health']);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    theme: 'light',
    primaryColor: '#1976d2',
    notificationSound: 'default',
    showAnalytics: false
  });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [pomodoroState, setPomodoroState] = useState<PomodoroState>({
    isRunning: false,
    timeLeft: 25 * 60, // 25 minutes in seconds
    mode: 'work',
    cycles: 0
  });

  // Available notification sounds
  const notificationSounds = [
    { value: 'default', label: 'Default' },
    { value: 'bell', label: 'Bell' },
    { value: 'chime', label: 'Chime' },
    { value: 'digital', label: 'Digital' }
  ];

  // Available theme colors
  const themeColors = [
    { value: '#1976d2', label: 'Blue' },
    { value: '#2e7d32', label: 'Green' },
    { value: '#d32f2f', label: 'Red' },
    { value: '#ed6c02', label: 'Orange' },
    { value: '#9c27b0', label: 'Purple' }
  ];

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

  // Pomodoro timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (pomodoroState.isRunning && pomodoroState.timeLeft > 0) {
      interval = setInterval(() => {
        setPomodoroState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
    } else if (pomodoroState.timeLeft === 0) {
      // Timer completed
      const audio = new Audio('/notification.mp3');
      audio.play();

      if (pomodoroState.mode === 'work') {
        setPomodoroState(prev => ({
          ...prev,
          mode: prev.cycles % 4 === 3 ? 'longBreak' : 'break',
          timeLeft: prev.cycles % 4 === 3 ? 15 * 60 : 5 * 60, // 15 or 5 minutes
          isRunning: false
        }));
      } else {
        setPomodoroState(prev => ({
          ...prev,
          mode: 'work',
          timeLeft: 25 * 60,
          cycles: prev.cycles + 1,
          isRunning: false
        }));
      }
    }

    return () => clearInterval(interval);
  }, [pomodoroState.isRunning, pomodoroState.timeLeft]);

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filteredTasks = [...tasks];

    // Apply search filter
    if (searchQuery) {
      filteredTasks = filteredTasks.filter(task =>
        task.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category/status filter
    switch (filterBy) {
      case 'today':
        filteredTasks = filteredTasks.filter(task =>
          dateFns.isSameDay(new Date(task.completionDate || ''), new Date())
        );
        break;
      case 'completed':
        filteredTasks = filteredTasks.filter(task => task.completed);
        break;
      case 'pending':
        filteredTasks = filteredTasks.filter(task => !task.completed);
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'priority':
        filteredTasks.sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        break;
      case 'date':
        filteredTasks.sort((a, b) => {
          const dateA = a.completionDate ? new Date(a.completionDate).getTime() : 0;
          const dateB = b.completionDate ? new Date(b.completionDate).getTime() : 0;
          return dateA - dateB;
        });
        break;
      case 'category':
        filteredTasks.sort((a, b) => a.category.localeCompare(b.category));
        break;
    }

    return filteredTasks;
  }, [tasks, searchQuery, sortBy, filterBy]);

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
    // Show customization dialog after upgrade
    setShowCustomizationDialog(true);
  };

  const handleThemeChange = (newTheme: PaletteMode) => {
    setUserPreferences(prev => ({
      ...prev,
      theme: newTheme
    }));
  };

  const handleColorChange = (newColor: string) => {
    setUserPreferences(prev => ({
      ...prev,
      primaryColor: newColor
    }));
  };

  const handleNotificationSoundChange = (newSound: string) => {
    setUserPreferences(prev => ({
      ...prev,
      notificationSound: newSound
    }));
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

  const handlePomodoroStart = () => {
    setPomodoroState(prev => ({ ...prev, isRunning: true }));
  };

  const handlePomodoroPause = () => {
    setPomodoroState(prev => ({ ...prev, isRunning: false }));
  };

  const handlePomodoroReset = () => {
    setPomodoroState({
      isRunning: false,
      timeLeft: 25 * 60,
      mode: 'work',
      cycles: 0
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
            {isPremium && (
              <Tooltip title="Customize Theme">
                <IconButton 
                  color="inherit" 
                  onClick={() => setShowCustomizationDialog(true)}
                  sx={{
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    }
                  }}
                >
                  <PaletteIcon />
                </IconButton>
              </Tooltip>
            )}
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
                onClick={() => isPremium ? setShowCustomizationDialog(true) : setShowPremiumDialog(true)}
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

        <Container maxWidth="lg" sx={{ mt: 4 }}>
          {/* Top Advertisement */}
          <Box sx={{ mb: 3 }}>
            <Advertisement 
              slot="YOUR_AD_SLOT_ID_1" 
              style={{ width: '100%', height: '90px' }}
            />
          </Box>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 3,
            alignItems: 'stretch'
          }}>
            {/* Left Column - Date and Pomodoro */}
            <Box sx={{ 
              width: { xs: '100%', md: '25%' }, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 3,
              flex: '0 0 auto'
            }}>
              {/* Date Tile */}
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h4" gutterBottom>
                    {dateFns.format(selectedDate, 'EEEE')}
                  </Typography>
                  <Typography variant="h5" color="text.secondary">
                    {dateFns.format(selectedDate, 'MMMM d, yyyy')}
                  </Typography>
                </CardContent>
              </Card>

              {/* Pomodoro Timer Tile */}
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TimerIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Pomodoro Timer</Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: 2
                  }}>
                    <Typography variant="h3" color="primary">
                      {formatTime(pomodoroState.timeLeft)}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {pomodoroState.mode === 'work' ? 'Focus Time' : 
                       pomodoroState.mode === 'break' ? 'Short Break' : 'Long Break'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed Cycles: {pomodoroState.cycles}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      {!pomodoroState.isRunning ? (
                        <Button
                          variant="contained"
                          startIcon={<PlayArrowIcon />}
                          onClick={handlePomodoroStart}
                          size="small"
                        >
                          Start
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          startIcon={<PauseIcon />}
                          onClick={handlePomodoroPause}
                          size="small"
                        >
                          Pause
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        startIcon={<StopIcon />}
                        onClick={handlePomodoroReset}
                        size="small"
                      >
                        Reset
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Calendar View */}
            <Box sx={{ 
              width: { xs: '100%', md: '75%' },
              flex: '1 1 auto',
              display: 'flex'
            }}>
              <Card elevation={3} sx={{ 
                width: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardContent sx={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  p: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarMonthIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Calendar</Typography>
                  </Box>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateCalendar
                      value={selectedDate}
                      onChange={(newDate: Date | null) => newDate && setSelectedDate(newDate)}
                      sx={{
                        width: '100%',
                        flex: 1,
                        '& .MuiPickersCalendarHeader-root': {
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        },
                        '& .MuiPickersCalendarHeader-label': {
                          textTransform: 'capitalize',
                        },
                        '& .MuiDayCalendar-root': {
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column'
                        },
                        '& .MuiDayCalendar-monthContainer': {
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column'
                        },
                        '& .MuiDayCalendar-weekContainer': {
                          flex: 1
                        }
                      }}
                    />
                  </LocalizationProvider>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Side Advertisement */}
          <Box sx={{ 
            mt: 3,
            display: { xs: 'none', md: 'block' },
            position: 'fixed',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '160px'
          }}>
            <Advertisement 
              slot="YOUR_AD_SLOT_ID_2"
              style={{ width: '160px', height: '600px' }}
            />
          </Box>

          {/* Bottom Advertisement */}
          <Box sx={{ mt: 3, mb: 3 }}>
            <Advertisement 
              slot="YOUR_AD_SLOT_ID_3"
              style={{ width: '100%', height: '90px' }}
            />
          </Box>

          {/* Tasks Section */}
          <Box sx={{ mt: 3 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Today's Tasks
              </Typography>

              {/* Search and Filter Bar */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ flexGrow: 1 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    label="Sort By"
                    startAdornment={
                      <InputAdornment position="start">
                        <SortIcon />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="priority">Priority</MenuItem>
                    <MenuItem value="date">Date</MenuItem>
                    <MenuItem value="category">Category</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Filter</InputLabel>
                  <Select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                    label="Filter"
                    startAdornment={
                      <InputAdornment position="start">
                        <FilterListIcon />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="all">All Tasks</MenuItem>
                    <MenuItem value="today">Today</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                  </Select>
                </FormControl>
              </Box>

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
                {filteredAndSortedTasks.map((task) => (
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
          </Box>
        </Container>

        {/* Pomodoro Timer Dialog */}
        <Dialog 
          open={showPomodoroDialog} 
          onClose={() => setShowPomodoroDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimerIcon />
              Pomodoro Timer
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: 2,
              py: 2
            }}>
              <Typography variant="h3" color="primary">
                {formatTime(pomodoroState.timeLeft)}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {pomodoroState.mode === 'work' ? 'Focus Time' : 
                 pomodoroState.mode === 'break' ? 'Short Break' : 'Long Break'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed Cycles: {pomodoroState.cycles}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                {!pomodoroState.isRunning ? (
                  <Button
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    onClick={handlePomodoroStart}
                  >
                    Start
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<PauseIcon />}
                    onClick={handlePomodoroPause}
                  >
                    Pause
                  </Button>
                )}
                <Button
                  variant="outlined"
                  startIcon={<StopIcon />}
                  onClick={handlePomodoroReset}
                >
                  Reset
                </Button>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPomodoroDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

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

        {/* Theme Customization Dialog */}
        <Dialog open={showCustomizationDialog} onClose={() => setShowCustomizationDialog(false)}>
          <DialogTitle>Customize Your Experience</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Theme Mode</InputLabel>
                <Select
                  value={userPreferences.theme}
                  onChange={(e) => handleThemeChange(e.target.value as PaletteMode)}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Primary Color</InputLabel>
                <Select
                  value={userPreferences.primaryColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                >
                  {themeColors.map(color => (
                    <MenuItem key={color.value} value={color.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            backgroundColor: color.value,
                            borderRadius: '50%',
                            border: '1px solid #ccc'
                          }}
                        />
                        {color.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Notification Sound</InputLabel>
                <Select
                  value={userPreferences.notificationSound}
                  onChange={(e) => handleNotificationSoundChange(e.target.value)}
                >
                  {notificationSounds.map(sound => (
                    <MenuItem key={sound.value} value={sound.value}>
                      {sound.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCustomizationDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default App;
