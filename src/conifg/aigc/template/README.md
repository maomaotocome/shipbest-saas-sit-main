# Template Credit Calculation System

这个系统为AI模板提供了一个可扩展的积分计算框架，仿照ModelCategory的使用方式，使用TemplateType枚举进行统一管理。

## 架构概述

```
src/conifg/aigc/template/
├── index.ts                 # 主入口文件，统一管理所有模板
├── stylized/               # 风格化模板
│   └── anime/
│       ├── index.ts        # 动漫风格模板实现
│       └── system.ts       # 系统级配置
└── image/                  # 图像处理模板
    └── combine/
        └── index.ts        # 图像合成模板实现
```

## 设计理念

### 仿照ModelCategory的架构

模板系统完全仿照模型直调系统的架构设计：

**模型直调系统**:
- 使用 `ModelCategory` 枚举 (TextToImage, ImageToImage, etc.)
- 通过 `calculateModelCredits(modelCategory, modelCode, request)` 计算积分
- 在 `calculateTaskCredits` 中通过 `metadata.model_category` 获取类别

**模板系统**:
- 使用 `TemplateType` 枚举 (StylizedAnimeImage, CombineImages, etc.)
- 通过 `calculateTemplateCredits(templateType, request, systemRequest)` 计算积分
- 在 `calculateTaskCredits` 中通过 `metadata.template_type` 获取类型

## TemplateType 枚举

在 `src/lib/constants.ts` 中定义：

```typescript
export enum TemplateType {
  StylizedAnimeImage = "stylized-anime-image",
  StylizedAnimeVideo = "stylized-anime-video", 
  CombineImages = "combine-images",
}
```

## 如何添加新模板

### 1. 更新TemplateType枚举

首先在 `src/lib/constants.ts` 中添加新的模板类型：

```typescript
export enum TemplateType {
  // ... existing types
  YourNewTemplate = "your-new-template",
}
```

### 2. 创建模板实现文件

在适当的目录下创建新的模板文件，例如 `src/conifg/aigc/template/category/template-name/index.ts`：

```typescript
import { defaultLocale, Locale } from "@/i18n/locales";
import { JsonObject } from "@/types/json";
import { BaseModel, ModelParameterConfig } from "../../../types";

export type YourTemplate = BaseModel;

// 积分计算函数
export function calculateCredits(request: JsonObject, systemRequest?: JsonObject): number {
  // 根据请求参数计算积分
  // 可以使用 systemRequest 进行更复杂的计算
  return baseCredits;
}

// 数量计算函数
export function calculateQuantity(request: JsonObject, systemRequest?: JsonObject): number {
  // 根据请求参数计算数量
  return 1;
}

// 获取模板配置函数
export function getYourTemplate(locale = defaultLocale as Locale): YourTemplate {
  return {
    // 模板配置...
    code: "your-template-code", // 与TemplateType的值对应
    // ... other config
  };
}
```

### 3. 更新主入口文件

在 `src/conifg/aigc/template/index.ts` 中：

1. 添加导入：
```typescript
import {
  calculateCredits as calculateYourTemplateCredits,
  calculateQuantity as calculateYourTemplateQuantity,
  getYourTemplate,
  type YourTemplate,
} from "./category/template-name";
```

2. 更新类型联合：
```typescript
export type Template = AnimeStyleTemplate | ImageCombineTemplate | YourTemplate;
```

3. 在所有switch语句中添加新的case：
```typescript
case TemplateType.YourNewTemplate:
  return calculateYourTemplateCredits(request, systemRequest);
```

### 4. 自动集成

模板积分计算会自动通过 `src/services/tasks/credit/calculate.ts` 中的系统处理，无需额外配置。

## 积分计算流程

### 调用链路

1. `calculateTaskCredits` 获取 `metadata.template_type` 作为 `TemplateType`
2. 调用 `calculateTemplateCredits(templateType, request, systemRequest)`
3. 根据 `TemplateType` 路由到具体的模板积分计算函数

### 参数说明

- `templateType: TemplateType`: 模板类型枚举
- `request: JsonObject`: 用户请求参数
- `systemRequest?: JsonObject`: 系统级参数（可选）

### 计算策略

1. **基础积分**: 每个模板都有基础积分成本
2. **参数影响**: 根据用户输入的参数调整积分
3. **系统参数**: 可以使用systemRequest进行更复杂的计算逻辑

### 示例

```typescript
export function calculateCredits(request: JsonObject, systemRequest?: JsonObject): number {
  const baseCredits = 10;
  
  // 根据图片数量调整
  const imageCount = (request.images as string[])?.length || 1;
  const imageMultiplier = Math.max(1, imageCount * 0.5);
  
  // 根据复杂度调整（来自systemRequest）
  const complexityMultiplier = systemRequest?.complexity_multiplier || 1;
  
  return Math.ceil(baseCredits * imageMultiplier * complexityMultiplier);
}
```

## 与模型直调系统的对比

| 特性 | 模型直调 | 模板系统 |
|------|----------|----------|
| 枚举 | `ModelCategory` | `TemplateType` |
| 结构 | `/model-direct-invocation/category/` | `/template/category/` |
| 入口函数 | `calculateModelCredits` | `calculateTemplateCredits` |
| 参数获取 | `metadata.model_category` | `metadata.template_type` |
| 积分计算 | 基于模型和参数 | 基于模板类型和参数 |
| 扩展方式 | 添加ModelCategory + 实现 | 添加TemplateType + 实现 |

## 最佳实践

1. **枚举优先**: 始终使用TemplateType枚举，避免字符串硬编码
2. **类型安全**: 使用TypeScript类型确保类型安全
3. **国际化**: 支持多语言标签和描述
4. **一致性**: 保持与ModelCategory系统的一致性
5. **错误处理**: 提供清晰的错误信息
6. **文档**: 为每个模板提供清晰的文档 