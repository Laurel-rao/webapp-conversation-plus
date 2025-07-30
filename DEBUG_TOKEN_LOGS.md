# Token验证日志说明

## 📋 已添加的日志

我已经在token验证相关的关键位置添加了详细的日志输出，现在当您访问 `/api/auth/me` 时，控制台会显示以下日志信息：

### 🔧 启动时的配置日志
```
🔧 [JWT配置] JWT_SECRET来源: 环境变量/默认值
🔧 [JWT配置] JWT_SECRET长度: XX
🔧 [JWT配置] JWT_EXPIRES_IN: 7d
```

### 🌐 主中间件日志
```
🌐 [主中间件] API路由处理: /api/auth/me
🌐 [主中间件] 是否为公开API: false
🌐 [主中间件] 非公开API，开始认证检查
```

### 🛡️ 认证中间件日志
```
🛡️ [认证中间件] 开始认证检查, 路径: /api/auth/me
```

### 🍪 Token获取日志
```
🍪 [Token获取] 开始从请求中获取token
🍪 [Token获取] Authorization header: null/Bearer xxx...
🍪 [Token获取] Cookie中的token: eyJhbGci...
🍪 [Token获取] 从Cookie获取到token (前30字符): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 🔐 JWT验证日志
```
🔐 [JWT验证] 开始验证token
🔐 [JWT验证] Token (前50字符): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQi...
🔐 [JWT验证] 使用的JWT_SECRET: your-secret-key
🔐 [JWT验证] Token解码成功: {
  header: { alg: 'HS256', typ: 'JWT' },
  payload: { userId: '...', email: '...', roles: [...] }
}
🔐 [JWT验证] Token验证失败: {
  error: 'invalid signature',
  name: 'JsonWebTokenError',
  token_start: 'eyJhbGciOiJIUzI1NiIs...',
  jwt_secret_length: 14,
  jwt_secret: 'your-secret-key'
}
```

### 👤 用户查询日志
```
👤 [用户查询] 开始查询用户信息, ID: cmdpqaxv3001qbopk5malokyt
👤 [用户查询] 用户不存在或状态不是ACTIVE, ID: cmdpqaxv3001qbopk5malokyt
```

## 🔍 日志分析步骤

1. **重启开发服务器**
   ```bash
   npm run dev
   # 或
   pnpm dev
   ```

2. **查看启动日志**
   - 确认JWT_SECRET的来源和长度

3. **访问API端点**
   ```
   GET http://localhost:3000/api/auth/me
   ```

4. **分析控制台输出**
   - 查看token获取是否成功
   - 查看JWT验证失败的具体原因
   - 查看用户查询的结果

## 🎯 预期的问题诊断

基于之前的分析，您应该会看到：

1. **JWT_SECRET来源**: 默认值
2. **Token解码**: 成功
3. **Token验证**: 失败，错误为 "invalid signature"
4. **根本原因**: 当前使用的JWT_SECRET与生成token时的密钥不匹配

## 🔧 解决方案

看到日志后，您可以：

1. **立即解决**: 清除token并重新登录
2. **配置环境**: 设置正确的JWT_SECRET环境变量
3. **生产部署**: 使用强随机密钥

## 📝 清理日志

如果您希望移除这些调试日志，请告诉我，我可以将它们删除或改为仅在开发环境下输出。