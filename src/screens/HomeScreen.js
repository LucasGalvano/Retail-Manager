import React, { useState, useEffect } from 'react';
import {View, Text, TouchableOpacity, StyleSheet,
        ScrollView, StatusBar, Vibration, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { productService, employeeService, salesService } from '../services/StorageServices';

const HomeScreen = ({ user, onLogout, onNavigate }) => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [todaySalesTotal, setTodaySalesTotal] = useState(0);
  const [recentSales, setRecentSales] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({totalValue: 0, lowStock: 0,});

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Busca produtos
      const products = await productService.getAll(user.uid);
      setTotalProducts(products.length);

      // Busca estatísticas de produtos
      const productStats = await productService.getStats(user.uid);
      setStats(productStats);

      // Busca funcionários
      const employees = await employeeService.getAll(user.uid);
      setTotalEmployees(employees.length);

      // Busca vendas de hoje
      const todayTotal = await salesService.getTodayTotal(user.uid);
      setTodaySalesTotal(todayTotal);

      // Busca últimas 5 vendas
      const recent = await salesService.getRecent(user.uid, 5);
      setRecentSales(recent);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return `Hoje, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isYesterday) {
      return `Ontem, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const statsData = [
    {
      icon: 'trending-up',
      label: 'Vendas Hoje',
      value: formatCurrency(todaySalesTotal),
      colors: ['#10b981', '#059669'],
      badge: todaySalesTotal > 0 ? `${recentSales.filter(s => {
        const saleDate = new Date(s.createdAt).toDateString();
        const today = new Date().toDateString();
        return saleDate === today;
      }).length}` : null,
    },
    {
      icon: 'cube',
      label: 'Produtos',
      value: totalProducts.toString(),
      colors: ['#3b82f6', '#06b6d4'],
      badge: stats.lowStock > 0 ? `${stats.lowStock} baixo` : null,
      badgeColor: '#ef4444',
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
                Bem-vindo, {user?.displayName || user?.email?.split('@')[0] || 'Usuário'}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={20} color="#fca5a5" />
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
              <View style={styles.statValueRow}>
                <Text style={styles.statValue}>{stat.value}</Text>
                {stat.badge && (
                  <View style={[styles.statBadge, { backgroundColor: stat.badgeColor || '#10b981' }]}>
                    <Text style={styles.statBadgeText}>{stat.badge}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Estatísticas Extras */}
        {stats.totalValue > 0 && (
          <View style={styles.extraStatsCard}>
            <View style={styles.extraStatItem}>
              <Ionicons name="cash-outline" size={20} color="#10b981" />
              <View style={styles.extraStatInfo}>
                <Text style={styles.extraStatLabel}>Valor em Estoque</Text>
                <Text style={styles.extraStatValue}>{formatCurrency(stats.totalValue)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Ações Rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionButton}
                onPress={() => handleActionPress(action.screen)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[action.color, action.color + 'dd']}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name={action.icon} size={32} color="#fff" />
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Últimas Vendas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimas Vendas</Text>
            {recentSales.length > 0 && (
              <TouchableOpacity onPress={() => handleActionPress('sales')}>
                <Text style={styles.seeAllText}>Ver todas</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentSales.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cart-outline" size={48} color="#475569" />
              <Text style={styles.emptyText}>Nenhuma venda registrada</Text>
              <Text style={styles.emptySubtext}>
                Comece realizando sua primeira venda
              </Text>
            </View>
          ) : (
            recentSales.map((sale) => (
              <View key={sale.id} style={styles.saleCard}>
                <View style={styles.saleCardHeader}>
                  <View style={styles.saleCardLeft}>
                    <View style={styles.saleIconContainer}>
                      <Ionicons name="cart" size={20} color="#10b981" />
                    </View>
                    <View>
                      <Text style={styles.saleCardTitle}>
                        Venda #{sale.id.slice(-6)}
                      </Text>
                      <Text style={styles.saleCardSubtitle}>
                        {sale.funcionarioNome}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.saleCardRight}>
                    <Text style={styles.saleCardValue}>
                      {formatCurrency(sale.valorTotal)}
                    </Text>
                    <Text style={styles.saleCardDate}>
                      {formatDate(sale.createdAt)}
                    </Text>
                  </View>
                </View>

                <View style={styles.saleCardProducts}>
                  <Ionicons name="cube-outline" size={14} color="#64748b" />
                  <Text style={styles.saleCardProductsText}>
                    {sale.produtos.length} {sale.produtos.length === 1 ? 'produto' : 'produtos'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Dicas Rápidas */}
        {totalProducts === 0 || totalEmployees === 0 ? (
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={24} color="#f59e0b" />
              <Text style={styles.tipsTitle}>Primeiros Passos</Text>
            </View>
            
            {totalEmployees === 0 && (
              <TouchableOpacity 
                style={styles.tipItem}
                onPress={() => handleActionPress('employees')}
              >
                <Ionicons name="person-add" size={20} color="#a855f7" />
                <Text style={styles.tipText}>Cadastre seus funcionários</Text>
                <Ionicons name="chevron-forward" size={20} color="#64748b" />
              </TouchableOpacity>
            )}

            {totalProducts === 0 && (
              <TouchableOpacity 
                style={styles.tipItem}
                onPress={() => handleActionPress('products')}
              >
                <Ionicons name="add-circle" size={20} color="#3b82f6" />
                <Text style={styles.tipText}>Adicione seus produtos</Text>
                <Ionicons name="chevron-forward" size={20} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>
        ) : null}

        {/* Espaçamento final */}
        <View style={{ height: 40 }} />
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
    marginTop: 2,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  extraStatsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  extraStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  extraStatInfo: {
    flex: 1,
  },
  extraStatLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  extraStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    aspectRatio: 1.5,
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyText: {
    fontSize: 16,
    color: '#cbd5e1',
    marginTop: 12,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  saleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  saleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  saleCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  saleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saleCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  saleCardSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  saleCardRight: {
    alignItems: 'flex-end',
  },
  saleCardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  saleCardDate: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  saleCardProducts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  saleCardProductsText: {
    fontSize: 12,
    color: '#64748b',
  },
  tipsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginTop: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#cbd5e1',
  },
});