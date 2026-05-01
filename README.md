# SIG-Piscicola (Póngase Trucha)

## Propósito del Proyecto

**SIG-Piscicola** (Sistema de Información Geográfica/Gerencial - Piscícola) es una plataforma desarrollada para el proyecto *Póngase Trucha*. Su objetivo principal es proveer herramientas de gestión e información para la industria piscícola, facilitando el control, la visualización de datos y el manejo eficiente de los recursos en la cría y producción de truchas (y/u otras especies).

## Cómo Ejecutar el Proyecto

Este proyecto está construido con [Next.js](https://nextjs.org/) y puede ser ejecutado tanto localmente usando Node/npm como a través de Docker. A continuación, se detallan las instrucciones para ambos métodos.

### Opción 1: Ejecución Local (NPM)

Para ejecutar el proyecto localmente en modo desarrollo, asegúrate de tener Node.js instalado.

1. **Instalar dependencias:**
   Es crucial utilizar `npm ci` para instalar las dependencias exactas definidas en el `package-lock.json`. **JAMÁS utilices `npm install`**, ya que esto podría modificar las versiones de las dependencias y causar inconsistencias.
   ```bash
   npm ci
   ```

2. **Ejecutar el servidor de desarrollo:**
   Una vez instaladas las dependencias, levanta el entorno de desarrollo con el siguiente comando:
   ```bash
   npm run dev
   ```

3. **Acceder a la aplicación:**
   Abre tu navegador web y visita [http://localhost:3000](http://localhost:3000).

---

### Opción 2: Ejecución con Docker

Si prefieres aislar el entorno de ejecución, puedes utilizar Docker.

1. **Construir la imagen de Docker (Build):**
   Asegúrate de estar en el directorio raíz del proyecto (donde se encuentra el `Dockerfile`) y ejecuta el siguiente comando para construir la imagen. Le asignaremos el nombre `sig-piscicola`.
   ```bash
   docker build -t sig-piscicola .
   ```

2. **Ejecutar el contenedor:**
   Una vez que la imagen se haya construido correctamente, levanta un contenedor mapeando el puerto `3000` de tu máquina al puerto `3000` del contenedor:
   ```bash
   docker run -p 3000:3000 piscicola-next
   ```

3. **Acceder a la aplicación:**
   Al igual que en la ejecución local, la aplicación estará disponible en [http://localhost:3000](http://localhost:3000).
