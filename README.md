# 🏪 Retail Manager

![React Native](https://img.shields.io/badge/React%20Native-0.74+-blue?logo=react)
![Expo SDK](https://img.shields.io/badge/Expo%20SDK-52-purple?logo=expo)
![Status](https://img.shields.io/badge/Status-Completo-success)
![License](https://img.shields.io/badge/Licen%C3%A7a-Acad%C3%AAmica-lightgrey)

> Aplicativo mobile completo de **gestão comercial**, desenvolvido em **[React Native](https://reactnative.dev/)** + **[Expo](https://docs.expo.dev/)**, com controle de **produtos, funcionários, vendas e relatórios interativos**.

---

## 📋 Visão Geral

O **Retail Manager** é uma solução mobile voltada para pequenos e médios varejistas que desejam **gerenciar produtos, funcionários e vendas** de forma simples e intuitiva.  
O app oferece:

- 🛍️ **Controle de estoque e produtos**  
- 👥 **Gestão de funcionários com metas e bônus**  
- 💰 **Registro de vendas com carrinho de compras**  
- 📊 **Relatórios e dashboards interativos**  
- 🎵 **Feedback sonoro e tátil para ações do usuário**

---

## 🎯 Requisitos Atendidos

✅ 6 telas completas (Login, Home, Produtos, Funcionários, Vendas, Relatórios)  
✅ Imagens dinâmicas via câmera, galeria ou URL  
✅ Armazenamento local persistente com AsyncStorage  
✅ Atuadores: Sons + Vibração  
✅ Gráficos interativos com Plotly.js + WebView  

---

## 🧩 Tecnologias Utilizadas

- **[React Native 0.74+](https://reactnative.dev/docs/environment-setup)**  
- **[Expo SDK 52](https://docs.expo.dev/versions/latest/)**  
- **[AsyncStorage](https://react-native-async-storage.github.io/async-storage/docs/install/)** – persistência local  
- **[Expo AV](https://docs.expo.dev/versions/latest/sdk/av/)** – reprodução de sons  
- **[Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)** – captura e seleção de imagens  
- **[Expo File System](https://docs.expo.dev/versions/latest/sdk/filesystem/)** – salvamento permanente de fotos  
- **[Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)** – gradientes visuais modernos  
- **[React Native WebView](https://github.com/react-native-webview/react-native-webview)** + **[Plotly.js](https://plotly.com/javascript/)** – gráficos interativos  
- **[@expo/vector-icons (Ionicons)](https://docs.expo.dev/guides/icons/)** – biblioteca de ícones  

---

## ⚙️ Funcionalidades

### 🔐 Autenticação
- Cadastro e login local com AsyncStorage  
- Validação de credenciais e prevenção de duplicatas  
- Feedback sonoro e tátil em erros e sucesso  

### 📊 Dashboard (Home)
- Métricas em tempo real (vendas, produtos, funcionários)  
- Cards interativos e últimas vendas realizadas  
- Sistema de dicas para novos usuários  

### 📦 Gestão de Produtos
- CRUD completo com persistência local  
- Adição de fotos via câmera, galeria ou URL  
- Controle de estoque e alerta visual (<10 unidades)  
- Sons contextuais ao salvar ou validar  

### 👥 Gestão de Funcionários
- Cadastro com **salário base**, **meta mensal** e **bônus (%)**  
- Cálculo automático de bônus:
  ```js
  const bonus = (salario * bonusPercentual) / 100;
  const salarioComBonus = salario + bonus;
  ``` 

* Preview em tempo real do salário total

### 💰 Sistema de Vendas

* Seleção de funcionário responsável
* Carrinho de compras com ajuste de quantidades
* Validação automática de estoque
* Atualização de estoque após venda
* Sons aleatórios ao finalizar (“caixa registradora” / “plim”)

### 📈 Relatórios e Analytics

* **Gráfico de vendas (7 dias)**
* **Vendas por funcionário**
* **Top 5 produtos**
* Comparação de metas e bônus com barra de progresso
* Indicador visual: “✅ Meta atingida” ou “⏳ Em progresso”

### 🎵 Feedback Multissensorial

**Sons**

* `beep.mp3` – salvar produtos
* `success_sound.mp3` – ações bem-sucedidas
* `error_sound.mp3` – erros e validações
* `plim.mp3` e `chi_ching.mp3` – vendas finalizadas

**Vibrações**

* Sucesso: 50 ms
* Erro: [100, 50, 100] ms
* Atualização: 30 ms

---

## 🧱 Estrutura do Projeto

```
retail-manager/
├── assets/
│   ├── beep.mp3
│   ├── chi_ching.mp3
│   ├── error_sound.mp3
│   ├── plim.mp3
│   └── success_sound.mp3
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── HomeScreen.js
│   │   ├── ProductsScreen.js
│   │   ├── EmployeeScreen.js
│   │   ├── SalesScreen.js
│   │   └── ReportsScreen.js
│   └── services/
│       ├── StorageServices.js
│       └── SoundService.js
├── App.js
└── package.json
```

---

## 🛠️ Instalação e Execução

### Pré-requisitos

* [Node.js 18+](https://nodejs.org/)
* [Expo CLI](https://docs.expo.dev/more/expo-cli/) (`npm install -g expo-cli`)
* App **Expo Go** (Android/iOS)

### Passos

```bash
git clone https://github.com/LucasGalvano/Retail-Manager
cd Retail-Manager
npm install
npx expo start
```

Escaneie o QR Code exibido no terminal com o **Expo Go**.

---

## 💡 Complexidade Técnica

### 1. Agregação e Processamento de Dados

* Cálculo de métricas e estatísticas combinando 3 coleções (produtos, funcionários, vendas)
* Análise comparativa de vendas vs. metas com cálculo automático de bônus

### 2. Persistência Local Avançada

* Armazenamento completo com AsyncStorage
* Sistema de chaves compostas por usuário
* Imagens copiadas para diretório permanente via **Expo FileSystem**

### 3. UX Multissensorial

* 5 sons diferentes e padrões de vibração
* Feedback imediato e responsivo

### 4. Arquitetura Modular

* Services isolados (Auth, Products, Employees, Sales)
* Lógica de negócio reutilizável e desacoplada

---

## 🎬 Demonstração

🎥 Um vídeo demonstrativo será adicionado futuramente, mostrando:

1. Login → Dashboard
2. Cadastro de produto com foto
3. Registro de venda completa
4. Relatórios com gráficos dinâmicos

---

## 📚 Aprendizados

* Domínio completo de CRUD com **AsyncStorage**
* Persistência permanente de imagens com **Expo FileSystem**
* Integração de gráficos com **Plotly.js** + **WebView**
* Validações complexas e sincronização entre coleções
* Feedbacks multissensoriais que melhoram a UX


---

## 👨‍💻 Desenvolvimento Acadêmico

📘 **Disciplina:** CCP150 – Desenvolvimento de Aplicativos Móveis

🏫 **Instituição:** Centro Universitário FEI

👨‍🏫 **Professores:** Rafael Gomes Alves e Isaac Jesus

---

## 📄 Licença e Declaração

Projeto desenvolvido **para fins acadêmicos**.
