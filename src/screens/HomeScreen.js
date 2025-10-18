import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Vibration,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { productService, employeeService } from '../services/StorageServices';

// ========== TELA HOME (DASHBOARD) ==========
const HomeScreen = ({ user, onLogout, onNavigate }) => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Busca a quantidade de produtos
      const products = await productService.getAll(user.uid);
      setTotalProducts(products.length);

      // Busca a quantidade de funcionários
      const employees = await employeeService.getAll(user.uid);
      setTotalEmployees(employees.length);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    Vibration.vibrate(30);
    setRefreshing(false);
  };

  const statsData = [
    {
      icon: 'trending-up',
      label: 'Vendas Hoje',
      value: 'R$ 0,00',
      colors: ['#10b981', '#059669'],
    },
    {
      icon: 'cube',
      label: 'Produtos',
      value: totalProducts.toString(),
      colors: ['#3b82f6', '#06b6d4'],
    },
    {
      icon: 'people',
      label: 'Funcionários',
      value: totalEmployees.toString(),
      colors: ['#a855f7', '#ec4899'],
    },
  ];

  const quickActions = [
    {
      label: 'Nova Venda',
      icon: 'cart',
      color: '#10b981',
      screen: 'sales',
    },
    {
      label: 'Produtos',
      icon: 'cube',
      color: '#3b82f6',
      screen: 'products',
    },
    {
      label: 'Funcionários',
      icon: 'people',
      color: '#a855f7',
      screen: 'employees',
    },
    {
      label: 'Relatórios',
      icon: 'bar-chart',
      color: '#f59e0b',
      screen: 'reports',
    },
  ];

  const handleActionPress = (screen) => {
    Vibration.vibrate(30);
    onNavigate(screen);
  };

  return (
    <View style={styles.homeContainer}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="storefront" size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Retail Manager</Text>
              <Text style={styles.headerSubtitle}>
                Bem-vindo, {user?.displayName || user?.email || 'Usuário'}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.homeScroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={['#3b82f6']}
          />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {statsData.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <LinearGradient
                colors={stat.colors}
                style={styles.statIconContainer}
              >
                <Ionicons name={stat.icon} size={28} color="#fff" />
              </LinearGradient>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* Ações Rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionButton, { backgroundColor: action.color }]}
                onPress={() => handleActionPress(action.screen)}
                activeOpacity={0.8}
              >
                <Ionicons name={action.icon} size={32} color="#fff" />
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Últimas Vendas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Últimas Vendas</Text>
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={48} color="#475569" />
            <Text style={styles.emptyText}>Nenhuma venda registrada</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

// ========== ESTILOS ==========
const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#a855f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fca5a5',
    fontWeight: '600',
  },
  homeScroll: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    aspectRatio: 1.5,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
  },
});