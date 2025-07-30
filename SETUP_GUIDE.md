# 智能助手系统设置指南

## 🚀 快速开始

这是一个完整的用户管理和权限控制系统，基于 Next.js + Prisma + PostgreSQL 构建。

### 📋 系统特性

- **🔐 完整的认证与授权系统**
  - JWT Token 认证
  - 基于角色的权限控制（RBAC）
  - 菜单权限和 API 权限管理
  - 四种用户角色：超级管理员、管理员、普通用户、VIP用户

- **👥 用户管理系统**
  - 用户注册/登录
  - 用户信息管理
  - 推荐系统（邀请码）
  - 积分/余额管理

- **💰 充值系统**
  - 阶梯制充值套餐
  - 支持折扣和有效期
  - VIP用户计费乘数
  - 充值记录和消费记录

- **🎯 推荐系统**
  - 用户推荐奖励
  - 推荐等级计算
  - 可配置的奖励比例和等级公式

- **🛠 管理后台**
  - 用户 CRUD 操作
  - 系统监控和统计
  - 系统配置管理
  - 审计日志

## 🛠 安装和配置

### 1. 环境要求

- Node.js 16+
- PostgreSQL 12+
- pnpm 或 npm

### 2. 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install
```

### 3. 环境配置

1. 复制环境变量文件：
```bash
cp .env.example .env.local
```

2. 编辑 `.env.local` 文件，配置以下变量：

```env
# 数据库配置
DATABASE_URL="postgresql://username:password@localhost:5432/webapp_conversation?schema=public"

# JWT 配置
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# 现有的应用配置
APP_ID="your-app-id"
API_KEY="your-api-key"
```

### 4. 数据库设置

```bash
# 生成 Prisma 客户端
pnpm db:generate

# 推送数据库架构
pnpm db:push

# 或者使用迁移 (推荐)
pnpm db:migrate

# 初始化种子数据
pnpm db:seed
```

### 5. 启动应用

```bash
# 开发模式
pnpm dev

# 生产模式
pnpm build
pnpm start
```

## 🔑 默认账户

系统会自动创建一个默认的超级管理员账户：

- **邮箱**: `admin@example.com`
- **密码**: `admin123456`

**⚠️ 重要：首次部署后请立即修改默认密码！**

## 📚 系统架构

### 数据库模型

主要数据表：
- `users` - 用户表
- `roles` - 角色表
- `user_roles` - 用户角色关联表
- `menus` - 菜单表
- `role_menus` - 角色菜单关联表
- `api_permissions` - API权限表
- `role_apis` - 角色API关联表
- `recharge_packages` - 充值套餐表
- `recharge_records` - 充值记录表
- `consumption_logs` - 消费记录表
- `referral_rewards` - 推荐奖励表
- `system_configs` - 系统配置表
- `announcements` - 系统公告表
- `system_logs` - 系统日志表

### 权限系统

#### 角色类型
1. **超级管理员** (`super_admin`) - 系统最高权限
2. **管理员** (`admin`) - 用户管理、充值操作
3. **普通用户** (`user`) - 基础聊天功能
4. **VIP用户** (`vip`) - 计费乘数可单独设置

#### 权限控制粒度
- **页面级别** - 整个页面访问权限
- **功能级别** - 页面内的按钮、操作权限
- **API级别** - 接口调用权限

### API 路由

#### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/refresh` - 刷新 Token

#### 用户管理
- `GET /api/users` - 获取用户列表
- `POST /api/users` - 创建用户
- `GET /api/users/:id` - 获取用户详情
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户
- `POST /api/users/:id/recharge` - 给用户充值

#### 充值系统
- `GET /api/recharge/packages` - 获取充值套餐
- `POST /api/recharge/packages` - 创建充值套餐
- `GET /api/recharge/records` - 获取充值记录
- `POST /api/recharge/records` - 创建充值订单

#### 推荐系统
- `GET /api/referral/stats` - 获取推荐统计
- `PUT /api/referral/config` - 更新推荐配置

#### 管理后台
- `GET /api/admin/dashboard` - 仪表板数据
- `GET /api/admin/system/config` - 系统配置
- `PUT /api/admin/system/config` - 更新系统配置
- `GET /api/admin/system/logs` - 系统日志
- `GET /api/admin/announcements` - 公告管理

## 🎯 主要功能

### 1. 用户推荐系统

- **邀请码生成**：用户注册后自动生成唯一邀请码
- **推荐奖励**：按充值金额的一定比例给予积分奖励
- **推荐等级**：基于推荐人数和充值总额计算等级

默认配置：
```
推荐奖励比例：10%
等级计算公式：(推荐人数 * 10 + 充值总额 / 100) / 50
```

### 2. VIP 计费系统

VIP用户可享受特殊的计费乘数：
- 普通用户：1.0
- VIP用户：可设置 0.9、0.85 等

### 3. 积分消费记录

系统记录所有积分消费：
- 聊天消费
- 文件上传
- API调用
- 其他消费

### 4. 系统监控

管理后台提供完整的系统监控：
- 用户增长统计
- 收入分析
- 消费统计
- 活跃用户排行
- 最近活动记录

## 🔧 开发指南

### 添加新的权限

1. 在 `lib/permissions.ts` 中定义新权限常量
2. 更新 `DEFAULT_ROLE_PERMISSIONS` 映射
3. 在数据库中创建对应的菜单或API权限
4. 运行 `pnpm db:seed` 重新初始化权限

### 添加新的用户角色

1. 在 `ROLES` 常量中添加新角色
2. 在 `DEFAULT_ROLE_PERMISSIONS` 中定义角色权限
3. 更新种子数据脚本
4. 重新运行数据库初始化

### 自定义推荐等级公式

在系统配置中修改 `referral_level_formula` 配置项：

```javascript
// 示例公式
"Math.floor((referralCount * 权重1 + totalRecharge * 权重2) / 基数)"
```

### 扩展充值套餐

在 `prisma/seed.ts` 中添加新的充值套餐配置，或通过管理后台界面添加。

## 🚀 部署指南

### 1. 生产环境配置

```env
NODE_ENV=production
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
NEXTAUTH_URL="https://yourdomain.com"
```

### 2. 数据库迁移

```bash
# 生产环境迁移
pnpm db:migrate
pnpm db:seed
```

### 3. 构建和启动

```bash
pnpm build
pnpm start
```

## 📊 系统配置

系统提供以下可配置项：

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `referral_reward_rate` | 推荐奖励比例 | 0.1 (10%) |
| `referral_level_formula` | 推荐等级计算公式 | 见文档 |
| `chat_credits_cost` | 每次对话消耗积分 | 1 |
| `vip_default_multiplier` | VIP默认计费乘数 | 0.9 |

## 🛡 安全注意事项

1. **JWT 密钥**：使用强随机字符串作为 JWT_SECRET
2. **数据库安全**：确保数据库访问权限正确配置
3. **HTTPS**：生产环境必须使用 HTTPS
4. **输入验证**：所有用户输入都经过验证和清理
5. **权限检查**：每个API调用都有相应的权限验证

## 🔍 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 `DATABASE_URL` 配置
   - 确认数据库服务已启动
   - 验证数据库用户权限

2. **JWT Token 验证失败**
   - 检查 `JWT_SECRET` 配置
   - 确认客户端正确发送 Token

3. **权限验证失败**
   - 检查用户角色分配
   - 验证菜单和API权限配置

### 日志查看

系统提供详细的审计日志：
- 在管理后台查看系统日志
- 检查 API 调用记录
- 监控用户操作历史

## 📞 技术支持

如需技术支持或有疑问，请：
1. 查看本文档的相关章节
2. 检查系统日志以了解错误详情
3. 确认配置文件是否正确

---

🎉 恭喜！你的智能助手系统已经配置完成。现在可以开始使用完整的用户管理和权限控制功能了！