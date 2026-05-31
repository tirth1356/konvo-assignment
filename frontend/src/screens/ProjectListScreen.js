import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, Animated, Linking
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Feather } from '@expo/vector-icons';
import { fetchProjects, createProject, updateProject, deleteProject } from '../store/slices/projectSlice';
import { logout } from '../store/slices/authSlice';
import { useTheme } from '../theme/ThemeContext';

export default function ProjectListScreen({ navigation }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const { projects, loading } = useSelector((s) => s.projects);
  const { user } = useSelector((s) => s.auth);

  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const headerFade = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    dispatch(fetchProjects());
    Animated.timing(headerFade, { toValue: 1, duration: 600, useNativeDriver: false }).start();
  }, []);

  const openCreate = () => { setEditing(null); setTitle(''); setDesc(''); setModalVisible(true); };
  const openEdit = (p) => { setEditing(p); setTitle(p.title); setDesc(p.description || ''); setModalVisible(true); };

  const handleSave = () => {
    if (!title.trim()) return;
    if (editing) dispatch(updateProject({ id: editing.id, projectData: { title, description: desc } }));
    else dispatch(createProject({ title, description: desc }));
    setModalVisible(false);
  };

  const filtered = projects.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  const totalTasks = projects.reduce((a, p) => a + (p.total_tasks || 0), 0);
  const totalDone = projects.reduce((a, p) => a + (p.completed_tasks || 0), 0);

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    brand: { flexDirection: 'row', alignItems: 'center' },
    brandIcon: {
      backgroundColor: theme.primaryLight,
      padding: 8,
      borderRadius: 10,
      marginRight: 10,
    },
    brandName: { fontSize: 18, fontWeight: '800', color: theme.text, letterSpacing: -0.4 },
    topActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    iconBtn: {
      backgroundColor: theme.primaryLight,
      borderRadius: 10,
      padding: 9,
      borderWidth: 1,
      borderColor: theme.border,
    },
    logoutBtn: {
      backgroundColor: theme.dangerLight,
      borderRadius: 10,
      padding: 9,
      borderWidth: 1,
      borderColor: theme.danger + '20',
    },
    scrollContent: { padding: 20 },
    greeting: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 4,
      letterSpacing: -0.5,
    },
    greetingSub: { fontSize: 14, color: theme.textSecondary, marginBottom: 20 },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    statCard: {
      flex: 1,
      backgroundColor: theme.card,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    statValue: { fontSize: 28, fontWeight: '800', color: theme.primary, marginBottom: 4 },
    statLabel: { fontSize: 12, color: theme.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      marginBottom: 16,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 15,
      color: theme.text,
      marginLeft: 10,
      outlineWidth: 0,
    },
    sectionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.text },
    countBadge: {
      backgroundColor: theme.primaryLight,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    countText: { fontSize: 12, fontWeight: '700', color: theme.primary },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.primary,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14, marginLeft: 6 },
    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
    },
    cardAccent: {
      height: 3,
      backgroundColor: theme.primary,
    },
    cardBody: { padding: 18 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: theme.text, flex: 1, marginRight: 8 },
    cardDesc: { fontSize: 13, color: theme.textSecondary, lineHeight: 20, marginBottom: 14 },
    progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    progressLabel: { fontSize: 12, color: theme.textSecondary, fontWeight: '500' },
    progressPct: { fontSize: 12, fontWeight: '700', color: theme.primary },
    progressBg: {
      height: 5,
      backgroundColor: theme.border,
      borderRadius: 3,
      marginBottom: 14,
      overflow: 'hidden',
    },
    progressFill: { height: '100%', borderRadius: 3, backgroundColor: theme.primary },
    cardActions: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: theme.border,
      padding: 10,
      gap: 8,
    },
    actionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      borderRadius: 8,
      gap: 6,
    },
    viewBtn: { backgroundColor: theme.primaryLight },
    editBtn: { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f0', borderWidth: 1, borderColor: theme.border },
    deleteBtn: { backgroundColor: theme.dangerLight },
    viewBtnText: { fontSize: 13, fontWeight: '700', color: theme.primary },
    editBtnText: { fontSize: 13, fontWeight: '700', color: theme.text },
    deleteBtnText: { fontSize: 13, fontWeight: '700', color: theme.danger },
    emptyWrap: { alignItems: 'center', paddingVertical: 60 },
    emptyIcon: { marginBottom: 16, opacity: 0.4 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 8 },
    emptyDesc: { fontSize: 14, color: theme.textSecondary, textAlign: 'center', lineHeight: 20 },
    footer: {
      alignItems: 'center',
      paddingVertical: 24,
    },
    footerText: { fontSize: 12, color: theme.textSecondary },
    footerLink: { fontSize: 12, color: theme.primary, fontWeight: '700' },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modal: {
      width: '100%',
      maxWidth: 480,
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 28,
      borderWidth: 1,
      borderColor: theme.border,
    },
    modalTitle: { fontSize: 20, fontWeight: '800', color: theme.text, marginBottom: 22, letterSpacing: -0.4 },
    label: { fontSize: 12, fontWeight: '700', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
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
    textArea: { height: 80, textAlignVertical: 'top' },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 6 },
    cancelBtn: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
    },
    cancelBtnText: { color: theme.textSecondary, fontWeight: '600' },
    saveBtn: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 10,
      backgroundColor: theme.primary,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    saveBtnText: { color: '#fff', fontWeight: '700' },
  });

  const renderItem = ({ item }) => {
    const total = item.total_tasks || 0;
    const done = item.completed_tasks || 0;
    const overdue = item.overdue_tasks || 0;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    return (
      <View style={s.card}>
        <View style={s.cardAccent} />
        <View style={s.cardBody}>
          <View style={s.cardTop}>
            <Text style={s.cardTitle}>{item.title}</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {overdue > 0 && (
                <View style={[s.countBadge, { backgroundColor: theme.dangerLight }]}>
                  <Text style={[s.countText, { color: theme.danger }]}>⚠ {overdue} overdue</Text>
                </View>
              )}
              <View style={[s.countBadge, { backgroundColor: pct === 100 ? theme.successLight : theme.primaryLight }]}>
                <Text style={[s.countText, { color: pct === 100 ? theme.success : theme.primary }]}>
                  {pct === 100 ? '✓ Done' : `${pct}%`}
                </Text>
              </View>
            </View>
          </View>
          <Text style={s.cardDesc} numberOfLines={2}>
            {item.description || 'No description provided.'}
          </Text>
          <View style={s.progressRow}>
            <Text style={s.progressLabel}>{done} of {total} tasks complete</Text>
            <Text style={s.progressPct}>{pct}%</Text>
          </View>
          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: `${pct}%`, backgroundColor: pct === 100 ? theme.success : theme.primary }]} />
          </View>
        </View>
        <View style={s.cardActions}>
          <TouchableOpacity
            style={[s.actionBtn, s.viewBtn]}
            onPress={() => navigation.navigate('ProjectDetails', { projectId: item.id, projectTitle: item.title })}
          >
            <Feather name="arrow-right-circle" size={15} color={theme.primary} />
            <Text style={s.viewBtnText}>Open</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionBtn, s.editBtn]} onPress={() => openEdit(item)}>
            <Feather name="edit-2" size={14} color={theme.text} />
            <Text style={s.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionBtn, s.deleteBtn]} onPress={() => dispatch(deleteProject(item.id))}>
            <Feather name="trash-2" size={14} color={theme.danger} />
            <Text style={s.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={s.root}>
      <View style={s.topBar}>
        <View style={s.brand}>
          <View style={s.brandIcon}>
            <Feather name="layers" size={18} color={theme.primary} />
          </View>
          <Text style={s.brandName}>TaskFlow</Text>
        </View>
        <View style={s.topActions}>
          <TouchableOpacity style={s.iconBtn} onPress={toggleTheme}>
            <Feather name={isDark ? 'sun' : 'moon'} size={18} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={s.logoutBtn} onPress={() => dispatch(logout())}>
            <Feather name="log-out" size={18} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={s.scrollContent}
        ListHeaderComponent={
          <>
            <Animated.View style={{ opacity: headerFade }}>
              <Text style={s.greeting}>Hello, {user?.email?.split('@')[0]} 👋</Text>
              <Text style={s.greetingSub}>Here's an overview of your workspace.</Text>

              <View style={s.statsRow}>
                <View style={s.statCard}>
                  <Text style={s.statValue}>{projects.length}</Text>
                  <Text style={s.statLabel}>Projects</Text>
                </View>
                <View style={s.statCard}>
                  <Text style={s.statValue}>{totalTasks}</Text>
                  <Text style={s.statLabel}>Total Tasks</Text>
                </View>
                <View style={s.statCard}>
                  <Text style={[s.statValue, { color: theme.success }]}>{totalDone}</Text>
                  <Text style={s.statLabel}>Completed</Text>
                </View>
              </View>
            </Animated.View>

            <View style={s.searchRow}>
              <Feather name="search" size={18} color={theme.textSecondary} />
              <TextInput
                style={s.searchInput}
                placeholder="Search projects..."
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

            <View style={s.sectionRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={s.sectionTitle}>Projects</Text>
                <View style={s.countBadge}>
                  <Text style={s.countText}>{filtered.length}</Text>
                </View>
              </View>
              <TouchableOpacity style={s.addBtn} onPress={openCreate}>
                <Feather name="plus" size={16} color="#fff" />
                <Text style={s.addBtnText}>New Project</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 60 }} />
          ) : (
            <View style={s.emptyWrap}>
              <Feather name="folder" size={56} color={theme.textSecondary} style={s.emptyIcon} />
              <Text style={s.emptyTitle}>No projects yet</Text>
              <Text style={s.emptyDesc}>Create your first project to start organizing tasks.</Text>
            </View>
          )
        }
        ListFooterComponent={
          <View style={s.footer}>
            <Text style={s.footerText}>Open source · {' '}
              <Text style={s.footerLink} onPress={() => Linking.openURL('https://github.com/tirth1356/konvo-assignment')}>
                GitHub ↗
              </Text>
            </Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>{editing ? 'Edit Project' : 'New Project'}</Text>
            <Text style={s.label}>Title</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Website Redesign"
              placeholderTextColor={theme.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
            <Text style={s.label}>Description</Text>
            <TextInput
              style={[s.input, s.textArea]}
              placeholder="What is this project about?"
              placeholderTextColor={theme.textSecondary}
              value={desc}
              onChangeText={setDesc}
              multiline
              numberOfLines={3}
            />
            <View style={s.modalActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
                <Feather name="check" size={16} color="#fff" />
                <Text style={s.saveBtnText}>{editing ? 'Save Changes' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
