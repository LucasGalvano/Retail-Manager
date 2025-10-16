import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';

// REMOVIDO: Importação de storageUtils

export default function App() {
  const [screen, setScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicialização: a única coisa que faz é marcar como inicializado
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Futuramente, esta função deve checar se o usuário já está logado no AsyncStorage.
      setIsInitialized(true);
    } catch (error) {
      console.error('Erro na inicialização:', error);
      Alert.alert('Erro', 'Falha ao inicializar o aplicativo');
    }
  };

  const handleLoginSuccess = async (userData) => {
    // 1. Salva os dados do usuário no estado local
    setUser(userData);
    
    // 2. Criar dados iniciais para o usuário (SEMENTE)
    // REMOVIDO: Bloco try/catch com await storageUtils.seedInitialData(userData.uid);
    //           Isso resolve o ReferenceError.
    
    // 3. Navega para a tela principal
    setScreen('home');
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirmar Logout',
      'Deseja realmente sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            // Futuramente, adicione aqui a lógica para LIMPAR o token do AsyncStorage
            setUser(null);
            setScreen('login');
          },
        },
      ]
    );
  };

  // Simplificamos as funções de navegação, deixando apenas o necessário
  const handleNavigate = (screenName) => {
    // A tela principal (home) não precisa dessa função por enquanto, mas mantemos para futura expansão.
    // Ex: onNavigate('products')
    setScreen(screenName);
  };

  // REMOVIDO: handleBack, pois não temos telas internas
  
  // Aguardar inicialização
  if (!isInitialized) {
    return null;
  }

  // =================================================================
  // Lógica de Navegação
  // =================================================================

  if (screen === 'login') {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (screen === 'home' && user) {
    return (
      <HomeScreen
        user={user}
        onLogout={handleLogout}
        onNavigate={handleNavigate} // Mantemos a prop, mas ela não faz nada no HomeScreen atual
      />
    );
  }
  
  // Fallback: Se o estado estiver inconsistente, volta para o login
  return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
}