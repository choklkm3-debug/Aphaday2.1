# Painel Administrativo - Aphaday

## 📋 Visão Geral

O Painel Administrativo é uma interface separada e completa para administradores do sistema Aphaday, permitindo controle total sobre usuários, sistema de avisos, logs e configurações.

## 🚀 Acesso

- **URL**: `http://localhost:8000/admin.html` (após iniciar o servidor)
- **Acesso**: Apenas usuários com privilégios de administrador
- **Login**: Use as mesmas credenciais do Aphaday

### Administrador Padrão
- **Usuário**: `Chok`
- **Senha**: Definida durante a configuração inicial

## 📊 Funcionalidades

### 1. Dashboard
- **Estatísticas em Tempo Real**:
  - Total de usuários cadastrados
  - Usuários ativos nas últimas 24 horas
  - Total de logins realizados
  - Avisos enviados

- **Gráfico de Atividade**: Visualização dos logins dos últimos 7 dias

### 2. Sistema de Avisos 📢
- **Criar Avisos**: Envie notificações para usuários
  - Título e conteúdo personalizado
  - Tipos: Informação, Aviso, Sucesso, Erro
  - Público alvo: Todos, Ativos (24h), Inativos

- **Histórico**: Visualize todos os avisos enviados com data e hora

### 3. Gerenciamento de Usuários 👥
- **Lista Completa**: Todos os usuários cadastrados
  - Nome de usuário, tipo (Admin/Usuário)
  - Data de criação e último login
  - Status atual

- **Busca**: Encontre usuários rapidamente
- **Ações Administrativas**:
  - Banir usuários (exceto outros admins)
  - Visualizar detalhes do perfil

### 4. Logs do Sistema 📋
- **Histórico Completo**: Todos os eventos do sistema
  - Logins bem-sucedidos e tentativas falhadas
  - Ações administrativas
  - Data/hora e detalhes

- **Filtragem**: Por tipo de evento
- **Limpeza**: Remover logs antigos (mais de 7 dias)

### 5. Configurações ⚙️
- **Modo de Manutenção**:
  - Ativar/desativar novos cadastros
  - Mensagem personalizada durante manutenção

- **Backup Automático**:
  - Habilitar/desabilitar
  - Frequência: Diário, Semanal, Mensal

## 🔐 Segurança

- **Acesso Restrito**: Apenas administradores podem acessar
- **Redirecionamento Automático**: Usuários não-admin são redirecionados
- **Logs de Atividade**: Todas as ações são registradas
- **Validação de Sessão**: Verificação contínua de privilégios

## 🎨 Interface

- **Design Responsivo**: Funciona em desktop e mobile
- **Tema Dark**: Consistente com o Aphaday
- **Navegação Intuitiva**: Abas organizadas por funcionalidade
- **Feedback Visual**: Confirmações e alertas para todas as ações

## 📱 Integração Mobile

O painel admin é otimizado para uso em dispositivos móveis, permitindo administração completa em qualquer lugar.

## 🔧 Configuração Técnica

### Dependências
- Chart.js (para gráficos)
- QRCode.js (compatibilidade)
- LocalStorage (persistência de dados)

### Estrutura de Dados
- `users_database`: Base de usuários
- `login_logs`: Histórico de logins
- `admin_notifications`: Avisos enviados
- `admin_settings`: Configurações do sistema
- `user_bans`: Lista de usuários banidos

## 🚨 Avisos Importantes

1. **Backup**: Sempre faça backup antes de ações administrativas
2. **Privacidade**: Respeite a privacidade dos usuários
3. **Responsabilidade**: Use os poderes administrativos com responsabilidade
4. **Logs**: Monitore regularmente os logs para segurança

## 📞 Suporte

Para questões técnicas ou dúvidas sobre o painel administrativo, consulte a documentação do Aphaday ou entre em contato com o desenvolvedor.

---

**Versão**: 1.0.0
**Última Atualização**: Março 2026</content>
<parameter name="filePath">c:\Users\santo\OneDrive\Documentos\Aphaday 2.0\ADMIN_README.md