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



const HomeScreen = ({ user, onLogout, onNavigate }) => {
  const [stats, setStats] = useState({
    salesToday: 1500.00, // Valor simulado
    totalProducts: 45,   // Valor simulado
    totalEmployees: 5,   // Valor simulado
  });
  const [recentSales, setRecentSales] = useState([
    { id: '1234', valorTotal: 350.50, vendedorNome: 'João', createdAt: new Date(Date.now() - 600000).toISOString() },
    { id: '5678', valorTotal: 120.00, vendedorNome: 'Maria', createdAt: new Date(Date.now() - 3600000).toISOString() },
  ]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
  }, []);

  const loadDashboardData = async () => {
    await new Promise(resolve => setTimeout(resolve, 500)); 
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    Vibration.vibrate(30);
    setRefreshing(false);
  };

  const formatCurrency = (value) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / 1000 / 60);

    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `Há ${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Há ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Há ${diffInDays}d`;
  };

  const statsData = [
    {
      icon: 'trending-up',
      label: 'Vendas Hoje',
      value: formatCurrency(stats.salesToday),
      colors: ['#10b981', '#059669'],
    },
    {
      icon: 'cube',
      label: 'Produtos',
      value: stats.totalProducts.toString(),
      colors: ['#3b82f6', '#06b6d4'],
    },
    {
      icon: 'people',
      label: 'Funcionários',
      value: stats.totalEmployees.toString(),
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
          {/* O botão de Logout funciona via onLogout passado pelo App.js */}
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
        {/* Stats Cards (com dados simulados) */}
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

        {/* Ações Rápidas (com botões prontos para navegar) */}
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

        {/* Últimas Vendas (com dados simulados) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Últimas Vendas</Text>
          {recentSales.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cart-outline" size={48} color="#475569" />
              <Text style={styles.emptyText}>Nenhuma venda registrada</Text>
            </View>
          ) : (
            recentSales.map((sale) => (
              <View key={sale.id} style={styles.saleCard}>
                <View>
                  <Text style={styles.saleId}>
                    Venda #{sale.id.slice(-4)}
                  </Text>
                  <Text style={styles.saleSeller}>
                    Vendedor: {sale.vendedorNome || 'N/A'}
                  </Text>
                </View>
                <View style={styles.saleRight}>
                  <Text style={styles.saleValue}>
                    {formatCurrency(sale.valorTotal)}
                  </Text>
                  <Text style={styles.saleTime}>
                    {formatRelativeTime(sale.createdAt)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

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
  saleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saleId: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  saleSeller: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  saleRight: {
    alignItems: 'flex-end',
  },
  saleValue: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saleTime: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
});