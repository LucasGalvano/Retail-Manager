import React, { useState, useEffect } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView, 
        StatusBar, Vibration, Dimensions, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { salesService, employeeService, productService } from '../services/StorageServices';

const { width } = Dimensions.get('window');

const ReportsScreen = ({ user, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // 'today', 'week', 'month', 'all'

  // Dados para análise
  const [sales, setSales] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);

  // Análises calculadas
  const [salesByEmployee, setSalesByEmployee] = useState([]);
  const [salesByDay, setSalesByDay] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [bonusAnalysis, setBonusAnalysis] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [salesData, employeesData, productsData] = await Promise.all([
        salesService.getAll(user.uid),
        employeeService.getAll(user.uid),
        productService.getAll(user.uid),
      ]);

      setSales(salesData);
      setEmployees(employeesData);
      setProducts(productsData);

      processAnalytics(salesData, employeesData, productsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    Vibration.vibrate(30);
    setRefreshing(false);
  };

  const processAnalytics = (salesData, employeesData, productsData) => {
    // 1. Vendas por Funcionário
    const salesByEmp = {};
    salesData.forEach(sale => {
      const empId = sale.funcionarioId;
      if (!salesByEmp[empId]) {
        salesByEmp[empId] = {
          funcionarioId: empId,
          funcionarioNome: sale.funcionarioNome,
          totalVendas: 0,
          quantidadeVendas: 0,
        };
      }
      salesByEmp[empId].totalVendas += sale.valorTotal;
      salesByEmp[empId].quantidadeVendas += 1;
    });
    setSalesByEmployee(Object.values(salesByEmp));

    // 2. Vendas por Dia (últimos 7 dias)
    const last7Days = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last7Days[dateStr] = { date: dateStr, total: 0, count: 0 };
    }

    salesData.forEach(sale => {
      const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
      if (last7Days[saleDate]) {
        last7Days[saleDate].total += sale.valorTotal;
        last7Days[saleDate].count += 1;
      }
    });
    setSalesByDay(Object.values(last7Days));

    // 3. Produtos Mais Vendidos
    const productSales = {};
    salesData.forEach(sale => {
      sale.produtos.forEach(produto => {
        if (!productSales[produto.produtoId]) {
          productSales[produto.produtoId] = {
            nome: produto.nome,
            quantidade: 0,
            total: 0,
          };
        }
        productSales[produto.produtoId].quantidade += produto.quantidade;
        productSales[produto.produtoId].total += produto.subtotal;
      });
    });
    const sortedProducts = Object.values(productSales)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    setTopProducts(sortedProducts);

    // 4. Análise de Bônus (comparar vendas vs meta)
    const bonusData = employeesData.map(emp => {
      const empSales = salesByEmp[emp.id];
      const totalVendido = empSales ? empSales.totalVendas : 0;
      const meta = emp.meta || 0;
      const percentualAtingido = meta > 0 ? (totalVendido / meta) * 100 : 0;
      const atingiuMeta = totalVendido >= meta;
      const bonusGanho = atingiuMeta ? (emp.salario * emp.bonusPercentual) / 100 : 0;

      return {
        nome: emp.nome,
        vendido: totalVendido,
        meta: meta,
        percentual: percentualAtingido,
        atingiuMeta: atingiuMeta,
        bonus: bonusGanho,
        salarioTotal: emp.salario + bonusGanho,
      };
    });
    setBonusAnalysis(bonusData);
  };

  const formatCurrency = (value) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  // Gerar HTML para gráfico de vendas por dia (Plotly)
  const generateSalesChart = () => {
    const dates = salesByDay.map(d => formatDate(d.date));
    const values = salesByDay.map(d => d.total);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        </head>
        <body style="margin:0;padding:0;background:#1e293b;overflow:hidden;">
          <div id="chart" style="width:100%;height:100%;"></div>
          <script>
            var data = [{
              x: ${JSON.stringify(dates)},
              y: ${JSON.stringify(values)},
              type: 'bar',
              marker: {
                color: '#10b981',
                line: {
                  color: '#059669',
                  width: 2
                }
              }
            }];
            
            var layout = {
              paper_bgcolor: '#1e293b',
              plot_bgcolor: '#1e293b',
              xaxis: {
                color: '#94a3b8',
                gridcolor: '#334155',
                fixedrange: true
              },
              yaxis: {
                color: '#94a3b8',
                gridcolor: '#334155',
                tickprefix: 'R$ ',
                fixedrange: true
              },
              margin: { t: 20, b: 40, l: 60, r: 20 }
            };
            
            var config = { 
              displayModeBar: false,
              staticPlot: false,
              scrollZoom: false,
              doubleClick: false
            };
            Plotly.newPlot('chart', data, layout, config);
          </script>
        </body>
      </html>
    `;
  };

  // Gerar HTML para gráfico de vendas por funcionário (BAR HORIZONTAL)
  const generateEmployeeSalesChart = () => {
    const names = salesByEmployee.map(e => e.funcionarioNome);
    const values = salesByEmployee.map(e => e.totalVendas);
    const colors = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444'];

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        </head>
        <body style="margin:0;padding:0;background:#1e293b;overflow:hidden;">
          <div id="chart" style="width:100%;height:100%;"></div>
          <script>
            var data = [{
              x: ${JSON.stringify(values)},
              y: ${JSON.stringify(names)},
              type: 'bar',
              orientation: 'h',
              marker: {
                color: ${JSON.stringify(colors.slice(0, names.length))},
                line: {
                  color: 'rgba(255,255,255,0.2)',
                  width: 1
                }
              },
              text: ${JSON.stringify(values.map(v => 'R$ ' + v.toFixed(2)))},
              textposition: 'auto',
              textfont: {
                color: '#fff',
                size: 12,
                weight: 'bold'
              }
            }];
            
            var layout = {
              paper_bgcolor: '#1e293b',
              plot_bgcolor: '#1e293b',
              xaxis: {
                color: '#94a3b8',
                gridcolor: '#334155',
                tickprefix: 'R$ ',
                fixedrange: true
              },
              yaxis: {
                color: '#94a3b8',
                automargin: true,
                fixedrange: true
              },
              margin: { t: 20, b: 40, l: 120, r: 20 }
            };
            
            var config = { 
              displayModeBar: false,
              staticPlot: false,
              scrollZoom: false,
              doubleClick: false
            };
            Plotly.newPlot('chart', data, layout, config);
          </script>
        </body>
      </html>
    `;
  };

  // Gerar HTML para gráfico de produtos mais vendidos
  const generateTopProductsChart = () => {
    const names = topProducts.map(p => p.nome.length > 15 ? p.nome.substring(0, 15) + '...' : p.nome);
    const quantities = topProducts.map(p => p.quantidade);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        </head>
        <body style="margin:0;padding:0;background:#1e293b;overflow:hidden;">
          <div id="chart" style="width:100%;height:100%;"></div>
          <script>
            var data = [{
              x: ${JSON.stringify(quantities)},
              y: ${JSON.stringify(names)},
              type: 'bar',
              orientation: 'h',
              marker: {
                color: '#3b82f6',
                line: {
                  color: '#2563eb',
                  width: 2
                }
              },
              text: ${JSON.stringify(quantities.map(q => q + ' un'))},
              textposition: 'auto',
              textfont: {
                color: '#fff',
                size: 12,
                weight: 'bold'
              }
            }];
            
            var layout: {
              paper_bgcolor: '#1e293b',
              plot_bgcolor: '#1e293b',
              xaxis: {
                color: '#94a3b8',
                gridcolor: '#334155',
                title: { text: 'Quantidade', font: { color: '#94a3b8' } },
                fixedrange: true
              },
              yaxis: {
                color: '#94a3b8',
                automargin: true,
                fixedrange: true
              },
              margin: { t: 20, b: 50, l: 120, r: 20 }
            };
            
            var config = { 
              displayModeBar: false,
              staticPlot: false,
              scrollZoom: false,
              doubleClick: false
            };
            Plotly.newPlot('chart', data, layout, config);
          </script>
        </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Ionicons name="bar-chart" size={28} color="#f59e0b" />
              <Text style={styles.headerTitle}>Relatórios</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Ionicons name="analytics" size={60} color="#f59e0b" />
          <Text style={styles.loadingText}>Processando dados...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Ionicons name="bar-chart" size={28} color="#f59e0b" />
            <Text style={styles.headerTitle}>Relatórios</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={['#f59e0b']}
          />
        }
      >
        {/* Resumo Geral */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumo Geral</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Ionicons name="cart" size={24} color="#10b981" />
              <Text style={styles.summaryValue}>{sales.length}</Text>
              <Text style={styles.summaryLabel}>Total de Vendas</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="cash" size={24} color="#3b82f6" />
              <Text style={styles.summaryValue}>
                {formatCurrency(sales.reduce((sum, s) => sum + s.valorTotal, 0))}
              </Text>
              <Text style={styles.summaryLabel}>Faturamento</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="trophy" size={24} color="#f59e0b" />
              <Text style={styles.summaryValue}>
                {bonusAnalysis.filter(b => b.atingiuMeta).length}
              </Text>
              <Text style={styles.summaryLabel}>Metas Atingidas</Text>
            </View>
          </View>
        </View>

        {/* Gráfico: Vendas por Dia */}
        {salesByDay.length > 0 && (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Ionicons name="trending-up" size={20} color="#10b981" />
              <Text style={styles.chartTitle}>Vendas nos Últimos 7 Dias</Text>
            </View>
            <View style={styles.chartContainer}>
              <WebView
                source={{ html: generateSalesChart() }}
                style={styles.webview}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                bounces={false}
                overScrollMode="never"
              />
            </View>
          </View>
        )}

        {/* Gráfico: Vendas por Funcionário */}
        {salesByEmployee.length > 0 && (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Ionicons name="people" size={20} color="#a855f7" />
              <Text style={styles.chartTitle}>Vendas por Funcionário</Text>
            </View>
            <View style={styles.chartContainer}>
              <WebView
                source={{ html: generateEmployeeSalesChart() }}
                style={styles.webview}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                bounces={false}
                overScrollMode="never"
              />
            </View>
          </View>
        )}

        {/* Gráfico: Top Produtos */}
        {topProducts.length > 0 && (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Ionicons name="cube" size={20} color="#3b82f6" />
              <Text style={styles.chartTitle}>Produtos Mais Vendidos</Text>
            </View>
            <View style={styles.chartContainer}>
              <WebView
                source={{ html: generateTopProductsChart() }}
                style={styles.webview}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                bounces={false}
                overScrollMode="never"
              />
            </View>
          </View>
        )}

        {/* Análise de Bônus */}
        {bonusAnalysis.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star" size={24} color="#f59e0b" />
              <Text style={styles.sectionTitle}>Análise de Bônus</Text>
            </View>

            {bonusAnalysis.map((emp, index) => (
              <View key={index} style={styles.bonusCard}>
                <View style={styles.bonusHeader}>
                  <View style={styles.bonusLeft}>
                    <Text style={styles.bonusName}>{emp.nome}</Text>
                    <Text style={styles.bonusStatus}>
                      {emp.atingiuMeta ? '✅ Meta Atingida' : '⏳ Em Progresso'}
                    </Text>
                  </View>
                  {emp.atingiuMeta && (
                    <View style={styles.bonusBadge}>
                      <Ionicons name="trophy" size={16} color="#fff" />
                      <Text style={styles.bonusBadgeText}>
                        +{formatCurrency(emp.bonus)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Barra de Progresso */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(emp.percentual, 100)}%`,
                          backgroundColor: emp.atingiuMeta ? '#10b981' : '#3b82f6',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {emp.percentual.toFixed(0)}%
                  </Text>
                </View>

                {/* Detalhes */}
                <View style={styles.bonusDetails}>
                  <View style={styles.bonusDetailItem}>
                    <Text style={styles.bonusDetailLabel}>Vendido:</Text>
                    <Text style={styles.bonusDetailValue}>
                      {formatCurrency(emp.vendido)}
                    </Text>
                  </View>
                  <View style={styles.bonusDetailItem}>
                    <Text style={styles.bonusDetailLabel}>Meta:</Text>
                    <Text style={styles.bonusDetailValue}>
                      {formatCurrency(emp.meta)}
                    </Text>
                  </View>
                  <View style={styles.bonusDetailItem}>
                    <Text style={styles.bonusDetailLabel}>Salário Total:</Text>
                    <Text style={[styles.bonusDetailValue, { color: '#10b981' }]}>
                      {formatCurrency(emp.salarioTotal)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Estado Vazio */}
        {sales.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="analytics-outline" size={80} color="#475569" />
            <Text style={styles.emptyText}>Nenhum dado disponível</Text>
            <Text style={styles.emptySubtext}>
              Realize vendas para visualizar relatórios
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default ReportsScreen;

const styles = StyleSheet.create({
  container: {
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 16,
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  chartCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  chartContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  bonusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  bonusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bonusLeft: {
    flex: 1,
  },
  bonusName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bonusStatus: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  bonusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bonusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    minWidth: 40,
    textAlign: 'right',
  },
  bonusDetails: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  bonusDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  bonusDetailLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  bonusDetailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    marginHorizontal: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#cbd5e1',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
});