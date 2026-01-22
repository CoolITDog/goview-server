const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const XLSX = require('xlsx');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' })); // 增加 JSON 大小限制
app.use(express.urlencoded({ limit: '50mb', extended: true })); // 增加 URL 编码大小限制
app.use(express.static('public'));

// 确保uploads、feedback和templates目录存在
const uploadsDir = path.join(__dirname, 'uploads');
const feedbackDir = path.join(__dirname, 'feedback');
const templatesDir = path.join(__dirname, 'templates');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(feedbackDir)) {
  fs.mkdirSync(feedbackDir, { recursive: true });
}

if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // 保持原文件名，添加时间戳避免重名
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}_${timestamp}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 限制文件大小为10MB
  }
});

// 路由

// 首页
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 文件上传接口
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有选择文件' });
    }

    res.json({
      message: '文件上传成功',
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      path: req.file.path
    });
  } catch (error) {
    res.status(500).json({ error: '文件上传失败: ' + error.message });
  }
});

// 多文件上传接口
app.post('/upload-multiple', upload.array('files', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '没有选择文件' });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      path: file.path
    }));

    res.json({
      message: `成功上传 ${req.files.length} 个文件`,
      files: uploadedFiles
    });
  } catch (error) {
    res.status(500).json({ error: '文件上传失败: ' + error.message });
  }
});

// 获取文件列表
app.get('/files', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir).map(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        size: stats.size,
        uploadTime: stats.mtime,
        downloadUrl: `/download/${filename}`
      };
    });

    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: '获取文件列表失败: ' + error.message });
  }
});

// 文件下载接口
app.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '文件不存在' });
    }

    // 设置响应头
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // 发送文件
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ error: '文件下载失败: ' + error.message });
  }
});

// 删除文件接口
app.delete('/delete/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '文件不存在' });
    }

    fs.unlinkSync(filePath);
    res.json({ message: '文件删除成功' });
  } catch (error) {
    res.status(500).json({ error: '文件删除失败: ' + error.message });
  }
});

// 反馈数据提交接口
app.post('/feedback', (req, res) => {
  try {
    const { title, description } = req.body;

    // 验证必填字段
    if (!title || !description) {
      return res.status(400).json({ error: '标题和描述不能为空' });
    }

    // 获取当前日期，格式：YYYYMMDD
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0');

    const excelFileName = `feedback_${dateStr}.xlsx`;
    const excelFilePath = path.join(feedbackDir, excelFileName);

    // 准备新数据
    const newData = {
      序号: '',
      标题: title,
      描述: description,
      提交时间: now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
      时间戳: now.toISOString()
    };

    let workbook;
    let worksheet;
    let existingData = [];

    // 检查Excel文件是否存在
    if (fs.existsSync(excelFilePath)) {
      // 读取现有文件
      workbook = XLSX.readFile(excelFilePath);
      const sheetName = workbook.SheetNames[0];
      worksheet = workbook.Sheets[sheetName];
      existingData = XLSX.utils.sheet_to_json(worksheet);
    } else {
      // 创建新工作簿
      workbook = XLSX.utils.book_new();
    }

    // 添加新数据到现有数据
    existingData.push(newData);

    // 更新序号
    existingData.forEach((item, index) => {
      item.序号 = index + 1;
    });

    // 创建新的工作表
    const newWorksheet = XLSX.utils.json_to_sheet(existingData);

    // 设置列宽
    const colWidths = [
      { wch: 8 },  // 序号
      { wch: 30 }, // 标题
      { wch: 50 }, // 描述
      { wch: 20 }, // 提交时间
      { wch: 25 }  // 时间戳
    ];
    newWorksheet['!cols'] = colWidths;

    // 添加或替换工作表
    const sheetName = `反馈数据_${dateStr}`;
    workbook.Sheets[sheetName] = newWorksheet;

    if (workbook.SheetNames.indexOf(sheetName) === -1) {
      workbook.SheetNames = [sheetName];
    }

    // 保存文件
    XLSX.writeFile(workbook, excelFilePath);

    res.json({
      message: '反馈提交成功',
      data: {
        title,
        description,
        submitTime: newData.提交时间,
        excelFile: excelFileName,
        recordCount: existingData.length
      }
    });

  } catch (error) {
    console.error('反馈提交失败:', error);
    res.status(500).json({ error: '反馈提交失败: ' + error.message });
  }
});

// 获取反馈数据列表接口
app.get('/feedback/list', (req, res) => {
  try {
    const files = fs.readdirSync(feedbackDir)
      .filter(file => file.startsWith('feedback_') && file.endsWith('.xlsx'))
      .map(filename => {
        const filePath = path.join(feedbackDir, filename);
        const stats = fs.statSync(filePath);

        // 从文件名提取日期
        const dateMatch = filename.match(/feedback_(\d{8})\.xlsx/);
        const dateStr = dateMatch ? dateMatch[1] : '';
        const formattedDate = dateStr ?
          `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}` : '';

        // 读取Excel文件获取记录数
        let recordCount = 0;
        try {
          const workbook = XLSX.readFile(filePath);
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(worksheet);
          recordCount = data.length;
        } catch (e) {
          console.error('读取Excel文件失败:', e);
        }

        return {
          filename,
          date: formattedDate,
          dateStr,
          recordCount,
          size: stats.size,
          createTime: stats.mtime,
          downloadUrl: `/feedback/download/${filename}`
        };
      })
      .sort((a, b) => b.dateStr.localeCompare(a.dateStr)); // 按日期倒序排列

    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: '获取反馈数据列表失败: ' + error.message });
  }
});

// 下载反馈数据接口
app.get('/feedback/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;

    // 验证文件名格式
    if (!filename.match(/^feedback_\d{8}\.xlsx$/)) {
      return res.status(400).json({ error: '无效的文件名格式' });
    }

    const filePath = path.join(feedbackDir, filename);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '文件不存在' });
    }

    // 设置响应头
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    // 发送文件
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ error: '文件下载失败: ' + error.message });
  }
});

// 查看特定日期的反馈数据接口
app.get('/feedback/view/:date', (req, res) => {
  try {
    const date = req.params.date; // 格式：YYYYMMDD

    // 验证日期格式
    if (!date.match(/^\d{8}$/)) {
      return res.status(400).json({ error: '日期格式错误，应为YYYYMMDD' });
    }

    const filename = `feedback_${date}.xlsx`;
    const filePath = path.join(feedbackDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.json({
        date: `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`,
        data: [],
        message: '该日期暂无反馈数据'
      });
    }

    // 读取Excel文件
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    res.json({
      date: `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`,
      data: data,
      recordCount: data.length
    });

  } catch (error) {
    res.status(500).json({ error: '获取反馈数据失败: ' + error.message });
  }
});

// ==================== 模板管理接口 ====================

// 保存/更新模板接口（统一接口）
app.post('/template', (req, res) => {
  try {
    const { templateData, templateName, id } = req.body;
    console.log('保存模版：', templateData, templateName, id)
    // 验证必填字段
    if (!templateData) {
      return res.status(400).json({ error: '模板数据不能为空' });
    }

    // 验证必须包含id字段（可以在外层或templateData内层）
    const templateId = id || (typeof templateData === 'object' && templateData.id);
    if (!templateId) {
      return res.status(400).json({ error: '必须提供id字段' });
    }

    // 验证JSON格式
    let parsedData;
    try {
      if (typeof templateData === 'string') {
        parsedData = JSON.parse(templateData);
      } else {
        parsedData = templateData;
      }
    } catch (e) {
      return res.status(400).json({ error: '模板数据必须是有效的JSON格式' });
    }

    // 检查数据大小（1MB限制）
    const dataSize = Buffer.byteLength(JSON.stringify(parsedData), 'utf8');
    if (dataSize > 1024 * 1024) {
      return res.status(400).json({ error: '模板数据大小不能超过1MB' });
    }

    const now = new Date();
    const fileName = `${templateId}.json`;
    const filePath = path.join(templatesDir, fileName);

    // 检查本地文件是否存在，决定是新增还是更新
    if (fs.existsSync(filePath)) {
      // 更新现有模板
      // 读取现有模板信息
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const existingTemplate = JSON.parse(fileContent);

      // 更新模板数据
      const updatedTemplate = {
        ...existingTemplate,
        name: templateName || existingTemplate.name,
        data: parsedData,
        updateTime: now.toISOString(),
        size: dataSize
      };

      // 保存文件
      fs.writeFileSync(filePath, JSON.stringify(updatedTemplate, null, 2), 'utf8');

      res.json({
        message: '模板更新成功',
        template: {
          id: updatedTemplate.id,
          name: updatedTemplate.name,
          createTime: updatedTemplate.createTime,
          updateTime: updatedTemplate.updateTime,
          size: dataSize
        },
        action: 'update'
      });

    } else {
      // 新增模板
      const dateStr = now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0') + '_' +
        now.getHours().toString().padStart(2, '0') +
        now.getMinutes().toString().padStart(2, '0') +
        now.getSeconds().toString().padStart(2, '0');

      const defaultName = templateName || `template_${dateStr}`;

      // 准备保存的数据
      const templateInfo = {
        id: templateId,
        name: defaultName,
        data: parsedData,
        createTime: now.toISOString(),
        updateTime: now.toISOString(),
        size: dataSize
      };

      // 保存文件
      fs.writeFileSync(filePath, JSON.stringify(templateInfo, null, 2), 'utf8');

      res.json({
        message: '模板保存成功',
        template: {
          id: templateId,
          name: defaultName,
          createTime: templateInfo.createTime,
          updateTime: templateInfo.updateTime,
          size: dataSize
        },
        action: 'create'
      });
    }

  } catch (error) {
    console.error('模板操作失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取模板列表接口
app.get('/template/list', (req, res) => {
  try {
    const files = fs.readdirSync(templatesDir)
      .filter(file => file.endsWith('.json'))
      .map(filename => {
        const filePath = path.join(templatesDir, filename);

        try {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const templateInfo = JSON.parse(fileContent);

          return {
            id: templateInfo.id,
            name: templateInfo.name,
            createTime: templateInfo.createTime,
            updateTime: templateInfo.updateTime,
            size: templateInfo.size
          };
        } catch (e) {
          console.error(`读取模板文件失败: ${filename}`, e);
          return null;
        }
      })
      .filter(item => item !== null)
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime)); // 按创建时间倒序

    res.json({ templates: files });
  } catch (error) {
    res.status(500).json({ error: '获取模板列表失败: ' + error.message });
  }
});

// 根据ID获取模板数据接口
app.get('/template/:id', (req, res) => {
  try {
    const templateId = req.params.id;
    const fileName = `${templateId}.json`;
    const filePath = path.join(templatesDir, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '模板不存在' });
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const templateInfo = JSON.parse(fileContent);

    res.json({
      id: templateInfo.id,
      name: templateInfo.name,
      data: templateInfo.data,
      createTime: templateInfo.createTime,
      updateTime: templateInfo.updateTime,
      size: templateInfo.size,
      release: templateInfo.release
    });

  } catch (error) {
    res.status(500).json({ error: '获取模板数据失败: ' + error.message });
  }
});

// 修改模板名称接口
app.patch('/template/:id/name', (req, res) => {
  try {
    const templateId = req.params.id;
    const { name } = req.body;
    const fileName = `${templateId}.json`;
    const filePath = path.join(templatesDir, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '模板不存在' });
    }

    // 验证必填字段
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: '模板名称不能为空' });
    }

    // 验证名称长度
    if (name.length > 100) {
      return res.status(400).json({ error: '模板名称长度不能超过100个字符' });
    }

    // 读取现有模板信息
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const templateInfo = JSON.parse(fileContent);

    // 更新模板名称
    templateInfo.name = name.trim();
    templateInfo.updateTime = new Date().toISOString();

    // 保存文件
    fs.writeFileSync(filePath, JSON.stringify(templateInfo, null, 2), 'utf8');

    res.json({
      message: '模板名称更新成功',
      template: {
        id: templateInfo.id,
        name: templateInfo.name,
        updateTime: templateInfo.updateTime
      }
    });

  } catch (error) {
    console.error('模板名称更新失败:', error);
    res.status(500).json({ error: '模板名称更新失败: ' + error.message });
  }
});

// 删除模板接口
app.delete('/template/:id', (req, res) => {
  try {
    const templateId = req.params.id;
    const fileName = `${templateId}.json`;
    const filePath = path.join(templatesDir, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '模板不存在' });
    }

    // 删除文件
    fs.unlinkSync(filePath);

    res.json({ message: '模板删除成功' });

  } catch (error) {
    res.status(500).json({ error: '模板删除失败: ' + error.message });
  }
});

// 错误处理中间件
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: '文件大小超过限制(10MB)' });
    }
  }
  res.status(500).json({ error: '服务器内部错误' });
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    environment: process.env.NODE_ENV || 'development',
    pid: process.pid
  });
});

// 服务器信息接口
app.get('/info', (req, res) => {
  const packageInfo = require('./package.json');

  res.json({
    name: packageInfo.name,
    version: packageInfo.version,
    description: packageInfo.description,
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    nodeVersion: process.version,
    pid: process.pid,
    platform: process.platform,
    arch: process.arch,
    directories: {
      uploads: uploadsDir,
      feedback: feedbackDir,
      templates: templatesDir
    },
    features: [
      '文件上传下载',
      '反馈数据管理',
      '模板数据管理',
      'PM2集群部署',
      'Excel数据导出',
      'JSON模板编辑'
    ]
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`文件上传目录: ${uploadsDir}`);
  console.log(`反馈数据目录: ${feedbackDir}`);
  console.log(`模板数据目录: ${templatesDir}`);
  console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
});