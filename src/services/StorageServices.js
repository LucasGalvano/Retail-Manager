import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USERS: '@retail_manager:users',
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

// ========== UTILITÁRIOS ==========
export const storageUtils = {
  // Limpar todo o storage do seu app (útil para desenvolvimento)
  clearAll: async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      // Filtra apenas as chaves que começam com o prefixo do seu app
      const retailKeys = allKeys.filter(key => key.startsWith('@retail_manager:'));
      await AsyncStorage.multiRemove(retailKeys);
      return true;
    } catch (error) {
      console.error('Erro ao limpar storage:', error);
      throw error;
    }
  },
};