import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import EmployeesScreen from './src/screens/EmployeeScreen';
import SalesScreen from './src/screens/SalesScreen';
import ReportsScreen from './src/screens/ReportsScreen';


export default function App() {
  const [screen, setScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsInitialized(true);
    } catch (error) {
      console.error('Erro na inicialização:', error);
      Alert.alert('Erro', 'Falha ao inicializar o aplicativo');
    }
  };

  const handleLoginSuccess = async (userData) => {
    setUser(userData);
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
            setUser(null);
            setScreen('login');
          },
        },
      ]
    );
  };

  const handleNavigate = (screenName) => {
    setScreen(screenName);
  };

  const handleBack = () => {
    setScreen('home');
  };
  
  // Aguardar inicialização
  if (!isInitialized) {
    return null;
  }

  if (screen === 'login') {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (screen === 'home' && user) {
    return (
      <HomeScreen
        user={user}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />
    );
  }
  
  if (screen === 'products' && user) {
    return <ProductsScreen user={user} onBack={handleBack} />;
  }

  if (screen === 'employees' && user) {
    return <EmployeesScreen user={user} onBack={handleBack} />;
  }

  if (screen === 'sales' && user){
    return <SalesScreen user={user} onBack={handleBack} />;
  }

  if (screen === 'reports') {
    return <ReportsScreen user={user} onBack={handleBack} />;
  } 
  
  // Fallback: Se o estado estiver inconsistente, volta para o login
  return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
}