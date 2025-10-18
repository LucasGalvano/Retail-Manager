import React, { useState, useEffect } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar,
        Alert, Vibration, Modal, KeyboardAvoidingView, Platform} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { salesService, employeeService, productService } from '../services/StorageServices';

const SalesScreen = ({ user, onBack }) => {
  const [sales, setSales] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Listas disponíveis
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);

  // Form state
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [cart, setCart] = useState([]);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [salesData, employeesData, productsData] = await Promise.all([
      salesService.getAll(user.uid),
      employeeService.getAll(user.uid),
      productService.getAll(user.uid),
    ]);

    setSales(salesData);
    setEmployees(employeesData);
    setProducts(productsData);
  };

  const handleAddToCart = (product, quantity) => {
    const existingItem = cart.find(item => item.produtoId === product.id);

    if (existingItem) {
      setCart(cart.map(item =>
        item.produtoId === product.id
          ? { ...item, quantidade: item.quantidade + quantity }
          : item
      ));
    } else {
      setCart([...cart, {
        produtoId: product.id,
        nome: product.nome,
        preco: product.preco,
        quantidade: quantity,
        estoqueDisponivel: product.estoque,
      }]);
    }

    Vibration.vibrate(30);
  };

  const handleRemoveFromCart = (produtoId) => {
    setCart(cart.filter(item => item.produtoId !== produtoId));
    Vibration.vibrate(30);
  };

  const handleUpdateQuantity = (produtoId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(produtoId);
      return;
    }

    const item = cart.find(i => i.produtoId === produtoId);
    if (item && newQuantity > item.estoqueDisponivel) {
      Alert.alert('Erro', `Estoque disponível: ${item.estoqueDisponivel}`);
      return;
    }

    setCart(cart.map(item =>
      item.produtoId === produtoId
        ? { ...item, quantidade: newQuantity }
        : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
  };

  const handleFinalizeSale = async () => {
    if (!selectedEmployee) {
      Vibration.vibrate([100, 50, 100]);
      Alert.alert('Erro', 'Selecione um funcionário para a venda');
      return;
    }

    if (cart.length === 0) {
      Vibration.vibrate([100, 50, 100]);
      Alert.alert('Erro', 'Adicione produtos ao carrinho');
      return;
    }

    Alert.alert(
      'Confirmar Venda',
      `Total: R$ ${calculateTotal().toFixed(2).replace('.', ',')}\nFuncionário: ${selectedEmployee.nome}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setLoading(true);
            try {
              await salesService.processSale(user.uid, {
                funcionarioId: selectedEmployee.id,
                produtos: cart.map(item => ({
                  produtoId: item.produtoId,
                  quantidade: item.quantidade,
                })),
              });

              Vibration.vibrate([50, 50, 50]);
              Alert.alert('Sucesso!', 'Venda realizada com sucesso!', [
                { text: 'OK', onPress: () => handleCloseModal() }
              ]);

              await loadData();
            } catch (error) {
              Vibration.vibrate([100, 50, 100]);
              Alert.alert('Erro', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedEmployee(null);
    setCart([]);
  };

  const formatCurrency = (value) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
            <Ionicons name="cart" size={28} color="#10b981" />
            <Text style={styles.headerTitle}>Vendas</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* Lista de Vendas */}
      <ScrollView style={styles.content}>
        {sales.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={80} color="#475569" />
            <Text style={styles.emptyText}>Nenhuma venda realizada</Text>
            <Text style={styles.emptySubtext}>
              Toque no botão + para iniciar
            </Text>
          </View>
        ) : (
          sales.map((sale) => (
            <View key={sale.id} style={styles.saleCard}>
              <View style={styles.saleHeader}>
                <View>
                  <Text style={styles.saleId}>Venda #{sale.id.slice(-6)}</Text>
                  <Text style={styles.saleDate}>{formatDate(sale.createdAt)}</Text>
                </View>
                <Text style={styles.saleTotal}>{formatCurrency(sale.valorTotal)}</Text>
              </View>

              <View style={styles.saleInfo}>
                <View style={styles.saleInfoRow}>
                  <Ionicons name="person" size={16} color="#94a3b8" />
                  <Text style={styles.saleInfoText}>{sale.funcionarioNome}</Text>
                </View>

                <View style={styles.saleInfoRow}>
                  <Ionicons name="cube" size={16} color="#94a3b8" />
                  <Text style={styles.saleInfoText}>
                    {sale.produtos.length} {sale.produtos.length === 1 ? 'produto' : 'produtos'}
                  </Text>
                </View>
              </View>

              <View style={styles.productsList}>
                {sale.produtos.map((produto, index) => (
                  <Text key={index} style={styles.productItem}>
                    • {produto.quantidade}x {produto.nome} - {formatCurrency(produto.subtotal)}
                  </Text>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Botão Nova Venda */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          if (employees.length === 0) {
            Alert.alert('Atenção', 'Cadastre funcionários antes de realizar vendas');
            return;
          }
          if (products.length === 0) {
            Alert.alert('Atenção', 'Cadastre produtos antes de realizar vendas');
            return;
          }
          Vibration.vibrate(30);
          setModalVisible(true);
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#10b981', '#059669']}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Modal Nova Venda */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseModal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardView}
          >
            <TouchableOpacity 
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nova Venda</Text>
                <TouchableOpacity onPress={handleCloseModal}>
                  <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                {/* Seleção de Funcionário */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Funcionário *</Text>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => setShowEmployeeModal(true)}
                  >
                    <Ionicons name="person" size={20} color="#a855f7" />
                    <Text style={styles.selectButtonText}>
                      {selectedEmployee ? selectedEmployee.nome : 'Selecionar funcionário'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#64748b" />
                  </TouchableOpacity>
                </View>

                {/* Carrinho */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Produtos</Text>
                    <TouchableOpacity
                      style={styles.addProductButton}
                      onPress={() => setShowProductModal(true)}
                    >
                      <Ionicons name="add-circle" size={24} color="#10b981" />
                    </TouchableOpacity>
                  </View>

                  {cart.length === 0 ? (
                    <View style={styles.emptyCart}>
                      <Ionicons name="cart-outline" size={40} color="#475569" />
                      <Text style={styles.emptyCartText}>Carrinho vazio</Text>
                    </View>
                  ) : (
                    cart.map((item) => (
                      <View key={item.produtoId} style={styles.cartItem}>
                        <View style={styles.cartItemInfo}>
                          <Text style={styles.cartItemName}>{item.nome}</Text>
                          <Text style={styles.cartItemPrice}>{formatCurrency(item.preco)}</Text>
                        </View>

                        <View style={styles.cartItemActions}>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleUpdateQuantity(item.produtoId, item.quantidade - 1)}
                          >
                            <Ionicons name="remove" size={16} color="#fff" />
                          </TouchableOpacity>

                          <Text style={styles.quantityText}>{item.quantidade}</Text>

                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleUpdateQuantity(item.produtoId, item.quantidade + 1)}
                          >
                            <Ionicons name="add" size={16} color="#fff" />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => handleRemoveFromCart(item.produtoId)}
                          >
                            <Ionicons name="trash" size={16} color="#ef4444" />
                          </TouchableOpacity>
                        </View>

                        <Text style={styles.cartItemSubtotal}>
                          {formatCurrency(item.preco * item.quantidade)}
                        </Text>
                      </View>
                    ))
                  )}
                </View>

                {/* Total */}
                {cart.length > 0 && (
                  <View style={styles.totalCard}>
                    <Text style={styles.totalLabel}>Total da Venda:</Text>
                    <Text style={styles.totalValue}>{formatCurrency(calculateTotal())}</Text>
                  </View>
                )}

                {/* Botão Finalizar */}
                <TouchableOpacity
                  style={[styles.finalizeButton, loading && styles.finalizeButtonDisabled]}
                  onPress={handleFinalizeSale}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    style={styles.finalizeButtonGradient}
                  >
                    <Ionicons name="checkmark-circle" size={24} color="#fff" />
                    <Text style={styles.finalizeButtonText}>
                      {loading ? 'Processando...' : 'Finalizar Venda'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>

      {/* Modal Selecionar Funcionário */}
      <Modal
        visible={showEmployeeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEmployeeModal(false)}
      >
        <TouchableOpacity 
          style={styles.pickerModal}
          activeOpacity={1}
          onPress={() => setShowEmployeeModal(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.pickerContent}
          >
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Selecionar Funcionário</Text>
              <TouchableOpacity 
                onPress={() => setShowEmployeeModal(false)}
                style={styles.pickerCloseIcon}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              {employees.map((employee) => (
                <TouchableOpacity
                  key={employee.id}
                  style={styles.pickerItem}
                  onPress={() => {
                    setSelectedEmployee(employee);
                    setShowEmployeeModal(false);
                    Vibration.vibrate(30);
                  }}
                >
                  <Ionicons name="person" size={24} color="#a855f7" />
                  <Text style={styles.pickerItemText}>{employee.nome}</Text>
                  {selectedEmployee?.id === employee.id && (
                    <Ionicons name="checkmark" size={24} color="#10b981" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Modal Selecionar Produto */}
      <Modal
        visible={showProductModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProductModal(false)}
      >
        <TouchableOpacity 
          style={styles.pickerModal}
          activeOpacity={1}
          onPress={() => setShowProductModal(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.pickerContent}
          >
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Adicionar Produto</Text>
              <TouchableOpacity 
                onPress={() => setShowProductModal(false)}
                style={styles.pickerCloseIcon}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              {products.filter(p => p.estoque > 0).map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.pickerItem}
                  onPress={() => {
                    handleAddToCart(product, 1);
                    setShowProductModal(false);
                  }}
                >
                  <View style={styles.productPickerInfo}>
                    <Text style={styles.pickerItemText}>{product.nome}</Text>
                    <Text style={styles.productPickerPrice}>{formatCurrency(product.preco)}</Text>
                    <Text style={styles.productPickerStock}>Estoque: {product.estoque}</Text>
                  </View>
                  <Ionicons name="add-circle" size={24} color="#10b981" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default SalesScreen;

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
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
  saleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  saleId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  saleDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  saleTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  saleInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  saleInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  saleInfoText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  productsList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  productItem: {
    fontSize: 12,
    color: '#cbd5e1',
    marginBottom: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalKeyboardView: {
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalForm: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 12,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  selectButtonText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  addProductButton: {
    padding: 4,
  },
  emptyCart: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyCartText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
  cartItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  cartItemInfo: {
    marginBottom: 8,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  cartItemPrice: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  cartItemSubtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
    textAlign: 'right',
  },
  totalCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: '#94a3b8',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  finalizeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  finalizeButtonDisabled: {
    opacity: 0.5,
  },
  finalizeButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  finalizeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  pickerContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  pickerCloseIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  pickerItemText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  productPickerInfo: {
    flex: 1,
  },
  productPickerPrice: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 2,
  },
  productPickerStock: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
});