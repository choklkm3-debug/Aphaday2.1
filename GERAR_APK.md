# 📱 Como Gerar APK do Aphaday

## Opção 1: Usando AppsGeyser (Recomendado - Fácil)

1. Acesse: https://www.appsgeyser.com/
2. Clique em **"Create App"**
3. Preencha os dados:
   - **App Name:** Aphaday
   - **App URL:** `http://SEU_IP:8080` (substitua SEU_IP pelo seu IP local)
   - **App Icon:** Escolha uma imagem ou use padrão
   - **Splash Screen:** Opcional
4. Clique em **"Build My App"**
5. Aguarde (2-5 minutos)
6. Baixe o APK gerado

## Opção 2: Usando Pwa2apk (Simples)

1. Acesse: https://converter.pwa2apk.com/
2. Insira a URL: `http://SEU_IP:8080`
3. Clique em **"DOWNLOAD"**
4. Pronto! APK pronto para instalar

## Opção 3: Usando Apache Cordova (Profissional)

### Pré-requisitos:
- Node.js: https://nodejs.org/
- Android Studio SDK: https://developer.android.com/studio
- Java SDK

### Passos:

```bash
# 1. Instalar Cordova globalmente
npm install -g cordova

# 2. Criar projeto Cordova
cordova create aphaday-app
cd aphaday-app

# 3. Adicionar plataforma Android
cordova platform add android

# 4. Copiar arquivos do site para www/
# (copiar index.html, app.js, style.css, etc para www/)

# 5. Compilar APK
cordova build android --release

# 6. APK gerado em:
# aphaday-app\platforms\android\app\build\outputs\apk\release\
```

## Para Instalar no Celular:

1. Ative **"Instalação de fontes desconhecidas"** nas configurações Android
2. Transfira o APK para seu celular
3. Abra o arquivo APK
4. Clique em **"Instalar"**

## Nota: Acessar pelo IP Local

Se quiser acessar via rede local do seu celular:

1. Abra prompt de comando e digite:
   ```
   ipconfig
   ```

2. Procure pelo IPv4 (ex: 192.168.1.100)

3. No celular, acesse:
   ```
   http://192.168.1.100:8080
   ```

---

**Recomendação:** Use a **Opção 1 (AppsGeyser)** - é a mais fácil! ✅
