# 模块化单体架构技能

## 概述

提供模块化单体架构的设计原则、依赖管理和最佳实践。

## 架构原则

### 模块划分

```
lcyf-cloud/
├── lcyf-module-base/           # 基础模块（工具类、通用组件）
├── lcyf-module-system/         # 系统模块（用户、权限、配置）
├── lcyf-module-sales/          # 销售模块
├── lcyf-module-finance/        # 财务模块
├── lcyf-module-policy/         # 保单模块
└── lcyf-module-product-factory/ # 产品工厂模块
```

### 模块内部结构

```
lcyf-module-{name}/
├── lcyf-module-{name}-api/     # 对外接口定义
│   └── src/main/java/
│       └── com/lcyf/cloud/{name}/api/
│           ├── dto/            # 数据传输对象
│           ├── cmd/            # 命令对象
│           ├── query/          # 查询对象
│           └── view/           # 视图对象
│
└── lcyf-module-{name}-biz/     # 业务实现
    └── src/main/java/
        └── com/lcyf/cloud/{name}/
            ├── adapter/        # 适配层
            │   ├── web/       # REST控制器
            │   ├── rpc/       # RPC服务
            │   └── mq/        # 消息消费者
            └── biz/           # 业务层
                ├── service/   # 服务接口和实现
                └── infrastructure/
                    ├── entity/ # 数据实体
                    └── mapper/ # 数据访问
```

## 依赖规则

### 依赖方向图

```
                    ┌──────────┐
                    │   base   │ ← 所有模块可依赖
                    └────┬─────┘
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ┌─────────┐    ┌─────────┐    ┌────────────────┐
    │ system  │    │  sales  │    │ product-factory │
    └────┬────┘    └────┬────┘    └────────────────┘
         │               │
         │               ▼
         │          ┌─────────┐
         └─────────►│ policy  │
                    └────┬────┘
                         │
                         ▼
                    ┌─────────┐
                    │ finance │
                    └─────────┘
```

### 依赖规则表

| 模块 | 可依赖 | 禁止依赖 |
|------|--------|----------|
| base | - | 所有业务模块 |
| system | base | 其他业务模块 |
| sales | base, system-api | finance, policy |
| policy | base, system-api, sales-api | finance |
| finance | base, system-api, policy-api | sales |
| product-factory | base | 所有业务模块 |

### POM依赖示例

```xml
<!-- 正确：只依赖api模块 -->
<dependency>
    <groupId>com.lcyf.cloud</groupId>
    <artifactId>lcyf-module-system-api</artifactId>
</dependency>

<!-- 错误：不应依赖biz模块 -->
<!-- <dependency>
    <groupId>com.lcyf.cloud</groupId>
    <artifactId>lcyf-module-system-biz</artifactId>
</dependency> -->
```

## 跨模块通信

### 方式1: Dubbo RPC（推荐）

```java
// 1. 在api模块定义接口
public interface UserApi {
    UserDTO getUserById(Long id);
}

// 2. 在biz模块实现接口
@DubboService
public class UserApiImpl implements UserApi {
    @Override
    public UserDTO getUserById(Long id) {
        return userService.getById(id);
    }
}

// 3. 在其他模块调用
@DubboReference
private UserApi userApi;

public void process() {
    UserDTO user = userApi.getUserById(1L);
}
```

### 方式2: 事件驱动

```java
// 发布事件
@Service
public class OrderService {
    @Resource
    private ApplicationEventPublisher publisher;

    public void create(OrderDTO order) {
        // 创建订单
        orderMapper.insert(order);
        // 发布事件
        publisher.publishEvent(new OrderCreatedEvent(order));
    }
}

// 监听事件
@Component
public class FinanceEventListener {
    @EventListener
    @Async
    public void onOrderCreated(OrderCreatedEvent event) {
        // 处理财务逻辑
    }
}
```

## 模块边界检查

### 检查清单

- [ ] 无循环依赖
- [ ] 依赖方向正确
- [ ] 只依赖api模块
- [ ] 无跨层调用
- [ ] 无直接实例化其他模块的类

### 常见违规

```java
// ❌ 违规: 直接依赖实现类
import com.lcyf.cloud.system.biz.service.impl.UserServiceImpl;

// ❌ 违规: Controller直接调用Mapper
@Resource
private UserMapper userMapper; // 应该通过Service

// ❌ 违规: 依赖biz模块
import com.lcyf.cloud.sales.biz.infrastructure.entity.OrderDO;
```

## 新增模块流程

1. **确定模块职责**
   - 明确业务边界
   - 确定对外接口

2. **创建模块结构**
   ```bash
   lcyf-module-{name}/
   ├── lcyf-module-{name}-api/
   └── lcyf-module-{name}-biz/
   ```

3. **定义依赖关系**
   - 更新依赖图
   - 配置pom.xml

4. **实现业务逻辑**
   - 遵循分层架构
   - 实现对外接口

## 关联Agent

- 04-模块协调专家
- 02-架构专家

## 关联规则

- 11-模块依赖规范

## 关联命令

- `/lcyf-模块检查` - 检查模块依赖
