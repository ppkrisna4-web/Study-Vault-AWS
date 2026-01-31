# ✅ Checklist de Verificación - Study Vault Frontend

## 📋 Pre-Instalación

### Backend AWS (debe estar funcionando)
- [ ] Bucket S3 Input creado: `study-vault-input-dev-65a23ab0`
- [ ] Bucket S3 Output creado: `study-vault-output-dev-65a23ab0`
- [ ] Función Lambda desplegada: `study-vault-text-to-speech-dev`
- [ ] Trigger S3 → Lambda configurado
- [ ] Lambda tiene permisos para S3 y Polly
- [ ] Terraform apply completado sin errores

**Verificar con:**
```powershell
# Listar buckets
aws s3 ls

# Verificar función Lambda
aws lambda get-function --function-name study-vault-text-to-speech-dev

# Ver logs (después de una conversión)
aws logs tail /aws/lambda/study-vault-text-to-speech-dev --follow
```

---

## 🔐 Configuración AWS Credentials

### IAM User
- [ ] Usuario IAM creado con acceso programático
- [ ] Policy adjuntada (AmazonS3FullAccess o custom)
- [ ] Access Key ID copiado
- [ ] Secret Access Key copiado

### Obtener Credenciales
```powershell
# Si necesitas crear el usuario:
aws iam create-user --user-name study-vault-frontend

# Crear access key
aws iam create-access-key --user-name study-vault-frontend

# Output:
# "AccessKeyId": "AKIAIOSFODNN7EXAMPLE"
# "SecretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
```

### Configurar config.js
- [ ] Archivo `config.js` creado (copiado de `config.example.js`)
- [ ] `accessKeyId` reemplazado con tu Access Key
- [ ] `secretAccessKey` reemplazado con tu Secret Key
- [ ] Nombres de buckets verificados
- [ ] Región AWS correcta (`us-east-1` por defecto)

---

## 🌐 Configuración CORS en S3

### Input Bucket
- [ ] CORS configurado en `study-vault-input-dev-65a23ab0`
- [ ] Permite métodos: GET, PUT, POST, DELETE, HEAD
- [ ] Permite headers: *
- [ ] Permite origins: *

**Verificar con:**
```powershell
aws s3api get-bucket-cors --bucket study-vault-input-dev-65a23ab0
```

### Output Bucket
- [ ] CORS configurado en `study-vault-output-dev-65a23ab0`
- [ ] Permite métodos: GET, PUT, POST, DELETE, HEAD
- [ ] Permite headers: *
- [ ] Allows origins: *

**Verificar con:**
```powershell
aws s3api get-bucket-cors --bucket study-vault-output-dev-65a23ab0
```

### Aplicar CORS (si falta)
```powershell
# Crear cors.json:
@'
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
            "AllowedOrigins": ["*"],
            "ExposeHeaders": ["ETag"]
        }
    ]
}
'@ | Out-File -FilePath cors.json -Encoding UTF8

# Aplicar a ambos buckets
aws s3api put-bucket-cors --bucket study-vault-input-dev-65a23ab0 --cors-configuration file://cors.json
aws s3api put-bucket-cors --bucket study-vault-output-dev-65a23ab0 --cors-configuration file://cors.json
```

---

## 📂 Archivos del Frontend

### Archivos Requeridos
- [ ] `index.html` - Interfaz principal
- [ ] `styles.css` - Estilos modernos
- [ ] `app.js` - Lógica de la aplicación
- [ ] `config.js` - Configuración AWS (con credenciales)
- [ ] `config.example.js` - Ejemplo para GitHub
- [ ] `README.md` - Documentación
- [ ] `.gitignore` - Protección de credenciales

### Archivos Opcionales (Documentación)
- [ ] `GUIA_RAPIDA.md` - Guía rápida en español
- [ ] `INSTRUCCIONES_INTEGRACION.md` - Integración al proyecto
- [ ] `ARCHIVOS_EJEMPLO.md` - Ejemplos de texto para probar

**Verificar con:**
```powershell
ls frontend/
```

---

## 🚀 Iniciar el Frontend

### Opción 1: Python
```powershell
cd frontend
python -m http.server 8000
# Abrir: http://localhost:8000
```
- [ ] Servidor inició sin errores
- [ ] Puerto 8000 disponible

### Opción 2: Node.js
```powershell
npm install -g http-server
cd frontend
http-server -p 8000
```
- [ ] http-server instalado
- [ ] Servidor corriendo

### Opción 3: VS Code Live Server
- [ ] Extensión Live Server instalada
- [ ] Abrió index.html correctamente

---

## 🔍 Verificación en Navegador

### Carga Inicial
Abrir: `http://localhost:8000`

**Elementos visibles:**
- [ ] Logo "Study Vault" con icono
- [ ] Status badge en la esquina superior derecha
- [ ] Zona de upload con icono de flecha
- [ ] Sección "Converted Files" (puede estar vacía)
- [ ] Footer con links

**Consola del navegador (F12):**
- [ ] No hay errores en rojo
- [ ] Mensaje: "✅ AWS Configuration validated"
- [ ] Mensaje: "Successfully connected to AWS S3" (puede aparecer en toast)

**Status Badge:**
- [ ] Status badge muestra "AWS Connected" en verde
- [ ] Punto verde parpadeando

**Si hay errores:**
- ❌ "AWS Configuration Required" → Revisar config.js
- ❌ "Connection Failed" → Revisar credenciales AWS
- ❌ Errores de CORS → Revisar configuración S3

---

## 🧪 Prueba de Funcionalidad

### Preparar Archivo de Prueba
```powershell
# Crear archivo de prueba
@"
Este es un archivo de prueba para Study Vault.
La aplicación debería convertir este texto a audio usando Amazon Polly.
Si escuchas este mensaje, la aplicación está funcionando correctamente.
"@ | Out-File -FilePath test.txt -Encoding UTF8
```
- [ ] Archivo `test.txt` creado

### Test 1: Selección de Archivo
- [ ] Click en zona de upload abre selector de archivos
- [ ] Seleccionar `test.txt`
- [ ] Preview del archivo aparece correctamente
- [ ] Nombre del archivo mostrado
- [ ] Tamaño del archivo mostrado
- [ ] Botón "Upload & Convert" se habilita

### Test 2: Drag & Drop
- [ ] Arrastrar archivo sobre zona de upload
- [ ] Zona se ilumina (efecto hover)
- [ ] Soltar archivo carga el preview
- [ ] Preview muestra información correcta

### Test 3: Validación de Archivos
- [ ] Intentar subir archivo .pdf rechazado
- [ ] Mensaje de error: "Please select a .txt file"
- [ ] Intentar archivo >10MB rechazado (si tienes uno)

### Test 4: Upload y Conversión
- [ ] Click "Upload & Convert"
- [ ] Barra de progreso aparece
- [ ] Progreso sube de 0% a 100%
- [ ] Mensaje: "Upload Complete"
- [ ] Sección de conversión aparece con animación de ondas
- [ ] Mensaje: "Converting text to speech..."

**En AWS Console (verificar):**
```powershell
# Ver archivo en bucket input
aws s3 ls s3://study-vault-input-dev-65a23ab0/

# Debería aparecer: test.txt
```

### Test 5: Polling y Resultado
- [ ] Esperar 10-30 segundos
- [ ] Mensaje: "Conversion Complete"
- [ ] Sección de conversión desaparece
- [ ] Archivo MP3 aparece en "Converted Files"

**En AWS Console (verificar):**
```powershell
# Ver archivo en bucket output
aws s3 ls s3://study-vault-output-dev-65a23ab0/

# Debería aparecer: test.mp3
```

### Test 6: Lista de Archivos
- [ ] Archivo MP3 aparece en la lista
- [ ] Icono de audio visible
- [ ] Nombre: `test.mp3`
- [ ] Tamaño mostrado
- [ ] Fecha de conversión mostrada
- [ ] Botón "Download" visible

### Test 7: Descarga
- [ ] Click en "Download"
- [ ] Archivo comienza a descargar
- [ ] Archivo descargado correctamente
- [ ] Reproducir MP3 localmente funciona
- [ ] Audio tiene buena calidad

### Test 8: Refresh
- [ ] Click en botón de refresh (icono circular)
- [ ] Lista se recarga
- [ ] Archivos siguen apareciendo

### Test 9: Múltiples Archivos
- [ ] Subir segundo archivo
- [ ] Conversión funciona
- [ ] Ambos archivos en lista
- [ ] Ordenados por fecha (más reciente primero)

---

## 📱 Responsive Design

### Desktop (>768px)
- [ ] Layout completo visible
- [ ] Dos columnas cuando apropiado
- [ ] Todos los elementos alineados correctamente

### Tablet (~768px)
- [ ] Layout se adapta
- [ ] Elementos en una columna
- [ ] Navegación funcional

### Mobile (<768px)
- [ ] Interfaz optimizada
- [ ] Touch targets suficientemente grandes
- [ ] Texto legible
- [ ] Funcionalidad completa

**Probar con:**
```
1. Abrir DevTools (F12)
2. Toggle device toolbar
3. Probar diferentes tamaños
```

---

## 🎨 UI/UX

### Animaciones
- [ ] Logo tiene animación float
- [ ] Upload zone tiene hover effect
- [ ] Barras de onda se animan durante conversión
- [ ] Botones tienen transiciones suaves
- [ ] Toasts aparecen y desaparecen correctamente

### Interacciones
- [ ] Todos los botones responden al hover
- [ ] Cursores cambian apropiadamente
- [ ] Feedback visual en todas las acciones
- [ ] Estados de loading claros

### Toasts/Notifications
- [ ] Toast de éxito (verde) al conectar AWS
- [ ] Toast de éxito al completar upload
- [ ] Toast de éxito al completar conversión
- [ ] Toast de error si falla algo
- [ ] Toasts desaparecen después de 5 segundos

---

## 🐛 Tests de Error

### Error: Credenciales Inválidas
```javascript
// En config.js, poner credenciales incorrectas temporalmente
accessKeyId: 'INVALID'
```
- [ ] Status badge muestra "Connection Failed" (rojo)
- [ ] Toast de error aparece
- [ ] No se puede subir archivos
- [ ] Mensaje claro de error

### Error: Bucket No Existe
```javascript
// En config.js, cambiar nombre de bucket temporalmente
input: 'bucket-que-no-existe'
```
- [ ] Upload falla con mensaje de error
- [ ] Error visible en consola y en UI

### Error: CORS No Configurado
- [ ] Si CORS no está configurado, upload falla
- [ ] Error de CORS visible en consola del navegador

**Restaurar config después de probar errores**

---

## 🔒 Seguridad

### Git
- [ ] `.gitignore` incluye `config.js`
- [ ] `config.js` NO aparece en `git status`
- [ ] Solo `config.example.js` versionado

```powershell
# Verificar
git status

# NO debería aparecer config.js
# Solo config.example.js
```

### Credentials
- [ ] Credenciales AWS solo en `config.js`
- [ ] No hay credenciales en código fuente
- [ ] No hay credenciales en README o documentación

---

## 📊 Performance

### Carga Inicial
- [ ] Página carga en <2 segundos
- [ ] Fuentes cargan correctamente
- [ ] No hay elementos que bloqueen rendering

### Upload
- [ ] Archivo pequeño (<100KB) sube en <5 segundos
- [ ] Barra de progreso es precisa
- [ ] No hay lag durante el upload

### Conversión
- [ ] Polling no causa lag en UI
- [ ] Animaciones siguen fluidas
- [ ] Conversión típica: 10-30 segundos

### Lista de Archivos
- [ ] Lista con 10 archivos carga rápidamente
- [ ] Scroll es suave
- [ ] No hay retrasos al cargar

---

## 🎥 Preparación para Demo

### Antes de Grabar
- [ ] Limpia bucket output (opcional):
  ```powershell
  aws s3 rm s3://study-vault-output-dev-65a23ab0/ --recursive
  ```
- [ ] Prepara archivo de prueba profesional
- [ ] Cierra tabs innecesarios del navegador
- [ ] Ajusta zoom del navegador (100%)
- [ ] Ajusta resolución de pantalla (1920x1080 recomendado)

### Durante la Demo
- [ ] Internet estable
- [ ] Frontend funcionando correctamente
- [ ] Backend (Lambda) funcionando
- [ ] Audio de sistema habilitado (para reproducir MP3)

### Puntos a Mostrar
- [ ] Interfaz completa
- [ ] Upload de archivo (drag & drop)
- [ ] Conversión con animación
- [ ] Archivo resultante en lista
- [ ] Descarga del MP3
- [ ] Reproducción del audio

---

## ✅ Checklist Final

### Pre-Deploy
- [ ] Todos los tests pasaron
- [ ] No hay errores en consola
- [ ] UI se ve profesional
- [ ] Responsive funciona correctamente
- [ ] CORS configurado en S3
- [ ] Credenciales protegidas (.gitignore)

### Pre-Commit
- [ ] `config.js` NO incluido
- [ ] Solo `config.example.js` versionado
- [ ] README actualizado
- [ ] Screenshots capturadas (opcional)
- [ ] Demo grabado (opcional)

### Post-Deploy GitHub
- [ ] Repositorio público en GitHub
- [ ] README con instrucciones claras
- [ ] Screenshots/GIFs en README
- [ ] Link en LinkedIn actualizado
- [ ] Proyecto en portfolio

---

## 📝 Notas de Testing

```
Fecha: _________
Tester: _________

Resultados:
- Tests pasados: ___/___
- Errores encontrados: ___
- Tiempo de conversión promedio: ___ segundos
- Performance: ⭐⭐⭐⭐⭐

Observaciones:
_________________________________
_________________________________
_________________________________
```

---

## 🆘 Solución Rápida de Problemas

| Problema | Solución Rápida |
|----------|----------------|
| Status badge rojo | Revisar credenciales en config.js |
| Upload falla | Verificar CORS en S3 |
| Conversión no termina | Revisar Lambda logs en CloudWatch |
| Archivos no aparecen | Verificar permisos S3 del usuario IAM |
| Error CORS | Ejecutar comandos CORS del checklist |
| No descarga MP3 | Verificar bucket output existe y tiene archivos |

---

**¡Si todo está ✅ estás listo para producción! 🚀**
