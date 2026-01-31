# 📦 Instrucciones de Integración - Study Vault Frontend

## Cómo Agregar Este Frontend a Tu Proyecto Existente

### Estructura Actual de Tu Proyecto

```
study-vault-aws/
├── README.md
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
├── lambda/
│   ├── text_to_speech.py
│   └── function.zip
└── docs/
```

### Estructura Después de Agregar el Frontend

```
study-vault-aws/
├── README.md
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
├── lambda/
│   ├── text_to_speech.py
│   └── function.zip
├── docs/
└── frontend/                    ← NUEVA CARPETA
    ├── index.html
    ├── styles.css
    ├── app.js
    ├── config.js               ← Agregar a .gitignore
    ├── config.example.js
    ├── README.md
    ├── GUIA_RAPIDA.md
    └── .gitignore
```

---

## 🚀 Pasos de Instalación

### 1. Crear Carpeta Frontend

```powershell
# Desde la raíz de study-vault-aws/
New-Item -Path "frontend" -ItemType Directory
```

### 2. Copiar Archivos

Copia todos los archivos que descargaste a la carpeta `frontend/`:

- ✅ index.html
- ✅ styles.css
- ✅ app.js
- ✅ config.js
- ✅ config.example.js
- ✅ README.md
- ✅ GUIA_RAPIDA.md
- ✅ .gitignore

### 3. Actualizar .gitignore Principal

Edita el `.gitignore` en la raíz de tu proyecto y agrega:

```gitignore
# Frontend AWS Credentials
frontend/config.js

# Frontend dependencies (if using npm)
frontend/node_modules/
```

### 4. Configurar AWS Credentials

1. **Abre** `frontend/config.js`
2. **Edita** las siguientes líneas:

```javascript
credentials: {
    accessKeyId: 'TU_ACCESS_KEY_AQUI',     // ← Reemplaza esto
    secretAccessKey: 'TU_SECRET_KEY_AQUI'  // ← Reemplaza esto
},

buckets: {
    input: 'study-vault-input-dev-65a23ab0',   // ← Ya está correcto
    output: 'study-vault-output-dev-65a23ab0'  // ← Ya está correcto
}
```

### 5. Configurar CORS en S3

**IMPORTANTE**: Debes configurar CORS en ambos buckets S3.

#### Usando AWS Console:

1. Ve a **S3 Console**
2. Selecciona `study-vault-input-dev-65a23ab0`
3. Ve a **Permissions** → **Cross-origin resource sharing (CORS)**
4. Click **Edit** y pega:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"]
    }
]
```

5. **Repite** para `study-vault-output-dev-65a23ab0`

#### Usando AWS CLI:

```powershell
# Crea un archivo cors.json con el contenido de arriba, luego:

aws s3api put-bucket-cors --bucket study-vault-input-dev-65a23ab0 --cors-configuration file://cors.json

aws s3api put-bucket-cors --bucket study-vault-output-dev-65a23ab0 --cors-configuration file://cors.json
```

#### Usando Terraform (Recomendado):

Agrega esto a tu `terraform/main.tf`:

```hcl
# CORS configuration for input bucket
resource "aws_s3_bucket_cors_configuration" "input" {
  bucket = aws_s3_bucket.input.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
  }
}

# CORS configuration for output bucket
resource "aws_s3_bucket_cors_configuration" "output" {
  bucket = aws_s3_bucket.output.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
  }
}
```

Luego ejecuta:

```powershell
cd terraform
terraform apply
```

---

## 🧪 Probar el Frontend Localmente

### Opción 1: Python

```powershell
cd frontend
python -m http.server 8000
```

Luego abre: `http://localhost:8000`

### Opción 2: Node.js

```powershell
# Instalar http-server globalmente
npm install -g http-server

# Ejecutar
cd frontend
http-server -p 8000
```

### Opción 3: VS Code Live Server

1. Instala extensión "Live Server"
2. Abre `frontend/index.html`
3. Click derecho → "Open with Live Server"

---

## ✅ Verificación

Cuando abras el frontend, deberías ver:

1. ✅ **Status badge** en verde: "AWS Connected"
2. ✅ **Sin errores** en la consola del navegador (F12)
3. ✅ **Zona de upload** funcionando (drag & drop)
4. ✅ Si ya tienes archivos MP3, aparecen en "Converted Files"

---

## 📝 Actualizar README Principal

Agrega esta sección a tu `README.md` principal:

```markdown
## 🎨 Frontend

El proyecto incluye una interfaz web profesional para convertir archivos de texto a audio.

### Características
- Upload de archivos .txt via drag & drop
- Conversión automática a MP3 usando Amazon Polly
- Descarga de archivos de audio generados
- Interfaz moderna y responsive

### Uso
```bash
cd frontend
python -m http.server 8000
# Abrir http://localhost:8000
```

Ver `frontend/README.md` para más detalles.
```

---

## 🔐 Seguridad para GitHub

**ANTES** de hacer commit:

```powershell
# Verificar que config.js NO aparece
git status

# Si aparece, asegúrate que está en .gitignore
echo "frontend/config.js" >> .gitignore

# Agregar solo los archivos seguros
git add frontend/
git status

# Verificar que config.js NO está incluido
# Solo deberías ver config.example.js
```

---

## 📊 Estructura de Commits Recomendada

```powershell
# Commit 1: Agregar frontend files
git add frontend/
git commit -m "feat: Add professional frontend interface

- Modern UI with glassmorphism design
- AWS SDK integration for S3
- Drag & drop file upload
- Real-time conversion monitoring
- Responsive design for mobile/tablet"

# Commit 2: Update main README
git add README.md
git commit -m "docs: Update README with frontend instructions"

# Push
git push origin main
```

---

## 🎥 Grabación de Video Demo

### Preparación

1. **Limpia el bucket output** (opcional, para empezar fresco):
   ```powershell
   aws s3 rm s3://study-vault-output-dev-65a23ab0/ --recursive
   ```

2. **Prepara un archivo de texto interesante**:
   - Evita "hola mundo"
   - Usa algo profesional o creativo
   - Ejemplo: Un resumen de AWS Lambda

3. **Inicia el servidor**:
   ```powershell
   cd frontend
   python -m http.server 8000
   ```

4. **Abre en navegador**: `http://localhost:8000`

### Durante la Grabación

**Duración ideal**: 45-60 segundos

**Pasos a mostrar**:

1. **Intro** (5s): "Les presento Study Vault, una aplicación serverless..."
2. **Interfaz** (10s): Mostrar la UI completa, destacar diseño
3. **Upload** (10s): Arrastrar archivo, mostrar preview
4. **Conversión** (15s): Click "Upload & Convert", mostrar animación
5. **Resultado** (10s): Mostrar archivo en lista, descargar
6. **Arquitectura** (10s): Mencionar "AWS S3, Lambda, Polly, Terraform"
7. **Cierre** (5s): "Código en mi GitHub!"

### Herramientas de Grabación

- **Windows**: Xbox Game Bar (Win + G)
- **OBS Studio**: Gratis y profesional
- **Loom**: Fácil y con editor básico

---

## 🚀 Próximos Pasos

### Mejoras Opcionales

1. **Autenticación**: Agregar AWS Cognito
2. **Voces**: Permitir seleccionar voz de Polly
3. **Idiomas**: Soporte multi-idioma
4. **Velocidad**: Control de velocidad de lectura
5. **SSML**: Soporte para SSML tags

### Deploy en Producción

1. **S3 Static Website Hosting**:
   ```powershell
   aws s3 sync frontend/ s3://your-website-bucket/ --exclude "config.js" --exclude "*.md"
   ```

2. **CloudFront CDN**: Para mejor performance

3. **Route53**: Dominio personalizado

---

## 📚 Recursos

- [AWS SDK JavaScript Docs](https://docs.aws.amazon.com/sdk-for-javascript/)
- [S3 CORS Configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html)
- [Polly Voice List](https://docs.aws.amazon.com/polly/latest/dg/voicelist.html)

---

## ❓ Troubleshooting

### No puedo ver archivos convertidos
- Verifica CORS en S3
- Revisa permisos del usuario IAM
- Confirma que Lambda está funcionando (CloudWatch Logs)

### Error de credenciales
- Verifica Access Key ID y Secret Key
- Confirma que el usuario IAM existe
- Revisa que tenga permisos S3

### Conversión no termina
- Espera hasta 2 minutos
- Revisa Lambda logs en CloudWatch
- Verifica que el trigger S3→Lambda esté configurado

---

**¡Éxito con tu proyecto! 🎉**
