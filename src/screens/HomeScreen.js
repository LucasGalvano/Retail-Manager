import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ user, onLogout }) => {
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
                {/* Mostra o nome do usuário logado */}
                Bem-vindo, {user?.displayName || user?.email || 'Usuário'}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.homeScroll}>
        {/* Conteúdo de Boas-Vindas Simples */}
        <View style={styles.welcomeSection}>
          <Ionicons name="sparkles" size={64} color="#3b82f6" />
          <Text style={styles.welcomeTitle}>Sucesso!</Text>
          <Text style={styles.welcomeText}>
            O login foi bem-sucedido. Esta é sua tela principal.
            Próximo passo: Adicionar a navegação e a lógica de dados aqui.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

// ========== ESTILOS (Apenas o necessário foi mantido) ==========
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
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fca5a5',
    fontWeight: '600',
  },
  homeScroll: {
    flex: 1,
  },
  // Estilos da nova seção de boas-vindas
  welcomeSection: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  welcomeText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 10,
  },
});