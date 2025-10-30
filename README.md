# Retail Manager 📊

Aplicativo mobile de gestão comercial desenvolvido em React Native para controle completo de produtos, funcionários e vendas.

## Visão Geral e Requisitos

O **Retail Manager** é uma solução mobile para pequenos e médios varejistas gerenciarem suas operações diárias. O sistema oferece controle de estoque, registro de vendas, gestão de funcionários com cálculo automático de bônus e análises visuais de desempenho.

### Motivação
A ausência de ferramentas acessíveis para gestão de pequenos negócios motivou este projeto, buscando substituir planilhas e cadernos por uma interface intuitiva e funcional.

### Requisitos Atendidos
- ✅ **6 telas implementadas** (Login/Cadastro, Home, Produtos, Funcionários, Vendas, Relatórios)
- ✅ **Imagens dinâmicas** via câmera, galeria ou URL
- ✅ **Armazenamento local** com AsyncStorage
- ✅ **Atuadores**: Vibração (feedbacks) e Sons (confirmações de ações)

## Tecnologias Utilizadas

- **React Native** + Expo SDK 52
- **AsyncStorage** - Persistência de dados local
- **Expo AV** - Reprodução de sons
- **Expo Haptics** - Feedback tátil (vibração)
- **Expo Image Picker** - Captura de fotos
- **React Navigation** - Gerenciamento de navegação
- **Expo Linear Gradient** - Gradientes visuais
- **Plotly.js** + WebView - Gráficos interativos

## Funcionalidades

### 1. Autenticação
- Sistema completo de login e cadastro
- Validação de credenciais e senhas
- Feedback sonoro e tátil em erros

### 2. Dashboard (Home)
- Métricas em tempo real: vendas do dia, produtos cadastrados, funcionários
- Cards interativos com estatísticas
- Ações rápidas para navegação
- Lista das últimas vendas realizadas
- Sistema de dicas para novos usuários

### 3. Gestão de Produtos
- CRUD completo de produtos
- Adição de fotos via câmera, galeria ou URL
- Controle de preço e estoque
- Alertas visuais para estoque baixo (<10 unidades)
- Som de confirmação ao salvar

### 4. Gestão de Funcionários
- Cadastro com salário base, meta mensal e % de bônus
- Preview em tempo real do salário com bônus
- Listagem com informações consolidadas
- Validações com feedback multissensorial

### 5. Sistema de Vendas
- Seleção de funcionário responsável
- Carrinho de compras com ajuste de quantidades
- Validação automática de estoque
- Cálculo em tempo real do total
- Atualização automática de estoque após venda
- Sons aleatórios de "caixa registradora" na confirmação

### 6. Relatórios e Analytics
- **Gráfico de Vendas (7 dias)**: Barras verticais com valores
- **Vendas por Funcionário**: Barras horizontais coloridas
- **Top 5 Produtos**: Ranking de mais vendidos
- **Análise de Bônus**: 
  - Comparação vendas vs. meta
  - Barra de progresso visual
  - Cálculo automático de bônus ganho
  - Status de atingimento de meta

### 7. Feedback Multissensorial
- **Sons**:
  - `beep.mp3` - Salvar produtos
  - `success_sound.mp3` - Ações bem-sucedidas
  - `error_sound.mp3` - Erros e validações
  - `plim.mp3` e `chi_ching.mp3` - Vendas finalizadas (aleatório)
- **Vibração**: Padrões diferentes para sucesso, erro e ações críticas

## Demonstração

[Insira aqui GIF ou vídeo demonstrando o app]

**Principais fluxos a mostrar:**
1. Login → Dashboard
2. Cadastro de produto com foto
3. Registro de venda completa
4. Visualização de relatórios com gráficos

## Estrutura do Projeto

```
retail-manager/
├── assets/                    # Sons e recursos
│   ├── beep.mp3
│   ├── chi_ching.mp3
│   ├── error_sound.mp3
│   ├── plim.mp3
│   └── success_sound.mp3
├── src/
│   ├── screens/              # Telas do aplicativo
│   │   ├── LoginScreen.js
│   │   ├── HomeScreen.js
│   │   ├── ProductsScreen.js
│   │   ├── EmployeeScreen.js
│   │   ├── SalesScreen.js
│   │   └── ReportsScreen.js
│   └── services/             # Lógica de negócio
│       ├── StorageServices.js    # CRUD com AsyncStorage
│       └── SoundService.js       # Gerenciador de sons
├── App.js                    # Componente principal
└── package.json
```

## Instalação e Execução

### Pré-requisitos
```bash
Node.js 18+ instalado
Expo CLI: npm install -g expo-cli
App Expo Go no celular (Android/iOS)
```

### Passos

1. **Clone o repositório**
```bash
git clone [URL_DO_REPOSITORIO]
cd retail-manager
```

2. **Instale as dependências**
```bash
npm install
```

3. **Inicie o projeto**
```bash
npx expo start
```

4. **Execute no dispositivo**
- Escaneie o QR Code com o Expo Go
- Ou pressione `a` para Android / `i` para iOS (emuladores)

## Complexidade Técnica Implementada

### 1. Agregação e Processamento de Dados
- **Análise de bônus**: Cálculo comparativo vendas vs. metas com múltiplas métricas
- **Estatísticas em tempo real**: Consolidação de dados de 3 coleções distintas
- **Relatórios visuais**: Processamento e formatação de dados para gráficos Plotly

### 2. Validações e Integridade
- Validação de estoque em tempo real durante vendas
- Atualização automática de estoque após transações
- Sistema de chaves compostas para isolamento de dados por usuário

### 3. Experiência Multissensorial
- 5 tipos diferentes de sons contextuais
- Padrões de vibração específicos por tipo de ação
- Feedback visual com gradientes e animações

### 4. Arquitetura Modular
- Services isolados para cada entidade (Auth, Products, Employees, Sales)
- Reutilização de componentes e lógica
- Separação clara de responsabilidades

## Aprendizados e Próximos Passos

### Principais Aprendizados
- **AsyncStorage**: Domínio completo de CRUD local com chaves compostas para multi-usuário
- **Feedback UX**: Implementação de sons e vibrações melhorou drasticamente a percepção de qualidade
- **Agregação de dados**: Desenvolvi lógicas complexas para cálculos de métricas consolidadas
- **Gráficos dinâmicos**: Integração Plotly + WebView para visualizações interativas
- **Validações complexas**: Sistema robusto de verificação de estoque e transações

### Desafios Superados
- Sincronização de atualizações entre múltiplas telas
- Performance com múltiplas consultas ao AsyncStorage
- Cálculos precisos de métricas financeiras
- Renderização de gráficos responsivos com dados dinâmicos


---

**Disciplina:** CCP150 - Desenvolvimento de Aplicativos Móveis  
**Instituição:** Centro Universitário FEI  
**Professor:** Rafael Gomes Alves e Isaac Jesus  
**Desenvolvimento:** Projeto acadêmico - 2º Semestre 2025

---

## Licença

Projeto desenvolvido para fins acadêmicos.
