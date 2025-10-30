import React, { useState, useEffect } from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, StatusBar,
        Alert, Vibration, Modal, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { productService } from '../services/StorageServices';
import { SoundService } from '../services/SoundService';

const ProductsScreen = ({ user, onBack }) => {
  const [products, setProducts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');

  useEffect(() => {
    loadProducts();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissões necessárias',
        'Para adicionar fotos, precisamos de acesso à câmera e galeria.'
      );
    }
  };

  const loadProducts = async () => {
    const data = await productService.getAll(user.uid);
    setProducts(data);
  };


  const formatDecimalInput = (text) => {
    // Remove tudo que não é número, vírgula ou ponto
    return text.replace(/[^0-9.,]/g, '');
  };

  const parseDecimalValue = (text) => {
    // Substitui vírgula por ponto e converte para número
    return parseFloat(text.replace(',', '.')) || 0;
  };


  const handleChoosePhoto = () => {
    Alert.alert(
      'Adicionar Foto',
      'Escolha uma opção',
      [
        {
          text: 'Câmera',
          onPress: () => takePhoto(),
        },
        {
          text: 'Galeria',
          onPress: () => pickImage(),
        },
        {
          text: 'URL',
          onPress: () => promptForUrl(),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setFotoUrl(result.assets[0].uri);
      }
    } catch (error) {
      SoundService.playError();
      Alert.alert('Erro', 'Não foi possível abrir a câmera');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setFotoUrl(result.assets[0].uri);
      }
    } catch (error) {
      SoundService.playError();
      Alert.alert('Erro', 'Não foi possível abrir a galeria');
    }
  };

  const promptForUrl = () => {
    Alert.prompt(
      'URL da Imagem',
      'Cole o link da imagem:',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: (url) => {
            if (url) {
              setFotoUrl(url);
            }
          },
        },
      ],
      'plain-text',
      fotoUrl
    );
  };

  const handleSaveProduct = async () => {
    if (!nome || !preco || !estoque) {
      Vibration.vibrate([100, 50, 100]);
      SoundService.playError();
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const productData = {
        nome,
        preco: parseDecimalValue(preco),
        estoque: parseInt(estoque),
        fotoUrl: fotoUrl || 'https://via.placeholder.com/150',
      };

      if (editingProduct) {
        await productService.update(user.uid, editingProduct.id, productData);
      } else {
        await productService.add(user.uid, productData);
      }

      SoundService.playBeep();
      
      Alert.alert(
        'Sucesso',
        editingProduct ? 'Produto atualizado!' : 'Produto cadastrado!',
        [{ text: 'OK', onPress: () => handleCloseModal() }]
      );

      await loadProducts();
    } catch (error) {
      Vibration.vibrate([100, 50, 100]);
      SoundService.playError();
      Alert.alert('Erro', 'Não foi possível salvar o produto');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNome(product.nome);
    setPreco(product.preco.toString());
    setEstoque(product.estoque.toString());
    setFotoUrl(product.fotoUrl || '');
    setModalVisible(true);
  };

  const handleDeleteProduct = (product) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir "${product.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await productService.delete(user.uid, product.id);
              SoundService.playSuccess();
              await loadProducts();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o produto');
            }
          },
        },
      ]
    );
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingProduct(null);
    setNome('');
    setPreco('');
    setEstoque('');
    setFotoUrl('');
  };

  const formatCurrency = (value) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
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
            <Ionicons name="cube" size={28} color="#3b82f6" />
            <Text style={styles.headerTitle}>Produtos</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* Lista de Produtos */}
      <ScrollView style={styles.content}>
        {products.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={80} color="#475569" />
            <Text style={styles.emptyText}>Nenhum produto cadastrado</Text>
            <Text style={styles.emptySubtext}>
              Toque no botão + para adicionar
            </Text>
          </View>
        ) : (
          products.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <Image
                source={{ uri: product.fotoUrl }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.nome}</Text>
                <Text style={styles.productPrice}>
                  {formatCurrency(product.preco)}
                </Text>
                <View style={styles.stockBadge}>
                  <Ionicons
                    name="cube-outline"
                    size={14}
                    color={product.estoque < 10 ? '#ef4444' : '#10b981'}
                  />
                  <Text
                    style={[
                      styles.stockText,
                      product.estoque < 10 && styles.stockLow,
                    ]}
                  >
                    Estoque: {product.estoque}
                  </Text>
                </View>
              </View>
              <View style={styles.productActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditProduct(product)}
                >
                  <Ionicons name="pencil" size={20} color="#3b82f6" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteProduct(product)}
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
          setModalVisible(true);
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#3b82f6', '#06b6d4']}
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
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </Text>
                <TouchableOpacity onPress={handleCloseModal}>
                  <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                  {/* Preview da Foto */}
                  {fotoUrl ? (
                    <View style={styles.photoPreviewContainer}>
                      <Image source={{ uri: fotoUrl }} style={styles.photoPreview} />
                      <TouchableOpacity
                        style={styles.changePhotoButton}
                        onPress={handleChoosePhoto}
                      >
                        <Ionicons name="camera" size={20} color="#3b82f6" />
                        <Text style={styles.changePhotoText}>Alterar Foto</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addPhotoButton}
                      onPress={handleChoosePhoto}
                    >
                      <Ionicons name="camera-outline" size={40} color="#64748b" />
                      <Text style={styles.addPhotoText}>Adicionar Foto</Text>
                      <Text style={styles.addPhotoSubtext}>Toque para escolher</Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Nome do Produto *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: Notebook Dell"
                      placeholderTextColor="#64748b"
                      value={nome}
                      onChangeText={setNome}
                    />
                  </View>

                  <View style={styles.inputRow}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.inputLabel}>Preço (R$) *</Text>
                        <TextInput
                        style={styles.input}
                        placeholder="0,00"
                        placeholderTextColor="#64748b"
                        value={preco}
                        onChangeText={(text) => setPreco(formatDecimalInput(text))}
                        keyboardType="decimal-pad"
                      />
                    </View>

                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                      <Text style={styles.inputLabel}>Estoque *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="0"
                        placeholderTextColor="#64748b"
                        value={estoque}
                        onChangeText={setEstoque}
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                    onPress={handleSaveProduct}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={['#10b981', '#059669']}
                      style={styles.saveButtonGradient}
                    >
                      <Ionicons name="checkmark" size={24} color="#fff" />
                      <Text style={styles.saveButtonText}>
                        {loading
                          ? 'Salvando...'
                          : editingProduct
                          ? 'Atualizar'
                          : 'Salvar Produto'}
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

export default ProductsScreen;

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
  productCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 6,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stockText: {
    fontSize: 12,
    color: '#10b981',
  },
  stockLow: {
    color: '#ef4444',
  },
  productActions: {
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
    shadowColor: '#3b82f6',
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
  photoPreviewContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoPreview: {
    width: 150,
    height: 150,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
  },
  changePhotoText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  addPhotoButton: {
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  addPhotoText: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  addPhotoSubtext: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
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
  inputRow: {
    flexDirection: 'row',
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