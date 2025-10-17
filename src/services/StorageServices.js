import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USERS: '@retail_manager:users',
  PRODUCTS: '@retail_manager:products:',
};

export const authService = {
  signUp: async (email, password, name) => {
    try {
      // 1. Buscar usuários existentes
      const usersData = await AsyncStorage.getItem(KEYS.USERS);
      const users = usersData ? JSON.parse(usersData) : [];

      // 2. Verificar se email já existe
      const emailExists = users.find(u => u.email === email);
      if (emailExists) {
        throw new Error('Email já cadastrado');
      }

      // 3. Criar novo usuário
      const newUser = {
        uid: Date.now().toString(),
        email,
        password,
        displayName: name,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(users));

      const { password: _, ...userWithoutPassword } = newUser;
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      throw error;
    }
  },

  // Login
  signIn: async (email, password) => {
    try {
      const usersData = await AsyncStorage.getItem(KEYS.USERS);
      const users = usersData ? JSON.parse(usersData) : [];

      // 1. Buscar usuário por email e senha
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Email ou senha incorretos');
      }

      // 2. Retornar usuário sem a senha
      const { password: _, ...userWithoutPassword } = user;
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  },

  // Listar todos os usuários (apenas para debug)
  getAllUsers: async () => {
    try {
      const usersData = await AsyncStorage.getItem(KEYS.USERS);
      return usersData ? JSON.parse(usersData) : [];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  },
};

// ========== PRODUTOS (POR USUÁRIO) ==========
export const productService = {
  // Obter todos os produtos do usuário
  getAll: async (userId) => {
    try {
      const key = KEYS.PRODUCTS + userId;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
  },

  // Adicionar novo produto
  add: async (userId, product) => {
    try {
      const products = await productService.getAll(userId);
      const newProduct = {
        id: Date.now().toString(),
        ...product,
        createdAt: new Date().toISOString(),
      };
      products.push(newProduct);
      
      const key = KEYS.PRODUCTS + userId;
      await AsyncStorage.setItem(key, JSON.stringify(products));
      return newProduct;
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      throw error;
    }
  },

  // Atualizar produto
  update: async (userId, id, updatedData) => {
    try {
      const products = await productService.getAll(userId);
      const index = products.findIndex(p => p.id === id);
      if (index !== -1) {
        products[index] = { ...products[index], ...updatedData };
        
        const key = KEYS.PRODUCTS + userId;
        await AsyncStorage.setItem(key, JSON.stringify(products));
        return products[index];
      }
      throw new Error('Produto não encontrado');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  },

  // Deletar produto
  delete: async (userId, id) => {
    try {
      const products = await productService.getAll(userId);
      const filtered = products.filter(p => p.id !== id);
      
      const key = KEYS.PRODUCTS + userId;
      await AsyncStorage.setItem(key, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  },

  // Obter estatísticas
  getStats: async (userId) => {
    try {
      const products = await productService.getAll(userId);
      const totalProducts = products.length;
      const totalValue = products.reduce((sum, p) => sum + (p.preco * p.estoque), 0);
      const lowStock = products.filter(p => p.estoque < 10).length;
      
      return {
        totalProducts,
        totalValue,
        lowStock,
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return { totalProducts: 0, totalValue: 0, lowStock: 0 };
    }
  },
};

// ========== UTILITÁRIOS ==========
export const storageUtils = {
  // Limpar todo o storage do seu app
  clearAll: async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const retailKeys = allKeys.filter(key => key.startsWith('@retail_manager:'));
      await AsyncStorage.multiRemove(retailKeys);
      return true;
    } catch (error) {
      console.error('Erro ao limpar storage:', error);
      throw error;
    }
  },
};