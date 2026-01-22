# API 接口文档

## 基础信息

- **Base URL**: `http://localhost:3001` (根据部署环境调整)
- **Content-Type**: `multipart/form-data` (文件上传), `application/json` (其他接口)
- **字符编码**: UTF-8

## 接口列表

### 文件管理
1. [单文件上传](#1-单文件上传) - `POST /upload`
2. [多文件上传](#2-多文件上传) - `POST /upload-multiple`
3. [获取文件列表](#3-获取文件列表) - `GET /files`
4. [文件下载](#4-文件下载) - `GET /download/:filename`
5. [删除文件](#5-删除文件) - `DELETE /delete/:filename`

### 反馈数据管理
6. [提交反馈数据](#6-提交反馈数据) - `POST /feedback`
7. [获取反馈数据文件列表](#7-获取反馈数据文件列表) - `GET /feedback/list`
8. [下载反馈数据Excel文件](#8-下载反馈数据excel文件) - `GET /feedback/download/:filename`
9. [查看特定日期的反馈数据](#9-查看特定日期的反馈数据) - `GET /feedback/view/:date`

### 模板管理
10. [保存/更新模板](#10-保存更新模板) - `POST /template`
11. [获取模板列表](#11-获取模板列表) - `GET /template/list`
12. [根据ID获取模板数据](#12-根据id获取模板数据) - `GET /template/:id`
13. [修改模板名称](#13-修改模板名称) - `PATCH /template/:id/name`
14. [删除模板](#14-删除模板) - `DELETE /template/:id`

### 系统管理
16. [健康检查](#16-健康检查) - `GET /health`

### 1. 单文件上传

**接口地址**: `POST /upload`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | File | 是 | 要上传的文件 |

**请求示例**:
```bash
curl -X POST \
  http://localhost:3001/upload \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/your/file.txt'
```

**JavaScript 示例**:
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:3001/upload', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

**Python 示例**:
```python
import requests

url = 'http://localhost:3001/upload'
files = {'file': open('example.txt', 'rb')}
response = requests.post(url, files=files)
print(response.json())
```

**成功响应**:
```json
{
  "message": "文件上传成功",
  "filename": "example_1640995200000.txt",
  "originalname": "example.txt",
  "size": 1024,
  "path": "uploads/example_1640995200000.txt"
}
```

**错误响应**:
```json
{
  "error": "没有选择文件"
}
```

### 2. 多文件上传

**接口地址**: `POST /upload-multiple`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| files | File[] | 是 | 要上传的文件数组（最多5个） |

**请求示例**:
```bash
curl -X POST \
  http://localhost:3001/upload-multiple \
  -H 'Content-Type: multipart/form-data' \
  -F 'files=@/path/to/file1.txt' \
  -F 'files=@/path/to/file2.txt'
```

**JavaScript 示例**:
```javascript
const formData = new FormData();
for (let i = 0; i < fileInput.files.length; i++) {
  formData.append('files', fileInput.files[i]);
}

fetch('http://localhost:3001/upload-multiple', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

**Python 示例**:
```python
import requests

url = 'http://localhost:3001/upload-multiple'
files = [
    ('files', open('file1.txt', 'rb')),
    ('files', open('file2.txt', 'rb'))
]
response = requests.post(url, files=files)
print(response.json())
```

**成功响应**:
```json
{
  "message": "成功上传 2 个文件",
  "files": [
    {
      "filename": "file1_1640995200000.txt",
      "originalname": "file1.txt",
      "size": 1024,
      "path": "uploads/file1_1640995200000.txt"
    },
    {
      "filename": "file2_1640995200001.txt",
      "originalname": "file2.txt",
      "size": 2048,
      "path": "uploads/file2_1640995200001.txt"
    }
  ]
}
```

### 3. 获取文件列表

**接口地址**: `GET /files`

**请求参数**: 无

**请求示例**:
```bash
curl -X GET http://localhost:3001/files
```

**JavaScript 示例**:
```javascript
fetch('http://localhost:3001/files')
  .then(response => response.json())
  .then(data => console.log(data));
```

**Python 示例**:
```python
import requests

url = 'http://localhost:3001/files'
response = requests.get(url)
print(response.json())
```

**成功响应**:
```json
{
  "files": [
    {
      "filename": "example_1640995200000.txt",
      "size": 1024,
      "uploadTime": "2021-12-31T16:00:00.000Z",
      "downloadUrl": "/download/example_1640995200000.txt"
    }
  ]
}
```

### 4. 文件下载

**接口地址**: `GET /download/:filename`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| filename | String | 是 | 文件名（路径参数） |

**请求示例**:
```bash
curl -X GET \
  http://localhost:3001/download/example_1640995200000.txt \
  -o downloaded_file.txt
```

**JavaScript 示例**:
```javascript
// 直接下载
window.open('http://localhost:3001/download/example_1640995200000.txt');

// 或使用 fetch 获取文件内容
fetch('http://localhost:3001/download/example_1640995200000.txt')
  .then(response => response.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'example.txt';
    a.click();
  });
```

**Python 示例**:
```python
import requests

url = 'http://localhost:3001/download/example_1640995200000.txt'
response = requests.get(url)

with open('downloaded_file.txt', 'wb') as f:
    f.write(response.content)
```

**成功响应**: 返回文件二进制内容

**错误响应**:
```json
{
  "error": "文件不存在"
}
```

### 5. 删除文件

**接口地址**: `DELETE /delete/:filename`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| filename | String | 是 | 文件名（路径参数） |

**请求示例**:
```bash
curl -X DELETE http://localhost:3001/delete/example_1640995200000.txt
```

**JavaScript 示例**:
```javascript
fetch('http://localhost:3001/delete/example_1640995200000.txt', {
  method: 'DELETE'
})
.then(response => response.json())
.then(data => console.log(data));
```

**Python 示例**:
```python
import requests

url = 'http://localhost:3001/delete/example_1640995200000.txt'
response = requests.delete(url)
print(response.json())
```

**成功响应**:
```json
{
  "message": "文件删除成功"
}
```

**错误响应**:
```json
{
  "error": "文件不存在"
}
```

### 6. 提交反馈数据

**接口地址**: `POST /feedback`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| title | String | 是 | 反馈标题 |
| description | String | 是 | 反馈描述 |

**请求示例**:
```bash
curl -X POST \
  http://localhost:3001/feedback \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "系统建议",
    "description": "希望能增加批量上传功能"
  }'
```

**JavaScript 示例**:
```javascript
const feedbackData = {
  title: "系统建议",
  description: "希望能增加批量上传功能"
};

fetch('http://localhost:3001/feedback', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(feedbackData)
})
.then(response => response.json())
.then(data => console.log(data));
```

**Python 示例**:
```python
import requests
import json

url = 'http://localhost:3001/feedback'
data = {
    'title': '系统建议',
    'description': '希望能增加批量上传功能'
}

response = requests.post(url, json=data)
print(response.json())
```

**成功响应**:
```json
{
  "message": "反馈提交成功",
  "data": {
    "title": "系统建议",
    "description": "希望能增加批量上传功能",
    "submitTime": "2026-01-06 15:30:45",
    "excelFile": "feedback_20260106.xlsx",
    "recordCount": 3
  }
}
```

**错误响应**:
```json
{
  "error": "标题和描述不能为空"
}
```

### 7. 获取反馈数据文件列表

**接口地址**: `GET /feedback/list`

**请求参数**: 无

**请求示例**:
```bash
curl -X GET http://localhost:3001/feedback/list
```

**JavaScript 示例**:
```javascript
fetch('http://localhost:3001/feedback/list')
  .then(response => response.json())
  .then(data => console.log(data));
```

**成功响应**:
```json
{
  "files": [
    {
      "filename": "feedback_20260106.xlsx",
      "date": "2026-01-06",
      "dateStr": "20260106",
      "recordCount": 3,
      "size": 8192,
      "createTime": "2026-01-06T07:30:45.000Z",
      "downloadUrl": "/feedback/download/feedback_20260106.xlsx"
    }
  ]
}
```

### 8. 下载反馈数据Excel文件

**接口地址**: `GET /feedback/download/:filename`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| filename | String | 是 | Excel文件名（格式：feedback_YYYYMMDD.xlsx） |

**请求示例**:
```bash
curl -X GET \
  http://localhost:3001/feedback/download/feedback_20260106.xlsx \
  -o feedback_20260106.xlsx
```

**JavaScript 示例**:
```javascript
// 直接下载
window.open('http://localhost:3001/feedback/download/feedback_20260106.xlsx');

// 或使用 fetch 获取文件内容
fetch('http://localhost:3001/feedback/download/feedback_20260106.xlsx')
  .then(response => response.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feedback_20260106.xlsx';
    a.click();
  });
```

**成功响应**: 返回Excel文件二进制内容

### 9. 查看特定日期的反馈数据

**接口地址**: `GET /feedback/view/:date`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| date | String | 是 | 日期（格式：YYYYMMDD） |

**请求示例**:
```bash
curl -X GET http://localhost:3001/feedback/view/20260106
```

**JavaScript 示例**:
```javascript
fetch('http://localhost:3001/feedback/view/20260106')
  .then(response => response.json())
  .then(data => console.log(data));
```

**成功响应**:
```json
{
  "date": "2026-01-06",
  "data": [
    {
      "序号": 1,
      "标题": "系统建议",
      "描述": "希望能增加批量上传功能",
      "提交时间": "2026-01-06 15:30:45",
      "时间戳": "2026-01-06T07:30:45.000Z"
    }
  ],
  "recordCount": 1
}
```

### 10. 保存/更新模板

**接口地址**: `POST /template`

**功能说明**: 统一的模板保存和更新接口。根据本地是否存在对应 ID 的模板文件来决定是新增还是更新模板。

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| templateData | Object/String | 是 | 模板数据（JSON格式，大小限制1MB）。**必须包含 `id` 字段** |
| templateName | String | 否 | 模板名称（可选，不填则自动生成或保持原名称） |

**新增模板示例**:
```bash
curl -X POST \
  http://localhost:3001/template \
  -H 'Content-Type: application/json' \
  -d '{
    "templateName": "用户配置模板",
    "templateData": {
      "id": "my-template-001",
      "name": "示例模板",
      "version": "1.0.0",
      "config": {
        "theme": "default",
        "layout": "grid"
      }
    }
  }'
```

**更新模板示例**:
```bash
curl -X POST \
  http://localhost:3001/template \
  -H 'Content-Type: application/json' \
  -d '{
    "templateName": "更新的配置模板",
    "templateData": {
      "id": "my-template-001",
      "name": "更新的模板",
      "version": "2.0.0",
      "config": {
        "theme": "dark",
        "layout": "list"
      }
    }
  }'
```

**JavaScript 示例**:
```javascript
// 新增模板（本地不存在 my-template-001.json 文件）
const newTemplateData = {
  id: "my-template-001", // 必须包含 id
  name: "示例模板",
  version: "1.0.0",
  config: {
    theme: "default",
    layout: "grid"
  }
};

fetch('http://localhost:3001/template', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    templateName: "用户配置模板",
    templateData: newTemplateData
  })
})
.then(response => response.json())
.then(data => console.log(data));

// 更新模板（本地存在 my-template-001.json 文件）
const updateTemplateData = {
  id: "my-template-001", // 相同的 id
  name: "更新的模板",
  version: "2.0.0",
  config: {
    theme: "dark",
    layout: "list"
  }
};

fetch('http://localhost:3001/template', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    templateName: "更新的配置模板",
    templateData: updateTemplateData
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

**新增模板成功响应**:
```json
{
  "message": "模板保存成功",
  "template": {
    "id": "my-template-001",
    "name": "用户配置模板",
    "createTime": "2026-01-06T08:00:00.000Z",
    "updateTime": "2026-01-06T08:00:00.000Z",
    "size": 256
  },
  "action": "create"
}
```

**更新模板成功响应**:
```json
{
  "message": "模板更新成功",
  "template": {
    "id": "my-template-001",
    "name": "更新的配置模板",
    "createTime": "2026-01-06T08:00:00.000Z",
    "updateTime": "2026-01-06T09:00:00.000Z",
    "size": 280
  },
  "action": "update"
}
```

**错误响应**:
```json
{
  "error": "模板数据必须包含id字段"
}
```

### 11. 获取模板列表

**接口地址**: `GET /template/list`

**请求参数**: 无

**请求示例**:
```bash
curl -X GET http://localhost:3001/template/list
```

**成功响应**:
```json
{
  "templates": [
    {
      "id": "1641024000000abc123def",
      "name": "用户配置模板",
      "createTime": "2026-01-06T08:00:00.000Z",
      "updateTime": "2026-01-06T08:00:00.000Z",
      "size": 256
    }
  ]
}
```

### 12. 根据ID获取模板数据

**接口地址**: `GET /template/:id`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | String | 是 | 模板ID（路径参数） |

**请求示例**:
```bash
curl -X GET http://localhost:3001/template/1641024000000abc123def
```

**成功响应**:
```json
{
  "id": "1641024000000abc123def",
  "name": "用户配置模板",
  "data": {
    "name": "示例模板",
    "version": "1.0.0",
    "config": {
      "theme": "default",
      "layout": "grid"
    }
  },
  "createTime": "2026-01-06T08:00:00.000Z",
  "updateTime": "2026-01-06T08:00:00.000Z",
  "size": 256
}
```

### 13. 修改模板名称

**接口地址**: `PATCH /template/:id/name`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | String | 是 | 模板ID（路径参数） |
| name | String | 是 | 新的模板名称 |

**请求示例**:
```bash
curl -X PATCH \
  http://localhost:3001/template/1641024000000abc123def/name \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "新的模板名称"
  }'
```

**成功响应**:
```json
{
  "message": "模板名称更新成功",
  "template": {
    "id": "1641024000000abc123def",
    "name": "新的模板名称",
    "updateTime": "2026-01-06T09:30:00.000Z"
  }
}
```

### 14. 删除模板

**接口地址**: `DELETE /template/:id`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | String | 是 | 模板ID（路径参数） |

**请求示例**:
```bash
curl -X DELETE http://localhost:3001/template/1641024000000abc123def
```

**成功响应**:
```json
{
  "message": "模板删除成功"
}
```

### 15. 健康检查

**接口地址**: `GET /health`

**请求参数**: 无

**请求示例**:
```bash
curl -X GET http://localhost:3001/health
```

**成功响应**:
```json
{
  "status": "ok",
  "timestamp": "2021-12-31T16:00:00.000Z",
  "uptime": 3600
}
```

## 错误码说明

| HTTP状态码 | 说明 |
|------------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 文件限制

- **单文件大小限制**: 10MB
- **多文件上传数量限制**: 最多5个文件
- **支持的文件类型**: 所有类型（可根据需要配置限制）
- **文件名规则**: 原文件名 + 时间戳 + 扩展名

## 跨域配置

服务已启用 CORS，支持跨域请求。如需限制特定域名，可修改服务器配置：

```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-domain.com']
}));
```

## SDK 示例

### Node.js SDK

```javascript
class FileUploadClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  // 文件上传相关方法
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData
    });
    
    return response.json();
  }

  async uploadMultipleFiles(files) {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const response = await fetch(`${this.baseUrl}/upload-multiple`, {
      method: 'POST',
      body: formData
    });
    
    return response.json();
  }

  async getFileList() {
    const response = await fetch(`${this.baseUrl}/files`);
    return response.json();
  }

  async downloadFile(filename) {
    const response = await fetch(`${this.baseUrl}/download/${filename}`);
    return response.blob();
  }

  async deleteFile(filename) {
    const response = await fetch(`${this.baseUrl}/delete/${filename}`, {
      method: 'DELETE'
    });
    return response.json();
  }

  // 反馈数据相关方法
  async submitFeedback(title, description) {
    const response = await fetch(`${this.baseUrl}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, description })
    });
    
    return response.json();
  }

  async getFeedbackList() {
    const response = await fetch(`${this.baseUrl}/feedback/list`);
    return response.json();
  }

  async downloadFeedbackExcel(filename) {
    const response = await fetch(`${this.baseUrl}/feedback/download/${filename}`);
    return response.blob();
  }

  async viewFeedbackData(date) {
    const response = await fetch(`${this.baseUrl}/feedback/view/${date}`);
    return response.json();
  }

  // 模板管理相关方法
  async saveOrUpdateTemplate(templateData, templateName) {
    const response = await fetch(`${this.baseUrl}/template`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        templateData, 
        templateName 
      })
    });
    
    return response.json();
  }

  async getTemplateList() {
    const response = await fetch(`${this.baseUrl}/template/list`);
    return response.json();
  }

  async getTemplate(id) {
    const response = await fetch(`${this.baseUrl}/template/${id}`);
    return response.json();
  }

  async updateTemplate(id, templateData) {
    // 注意：现在使用统一的 POST /template 接口
    // templateData 必须包含 id 字段，接口会根据本地文件是否存在来判断新增还是更新
    const dataWithId = { ...templateData, id };
    
    const response = await fetch(`${this.baseUrl}/template`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ templateData: dataWithId })
    });
    
    return response.json();
  }

  async renameTemplate(id, name) {
    const response = await fetch(`${this.baseUrl}/template/${id}/name`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    });
    
    return response.json();
  }

  async deleteTemplate(id) {
    const response = await fetch(`${this.baseUrl}/template/${id}`, {
      method: 'DELETE'
    });
    
    return response.json();
  }
}

// 使用示例
const client = new FileUploadClient('http://localhost:3001');

// 提交反馈
await client.submitFeedback('系统建议', '希望增加批量上传功能');

// 获取反馈列表
const feedbackList = await client.getFeedbackList();

// 保存新模板（本地不存在对应ID的文件）
const templateData = { id: "my-template-001", name: "示例", config: { theme: "default" } };
await client.saveOrUpdateTemplate(templateData, "我的模板");

// 更新现有模板（本地存在对应ID的文件）
const existingTemplateData = { id: "my-template-001", name: "更新的示例", config: { theme: "dark" } };
await client.saveOrUpdateTemplate(existingTemplateData, "更新的模板名称");

// 获取模板列表
const templateList = await client.getTemplateList();
```

### Python SDK

```python
import requests
from typing import List, Dict, Any

class FileUploadClient:
    def __init__(self, base_url: str):
        self.base_url = base_url

    # 文件上传相关方法
    def upload_file(self, file_path: str) -> Dict[str, Any]:
        """上传单个文件"""
        with open(file_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(f'{self.base_url}/upload', files=files)
            return response.json()

    def upload_multiple_files(self, file_paths: List[str]) -> Dict[str, Any]:
        """上传多个文件"""
        files = [('files', open(path, 'rb')) for path in file_paths]
        try:
            response = requests.post(f'{self.base_url}/upload-multiple', files=files)
            return response.json()
        finally:
            for _, f in files:
                f.close()

    def get_file_list(self) -> Dict[str, Any]:
        """获取文件列表"""
        response = requests.get(f'{self.base_url}/files')
        return response.json()

    def download_file(self, filename: str, save_path: str) -> bool:
        """下载文件"""
        response = requests.get(f'{self.base_url}/download/{filename}')
        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                f.write(response.content)
            return True
        return False

    def delete_file(self, filename: str) -> Dict[str, Any]:
        """删除文件"""
        response = requests.delete(f'{self.base_url}/delete/{filename}')
        return response.json()

    # 反馈数据相关方法
    def submit_feedback(self, title: str, description: str) -> Dict[str, Any]:
        """提交反馈数据"""
        data = {'title': title, 'description': description}
        response = requests.post(f'{self.base_url}/feedback', json=data)
        return response.json()

    def get_feedback_list(self) -> Dict[str, Any]:
        """获取反馈数据文件列表"""
        response = requests.get(f'{self.base_url}/feedback/list')
        return response.json()

    def download_feedback_excel(self, filename: str, save_path: str) -> bool:
        """下载反馈数据Excel文件"""
        response = requests.get(f'{self.base_url}/feedback/download/{filename}')
        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                f.write(response.content)
            return True
        return False

    def view_feedback_data(self, date: str) -> Dict[str, Any]:
        """查看特定日期的反馈数据"""
        response = requests.get(f'{self.base_url}/feedback/view/{date}')
        return response.json()

    # 模板管理相关方法
    def save_or_update_template(self, template_data: Dict[str, Any], template_name: str = None) -> Dict[str, Any]:
        """保存或更新模板"""
        data = {'templateData': template_data}
        if template_name:
            data['templateName'] = template_name
        response = requests.post(f'{self.base_url}/template', json=data)
        return response.json()

    def get_template_list(self) -> Dict[str, Any]:
        """获取模板列表"""
        response = requests.get(f'{self.base_url}/template/list')
        return response.json()

    def get_template(self, template_id: str) -> Dict[str, Any]:
        """根据ID获取模板数据"""
        response = requests.get(f'{self.base_url}/template/{template_id}')
        return response.json()

    def update_template(self, template_id: str, template_data: Dict[str, Any]) -> Dict[str, Any]:
        """更新模板数据"""
        # 注意：现在使用统一的 POST /template 接口
        # templateData 必须包含 id 字段，接口会根据本地文件是否存在来判断新增还是更新
        data_with_id = {**template_data, 'id': template_id}
        data = {'templateData': data_with_id}
        response = requests.post(f'{self.base_url}/template', json=data)
        return response.json()

    def rename_template(self, template_id: str, name: str) -> Dict[str, Any]:
        """重命名模板"""
        data = {'name': name}
        response = requests.patch(f'{self.base_url}/template/{template_id}/name', json=data)
        return response.json()

    def delete_template(self, template_id: str) -> Dict[str, Any]:
        """删除模板"""
        response = requests.delete(f'{self.base_url}/template/{template_id}')
        return response.json()

# 使用示例
client = FileUploadClient('http://localhost:3001')

# 提交反馈
result = client.submit_feedback('系统建议', '希望增加批量上传功能')

# 获取反馈列表
feedback_list = client.get_feedback_list()

# 保存新模板（本地不存在对应ID的文件）
template_data = {'id': 'my-template-001', 'name': '示例', 'config': {'theme': 'default'}}
result = client.save_or_update_template(template_data, '我的模板')

# 更新现有模板（本地存在对应ID的文件）
existing_template_data = {'id': 'my-template-001', 'name': '更新的示例', 'config': {'theme': 'dark'}}
result = client.save_or_update_template(existing_template_data, '更新的模板名称')

# 获取模板列表
template_list = client.get_template_list()
```

## 集成示例

### React 前端集成

```jsx
import React, { useState, useEffect } from 'react';

const FileManager = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const API_BASE = 'http://localhost:3001';

  const uploadFile = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      if (response.ok) {
        loadFiles(); // 重新加载文件列表
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const loadFiles = async () => {
    try {
      const response = await fetch(`${API_BASE}/files`);
      const result = await response.json();
      setFiles(result.files);
    } catch (error) {
      console.error('Load files failed:', error);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => uploadFile(e.target.files[0])}
        disabled={uploading}
      />
      {uploading && <p>上传中...</p>}
      
      <ul>
        {files.map(file => (
          <li key={file.filename}>
            <span>{file.filename}</span>
            <a href={`${API_BASE}${file.downloadUrl}`} download>下载</a>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

### Vue.js 前端集成

```vue
<template>
  <div>
    <input 
      type="file" 
      @change="uploadFile"
      :disabled="uploading"
    />
    <p v-if="uploading">上传中...</p>
    
    <ul>
      <li v-for="file in files" :key="file.filename">
        <span>{{ file.filename }}</span>
        <a :href="`${API_BASE}${file.downloadUrl}`" download>下载</a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      files: [],
      uploading: false,
      API_BASE: 'http://localhost:3001'
    };
  },
  
  async mounted() {
    await this.loadFiles();
  },
  
  methods: {
    async uploadFile(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      this.uploading = true;
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch(`${this.API_BASE}/upload`, {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          await this.loadFiles();
        }
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        this.uploading = false;
      }
    },
    
    async loadFiles() {
      try {
        const response = await fetch(`${this.API_BASE}/files`);
        const result = await response.json();
        this.files = result.files;
      } catch (error) {
        console.error('Load files failed:', error);
      }
    }
  }
};
</script>
```