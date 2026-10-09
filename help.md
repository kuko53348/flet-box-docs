# 1. INSTALACIÓN E INICIALIZACIÓN DE CAPACITOR
npx cap init

# 2. Actualizar todo a la v8 (la última estable)
npm install @capacitor/core@latest @capacitor/cli@latest
npm install @capacitor/android@latest @capacitor/ios@latest

# 3. Ahora sí, instalar assets compatible
npm install @capacitor/assets@latest

npx cap sync
