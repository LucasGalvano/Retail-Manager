import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USERS: '@retail_manager:users',
  PRODUCTS: '@retail_manager:products:',
  EMPLOYEES: '@retail_manager:employees:',
  SALES: '@retail_manager:sales:',
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

// ========== FUNCIONÁRIOS (POR USUÁRIO) ==========
export const employeeService = {
  // Obter todos os funcionários do usuário
  getAll: async (userId) => {
    try {
      const key = KEYS.EMPLOYEES + userId;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      return [];
    }
  },

  // Adicionar novo funcionário
  add: async (userId, employee) => {
    try {
      const employees = await employeeService.getAll(userId);
      const newEmployee = {
        id: Date.now().toString(),
        ...employee,
        createdAt: new Date().toISOString(),
      };
      employees.push(newEmployee);
      
      const key = KEYS.EMPLOYEES + userId;
      await AsyncStorage.setItem(key, JSON.stringify(employees));
      return newEmployee;
    } catch (error) {
      console.error('Erro ao adicionar funcionário:', error);
      throw error;
    }
  },

  // Atualizar funcionário
  update: async (userId, id, updatedData) => {
    try {
      const employees = await employeeService.getAll(userId);
      const index = employees.findIndex(e => e.id === id);
      if (index !== -1) {
        employees[index] = { ...employees[index], ...updatedData };
        
        const key = KEYS.EMPLOYEES + userId;
        await AsyncStorage.setItem(key, JSON.stringify(employees));
        return employees[index];
      }
      throw new Error('Funcionário não encontrado');
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error);
      throw error;
    }
  },

  // Deletar funcionário
  delete: async (userId, id) => {
    try {
      const employees = await employeeService.getAll(userId);
      const filtered = employees.filter(e => e.id !== id);
      
      const key = KEYS.EMPLOYEES + userId;
      await AsyncStorage.setItem(key, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Erro ao deletar funcionário:', error);
      throw error;
    }
  },
};

// ========== VENDAS (POR USUÁRIO) ==========
export const salesService = {
  // Obter todas as vendas do usuário
  getAll: async (userId) => {
    try {
      const key = KEYS.SALES + userId;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      return [];
    }
  },

  // Adicionar nova venda
  add: async (userId, sale) => {
    try {
      const sales = await salesService.getAll(userId);
      const newSale = {
        id: Date.now().toString(),
        ...sale,
        createdAt: new Date().toISOString(),
      };
      sales.push(newSale);
      
      const key = KEYS.SALES + userId;
      await AsyncStorage.setItem(key, JSON.stringify(sales));
      return newSale;
    } catch (error) {
      console.error('Erro ao adicionar venda:', error);
      throw error;
    }
  },

  // Obter vendas de hoje
  getTodaySales: async (userId) => {
    try {
      const sales = await salesService.getAll(userId);
      const today = new Date().toISOString().split('T')[0];
      
      return sales.filter(sale => {
        const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
        return saleDate === today;
      });
    } catch (error) {
      console.error('Erro ao buscar vendas de hoje:', error);
      return [];
    }
  },

  // Obter total de vendas de hoje
  getTodayTotal: async (userId) => {
    try {
      const todaySales = await salesService.getTodaySales(userId);
      return todaySales.reduce((sum, sale) => sum + sale.valorTotal, 0);
    } catch (error) {
      console.error('Erro ao calcular total de hoje:', error);
      return 0;
    }
  },

  // Obter últimas vendas (limite)
  getRecent: async (userId, limit = 5) => {
    try {
      const sales = await salesService.getAll(userId);
      return sales
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
    } catch (error) {
      console.error('Erro ao buscar vendas recentes:', error);
      return [];
    }
  },

  // Processar venda com validação de estoque
  processSale: async (userId, saleData) => {
    try {
      const { funcionarioId, produtos } = saleData;

      // 1. Validar funcionário
      const employees = await employeeService.getAll(userId);
      const employee = employees.find(e => e.id === funcionarioId);
      if (!employee) {
        throw new Error('Funcionário não encontrado');
      }

      // 2. Validar produtos e estoque
      const allProducts = await productService.getAll(userId);
      let valorTotal = 0;
      const produtosVenda = [];

      for (const item of produtos) {
        const product = allProducts.find(p => p.id === item.produtoId);
        
        if (!product) {
          throw new Error(`Produto não encontrado: ${item.produtoId}`);
        }

        if (product.estoque < item.quantidade) {
          throw new Error(`Estoque insuficiente para ${product.nome}. Disponível: ${product.estoque}`);
        }

        const subtotal = product.preco * item.quantidade;
        valorTotal += subtotal;

        produtosVenda.push({
          produtoId: product.id,
          nome: product.nome,
          preco: product.preco,
          quantidade: item.quantidade,
          subtotal,
        });

        // 3. Atualizar estoque
        await productService.update(userId, product.id, {
          estoque: product.estoque - item.quantidade,
        });
      }

      // 4. Criar venda
      const sale = {
        funcionarioId: employee.id,
        funcionarioNome: employee.nome,
        produtos: produtosVenda,
        valorTotal,
      };

      const newSale = await salesService.add(userId, sale);
      return newSale;
    } catch (error) {
      console.error('Erro ao processar venda:', error);
      throw error;
    }
  },
};


// ========== UTILITÁRIOS ==========
export const storageUtils = {
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