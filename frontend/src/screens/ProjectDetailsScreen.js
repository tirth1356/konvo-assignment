import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, Animated
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Feather } from '@expo/vector-icons';
import { fetchTasks, createTask, updateTask, deleteTask } from '../store/slices/taskSlice';
import { useTheme } from '../theme/ThemeContext';

const FILTERS = ['All', 'Pending', 'Completed'];
const SORTS = [
  { key: 'created', label: 'Newest', icon: 'clock' },
  { key: 'due', label: 'Due Date', icon: 'calendar' },
  { key: 'status', label: 'Status', icon: 'check-square' },
];

export default function ProjectDetailsScreen({ route, navigation }) {
  const { projectId, projectTitle } = route.params;
  const { theme, isDark } = useTheme();
  const dispatch = useDispatch();

  const tasks = useSelector((s) => s.tasks.tasksByProject[projectId] || []);
  const loading = useSelector((s) => s.tasks.loading);

  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('created');
  const [search, setSearch] = useState('');

  const [createVisible, setCreateVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [taskTitle, setTaskTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [editTitle, setEditTitle] = useState('');
  const [editDue, setEditDue] = useState('');
  const [editPriority, setEditPriority] = useState('medium');

  const progressAnim = useRef(new Animated.Value(0)).current;
  const createTitleRef = useRef(null);
  const editTitleRef = useRef(null);

  useEffect(() => { dispatch(fetchTasks(projectId)); }, [projectId]);

  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'completed').length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: pct,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const openEdit = (task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDue(task.due_date ? task.due_date.split('T')[0] : '');
    setEditPriority(task.priority || 'medium');
    setEditVisible(true);
  };

  const handleCreate = () => {
    if (!taskTitle.trim()) return;
    dispatch(createTask({ projectId, taskData: { title: taskTitle.trim(), due_date: dueDate || null, priority: taskPriority } }));
    setTaskTitle('');
    setDueDate('');
    setTaskPriority('medium');
    setCreateVisible(false);
  };

  const handleEditSave = () => {
    if (!editTitle.trim() || !editingTask) return;
    dispatch(updateTask({
      id: editingTask.id,
      projectId,
      taskData: { title: editTitle.trim(), due_date: editDue || null, priority: editPriority },
      previousStatus: editingTask.status,
    }));
    setEditVisible(false);
    setEditingTask(null);
  };

  const handleToggle = (task) => {
    dispatch(updateTask({
      id: task.id,
      projectId,
      taskData: { status: task.status === 'completed' ? 'pending' : 'completed' },
      previousStatus: task.status,
    }));
  };

  const handleDelete = (task) => {
    dispatch(deleteTask({ id: task.id, projectId, isCompleted: task.status === 'completed' }));
  };

  const isOverdue = (due) => due && new Date(due) < new Date(new Date().toDateString());

  const getFiltered = () => {
    let list = [...tasks];

    if (search) list = list.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
    if (filter === 'Completed') list = list.filter(t => t.status === 'completed');
    if (filter === 'Pending') list = list.filter(t => t.status === 'pending');

    if (sort === 'due') {
      list.sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      });
    } else if (sort === 'status') {
      list.sort((a, b) => (a.status === 'pending' ? -1 : 1));
    } else {
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return list;
  };

  const tabCounts = {
    All: tasks.length,
    Pending: tasks.filter(t => t.status === 'pending').length,
    Completed: done,
  };

  const filtered = getFiltered();

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.primaryLight,
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginRight: 14,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 6,
    },
    backBtnText: { color: theme.primary, fontWeight: '700', fontSize: 14 },
    pageTitle: { fontSize: 18, fontWeight: '800', color: theme.text, flex: 1, letterSpacing: -0.4 },
    scrollContent: { padding: 20 },
    statsCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 20,
    },
    statsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    statsLeft: {},
    statsTitle: { fontSize: 13, color: theme.textSecondary, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    statsPct: { fontSize: 36, fontWeight: '800', color: theme.primary, letterSpacing: -1 },
    statsSubtitle: { fontSize: 13, color: theme.textSecondary },
    statsMini: { flexDirection: 'row', gap: 10 },
    miniStat: {
      alignItems: 'center',
      backgroundColor: theme.primaryLight,
      borderRadius: 12,
      padding: 12,
      minWidth: 64,
    },
    miniStatDone: { backgroundColor: theme.successLight },
    miniStatVal: { fontSize: 20, fontWeight: '800', color: theme.primary, marginBottom: 2 },
    miniStatValDone: { color: theme.success },
    miniStatLabel: { fontSize: 11, color: theme.textSecondary, fontWeight: '600' },
    progressBg: {
      height: 8,
      backgroundColor: theme.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: { height: '100%', borderRadius: 4 },
    celebrationBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.successLight,
      borderRadius: 10,
      padding: 10,
      marginTop: 12,
      gap: 8,
    },
    celebrationText: { color: theme.success, fontWeight: '700', fontSize: 14 },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 15,
      color: theme.text,
      marginLeft: 10,
      outlineWidth: 0,
    },
    controlsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      flexWrap: 'wrap',
      gap: 8,
    },
    filterTabs: { flexDirection: 'row', gap: 6 },
    filterTab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 7,
      paddingHorizontal: 12,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card,
      gap: 5,
    },
    activeTab: { backgroundColor: theme.primary, borderColor: theme.primary },
    filterTabText: { fontSize: 13, fontWeight: '600', color: theme.textSecondary },
    activeTabText: { color: '#fff' },
    tabBadge: {
      backgroundColor: theme.border,
      borderRadius: 10,
      minWidth: 18,
      height: 18,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    activeBadge: { backgroundColor: 'rgba(255,255,255,0.25)' },
    tabBadgeText: { fontSize: 10, fontWeight: '800', color: theme.textSecondary },
    activeBadgeText: { color: '#fff' },
    rightControls: { flexDirection: 'row', gap: 8 },
    sortRow: { flexDirection: 'row', gap: 6, marginBottom: 16 },
    sortBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card,
      gap: 4,
    },
    activeSortBtn: { borderColor: theme.primary, backgroundColor: theme.primaryLight },
    sortBtnText: { fontSize: 12, fontWeight: '600', color: theme.textSecondary },
    activeSortBtnText: { color: theme.primary },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.primary,
      borderRadius: 10,
      paddingVertical: 9,
      paddingHorizontal: 14,
      gap: 6,
    },
    addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    taskCard: {
      backgroundColor: theme.card,
      borderRadius: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 12,
    },
    taskCardDone: {
      borderColor: theme.success + '30',
      backgroundColor: isDark ? '#050f08' : '#f0fdf4',
    },
    taskCardOverdue: {
      borderColor: theme.danger + '30',
      backgroundColor: isDark ? '#100505' : '#fff5f5',
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 7,
      borderWidth: 2,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxDone: { backgroundColor: theme.success, borderColor: theme.success },
    taskInfo: { flex: 1 },
    taskTitle: { fontSize: 15, fontWeight: '600', color: theme.text, marginBottom: 6 },
    taskTitleDone: { textDecorationLine: 'line-through', color: theme.textSecondary },
    taskMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
    statusTag: {
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      backgroundColor: theme.primaryLight,
    },
    statusTagDone: { backgroundColor: theme.successLight },
    statusTagOverdue: { backgroundColor: theme.dangerLight },
    statusText: { fontSize: 11, fontWeight: '700', color: theme.primary, textTransform: 'uppercase', letterSpacing: 0.4 },
    statusTextDone: { color: theme.success },
    statusTextOverdue: { color: theme.danger },
    dueTag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.tag,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      gap: 4,
    },
    dueTagOverdue: { backgroundColor: theme.dangerLight },
    dueText: { fontSize: 11, fontWeight: '600', color: theme.tagText },
    dueTextOverdue: { color: theme.danger },
    priorityRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
    priorityBtn: {
      flex: 1, paddingVertical: 9, borderRadius: 8, borderWidth: 1,
      borderColor: theme.border, alignItems: 'center',
    },
    priorityBtnText: { fontSize: 12, fontWeight: '700' },
    taskActions: { flexDirection: 'row', gap: 4 },
    iconActionBtn: {
      padding: 7,
      borderRadius: 8,
      backgroundColor: isDark ? '#1a1a1a' : '#f5f5f0',
      borderWidth: 1,
      borderColor: theme.border,
    },
    emptyWrap: { alignItems: 'center', paddingVertical: 60 },
    emptyIcon: { marginBottom: 16, opacity: 0.4 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 8 },
    emptyDesc: { fontSize: 14, color: theme.textSecondary, textAlign: 'center' },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.65)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modal: {
      width: '100%',
      maxWidth: 440,
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 28,
      borderWidth: 1,
      borderColor: theme.border,
    },
    modalTitle: { fontSize: 20, fontWeight: '800', color: theme.text, marginBottom: 22, letterSpacing: -0.4 },
    label: {
      fontSize: 12, fontWeight: '700', color: theme.textSecondary,
      textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8,
    },
    input: {
      backgroundColor: theme.inputBg,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: theme.text,
      marginBottom: 18,
      outlineWidth: 0,
    },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 6 },
    cancelBtn: {
      paddingVertical: 12, paddingHorizontal: 20,
      borderRadius: 10, borderWidth: 1, borderColor: theme.border,
    },
    cancelBtnText: { color: theme.textSecondary, fontWeight: '600' },
    saveBtn: {
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: 12, paddingHorizontal: 24,
      borderRadius: 10, backgroundColor: theme.primary, gap: 6,
    },
    saveBtnText: { color: '#fff', fontWeight: '700' },
  });

  const PRIORITY_COLORS = {
    high: { bg: theme.dangerLight, text: theme.danger },
    medium: { bg: isDark ? '#1a1200' : '#fef9c3', text: isDark ? '#fbbf24' : '#92400e' },
    low: { bg: theme.successLight, text: theme.success },
  };

  const renderTask = ({ item }) => {
    const isDone = item.status === 'completed';
    const overdue = isOverdue(item.due_date) && !isDone;
    const priority = item.priority || 'medium';
    const pc = PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;

    let cardStyle = s.taskCard;
    if (isDone) cardStyle = [s.taskCard, s.taskCardDone];
    else if (overdue) cardStyle = [s.taskCard, s.taskCardOverdue];

    return (
      <View style={cardStyle}>
        <TouchableOpacity
          style={[s.checkbox, isDone && s.checkboxDone]}
          onPress={() => handleToggle(item)}
        >
          {isDone && <Feather name="check" size={14} color="#fff" />}
        </TouchableOpacity>

        <View style={s.taskInfo}>
          <Text style={[s.taskTitle, isDone && s.taskTitleDone]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={s.taskMeta}>
            <View style={[s.statusTag, isDone && s.statusTagDone, overdue && s.statusTagOverdue]}>
              <Text style={[s.statusText, isDone && s.statusTextDone, overdue && s.statusTextOverdue]}>
                {overdue ? 'Overdue' : item.status}
              </Text>
            </View>
            {item.due_date && (
              <View style={[s.dueTag, overdue && s.dueTagOverdue]}>
                <Feather name="calendar" size={10} color={overdue ? theme.danger : theme.tagText} />
                <Text style={[s.dueText, overdue && s.dueTextOverdue]}>
                  {new Date(item.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
            )}
            <View style={[s.dueTag, { backgroundColor: pc.bg }]}>
              <Text style={[s.dueText, { color: pc.text, textTransform: 'uppercase', letterSpacing: 0.3 }]}>{priority}</Text>
            </View>
          </View>
        </View>

        <View style={s.taskActions}>
          <TouchableOpacity style={s.iconActionBtn} onPress={() => openEdit(item)}>
            <Feather name="edit-2" size={14} color={theme.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[s.iconActionBtn, { borderColor: theme.danger + '30', backgroundColor: theme.dangerLight }]} onPress={() => handleDelete(item)}>
            <Feather name="trash-2" size={14} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={s.root}>
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={16} color={theme.primary} />
          <Text style={s.backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={s.pageTitle} numberOfLines={1}>{projectTitle}</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        contentContainerStyle={s.scrollContent}
        ListHeaderComponent={
          <>
            <View style={s.statsCard}>
              <View style={s.statsTop}>
                <View style={s.statsLeft}>
                  <Text style={s.statsTitle}>Progress</Text>
                  <Text style={[s.statsPct, pct === 100 && { color: theme.success }]}>{pct}%</Text>
                  <Text style={s.statsSubtitle}>{done} of {total} tasks complete</Text>
                </View>
                <View style={s.statsMini}>
                  <View style={s.miniStat}>
                    <Text style={s.miniStatVal}>{total}</Text>
                    <Text style={s.miniStatLabel}>Total</Text>
                  </View>
                  <View style={[s.miniStat, s.miniStatDone]}>
                    <Text style={[s.miniStatVal, s.miniStatValDone]}>{done}</Text>
                    <Text style={s.miniStatLabel}>Done</Text>
                  </View>
                </View>
              </View>
              <View style={s.progressBg}>
                <Animated.View
                  style={[
                    s.progressFill,
                    {
                      width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
                      backgroundColor: pct === 100 ? theme.success : theme.primary,
                    }
                  ]}
                />
              </View>
              {pct === 100 && total > 0 && (
                <View style={s.celebrationBanner}>
                  <Feather name="award" size={16} color={theme.success} />
                  <Text style={s.celebrationText}>All tasks complete — great work! 🎉</Text>
                </View>
              )}
            </View>

            <View style={s.searchRow}>
              <Feather name="search" size={18} color={theme.textSecondary} />
              <TextInput
                style={s.searchInput}
                placeholder="Search tasks..."
                placeholderTextColor={theme.textSecondary}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Feather name="x" size={16} color={theme.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <View style={s.controlsRow}>
              <View style={s.filterTabs}>
                {FILTERS.map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[s.filterTab, filter === f && s.activeTab]}
                    onPress={() => setFilter(f)}
                  >
                    <Text style={[s.filterTabText, filter === f && s.activeTabText]}>{f}</Text>
                    <View style={[s.tabBadge, filter === f && s.activeBadge]}>
                      <Text style={[s.tabBadgeText, filter === f && s.activeBadgeText]}>{tabCounts[f]}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={s.addBtn} onPress={() => { setCreateVisible(true); setTimeout(() => createTitleRef.current?.focus(), 100); }}>
                <Feather name="plus" size={14} color="#fff" />
                <Text style={s.addBtnText}>Add Task</Text>
              </TouchableOpacity>
            </View>

            <View style={s.sortRow}>
              {SORTS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[s.sortBtn, sort === opt.key && s.activeSortBtn]}
                  onPress={() => setSort(opt.key)}
                >
                  <Feather name={opt.icon} size={12} color={sort === opt.key ? theme.primary : theme.textSecondary} />
                  <Text style={[s.sortBtnText, sort === opt.key && s.activeSortBtnText]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 60 }} />
          ) : (
            <View style={s.emptyWrap}>
              <Feather name="check-square" size={52} color={theme.textSecondary} style={s.emptyIcon} />
              <Text style={s.emptyTitle}>
                {search ? 'No matching tasks' : filter !== 'All' ? `No ${filter.toLowerCase()} tasks` : 'No tasks yet'}
              </Text>
              <Text style={s.emptyDesc}>
                {search ? 'Try a different search term.' : 'Add your first task to get started.'}
              </Text>
            </View>
          )
        }
      />

      {/* Create Task Modal */}
      <Modal visible={createVisible} animationType="fade" transparent>
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Add New Task</Text>
            <Text style={s.label}>Task Title</Text>
            <TextInput
              ref={createTitleRef}
              style={s.input}
              placeholder="e.g. Design homepage mockup"
              placeholderTextColor={theme.textSecondary}
              value={taskTitle}
              onChangeText={setTaskTitle}
              onSubmitEditing={handleCreate}
              returnKeyType="done"
            />
            <Text style={s.label}>Due Date (Optional)</Text>
            <TextInput
              style={s.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.textSecondary}
              value={dueDate}
              onChangeText={setDueDate}
              onSubmitEditing={handleCreate}
              returnKeyType="done"
            />
            <Text style={s.label}>Priority</Text>
            <View style={s.priorityRow}>
              {['low', 'medium', 'high'].map((p) => {
                const pc = PRIORITY_COLORS[p];
                const active = taskPriority === p;
                return (
                  <TouchableOpacity
                    key={p}
                    style={[s.priorityBtn, { backgroundColor: active ? pc.bg : 'transparent', borderColor: active ? pc.text : theme.border }]}
                    onPress={() => setTaskPriority(p)}
                  >
                    <Text style={[s.priorityBtnText, { color: active ? pc.text : theme.textSecondary, textTransform: 'capitalize' }]}>{p}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={s.modalActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => { setCreateVisible(false); setTaskTitle(''); setDueDate(''); }}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={handleCreate}>
                <Feather name="plus" size={16} color="#fff" />
                <Text style={s.saveBtnText}>Create Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Task Modal */}
      <Modal visible={editVisible} animationType="fade" transparent>
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Edit Task</Text>
            <Text style={s.label}>Title</Text>
            <TextInput
              ref={editTitleRef}
              style={s.input}
              placeholder="Task title"
              placeholderTextColor={theme.textSecondary}
              value={editTitle}
              onChangeText={setEditTitle}
              onSubmitEditing={handleEditSave}
              returnKeyType="done"
            />
            <Text style={s.label}>Due Date (Optional)</Text>
            <TextInput
              style={s.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.textSecondary}
              value={editDue}
              onChangeText={setEditDue}
              onSubmitEditing={handleEditSave}
              returnKeyType="done"
            />
            <Text style={s.label}>Priority</Text>
            <View style={s.priorityRow}>
              {['low', 'medium', 'high'].map((p) => {
                const pc = PRIORITY_COLORS[p];
                const active = editPriority === p;
                return (
                  <TouchableOpacity
                    key={p}
                    style={[s.priorityBtn, { backgroundColor: active ? pc.bg : 'transparent', borderColor: active ? pc.text : theme.border }]}
                    onPress={() => setEditPriority(p)}
                  >
                    <Text style={[s.priorityBtnText, { color: active ? pc.text : theme.textSecondary, textTransform: 'capitalize' }]}>{p}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={s.modalActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => { setEditVisible(false); setEditingTask(null); }}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={handleEditSave}>
                <Feather name="check" size={16} color="#fff" />
                <Text style={s.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
