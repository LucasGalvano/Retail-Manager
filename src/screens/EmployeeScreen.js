import React, { useState, useEffect } from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
        StatusBar, Alert, Vibration, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { employeeService } from '../services/StorageServices';

const EmployeesScreen = ({ user, onBack }) => {
  const [employees, setEmployees] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Form state
  const [nome, setNome] = useState('');
  const [salario, setSalario] = useState('');
  const [meta, setMeta] = useState('');
  const [bonusPercentual, setBonusPercentual] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    const data = await employeeService.getAll(user.uid);
    setEmployees(data);
  };

  const handleSaveEmployee = async () => {
    if (!nome || !salario || !meta || !bonusPercentual) {
      Vibration.vibrate([100, 50, 100]);
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const employeeData = {
        nome,
        salario: parseFloat(salario),
        meta: parseFloat(meta),
        bonusPercentual: parseFloat(bonusPercentual),
      };

      if (editingEmployee) {
        await employeeService.update(user.uid, editingEmployee.id, employeeData);
      } else {
        await employeeService.add(user.uid, employeeData);
      }

      Vibration.vibrate(50);

      Alert.alert(
        'Sucesso',
        editingEmployee ? 'Funcionário atualizado!' : 'Funcionário cadastrado!',
        [{ text: 'OK', onPress: () => handleCloseModal() }]
      );

      await loadEmployees();
    } catch (error) {
      Vibration.vibrate([100, 50, 100]);
      Alert.alert('Erro', 'Não foi possível salvar o funcionário');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setNome(employee.nome);
    setSalario(employee.salario.toString());
    setMeta(employee.meta.toString());
    setBonusPercentual(employee.bonusPercentual.toString());
    setModalVisible(true);
  };

  const handleDeleteEmployee = (employee) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir "${employee.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await employeeService.delete(user.uid, employee.id);
              Vibration.vibrate([50, 50]);
              await loadEmployees();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o funcionário');
            }
          },
        },
      ]
    );
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingEmployee(null);
    setNome('');
    setSalario('');
    setMeta('');
    setBonusPercentual('');
  };

  const formatCurrency = (value) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const calculateSalaryWithBonus = (salario, meta, bonusPercentual) => {
    const bonus = (salario * bonusPercentual) / 100;
    return salario + bonus;
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
            <Ionicons name="people" size={28} color="#a855f7" />
            <Text style={styles.headerTitle}>Funcionários</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* Lista de Funcionários */}
      <ScrollView style={styles.content}>
        {employees.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={80} color="#475569" />
            <Text style={styles.emptyText}>Nenhum funcionário cadastrado</Text>
            <Text style={styles.emptySubtext}>
              Toque no botão + para adicionar
            </Text>
          </View>
        ) : (
          employees.map((employee) => (
            <View key={employee.id} style={styles.employeeCard}>
              <View style={styles.employeeAvatar}>
                <Ionicons name="person" size={32} color="#a855f7" />
              </View>
              
              <View style={styles.employeeInfo}>
                <Text style={styles.employeeName}>{employee.nome}</Text>
                
                <View style={styles.infoRow}>
                  <Ionicons name="cash-outline" size={14} color="#94a3b8" />
                  <Text style={styles.infoText}>
                    Salário: {formatCurrency(employee.salario)}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="trophy-outline" size={14} color="#94a3b8" />
                  <Text style={styles.infoText}>
                    Meta: {formatCurrency(employee.meta)}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="trending-up-outline" size={14} color="#10b981" />
                  <Text style={styles.bonusText}>
                    Bônus: {employee.bonusPercentual}% ({formatCurrency(calculateSalaryWithBonus(employee.salario, employee.meta, employee.bonusPercentual))})
                  </Text>
                </View>
              </View>

              <View style={styles.employeeActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditEmployee(employee)}
                >
                  <Ionicons name="pencil" size={20} color="#3b82f6" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteEmployee(employee)}
                >
                  <Ionicons name="trash" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Botão Adicionar */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          Vibration.vibrate(30);
          setModalVisible(true);
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#a855f7', '#ec4899']}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Modal Adicionar/Editar */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardView}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}
                </Text>
                <TouchableOpacity onPress={handleCloseModal}>
                  <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nome Completo *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: João Silva"
                    placeholderTextColor="#64748b"
                    value={nome}
                    onChangeText={setNome}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Salário Base (R$) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor="#64748b"
                    value={salario}
                    onChangeText={setSalario}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Meta de Vendas (R$) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor="#64748b"
                    value={meta}
                    onChangeText={setMeta}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Bônus por Meta (%) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: 5"
                    placeholderTextColor="#64748b"
                    value={bonusPercentual}
                    onChangeText={setBonusPercentual}
                    keyboardType="numeric"
                  />
                  <Text style={styles.inputHint}>
                    Percentual sobre o salário ao atingir a meta
                  </Text>
                </View>

                {/* Preview do Salário com Bônus */}
                {salario && bonusPercentual ? (
                  <View style={styles.previewCard}>
                    <Ionicons name="calculator-outline" size={24} color="#10b981" />
                    <View style={styles.previewInfo}>
                      <Text style={styles.previewLabel}>Salário com Bônus:</Text>
                      <Text style={styles.previewValue}>
                        {formatCurrency(calculateSalaryWithBonus(
                          parseFloat(salario) || 0,
                          parseFloat(meta) || 0,
                          parseFloat(bonusPercentual) || 0
                        ))}
                      </Text>
                    </View>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                  onPress={handleSaveEmployee}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#a855f7', '#ec4899']}
                    style={styles.saveButtonGradient}
                  >
                    <Ionicons name="checkmark" size={24} color="#fff" />
                    <Text style={styles.saveButtonText}>
                      {loading
                        ? 'Salvando...'
                        : editingEmployee
                        ? 'Atualizar'
                        : 'Salvar Funcionário'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

export default EmployeesScreen;

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
  employeeCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  employeeAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  employeeInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  bonusText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  employeeActions: {
    justifyContent: 'center',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#a855f7',
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
    maxHeight: '85%',
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputHint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  previewInfo: {
    marginLeft: 12,
  },
  previewLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  previewValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
    marginTop: 2,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 20,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});