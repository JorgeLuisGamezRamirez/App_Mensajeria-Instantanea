# Aplicación de Mensajería Instantánea con WebSockets y Deep Linking

## Caso de Estudio
Desarrollar una aplicación móvil de chat que permita a los usuarios comunicarse en tiempo real mediante WebSockets, incluyendo conversaciones individuales, grupales, administración de mensajes y acceso directo a conversaciones mediante enlaces.

---

## Funcionalidades
- **Autenticación:** Registrar usuarios e iniciar sesión.
- **Directorio:** Consultar la lista de usuarios disponibles.
- **Conversaciones:** Iniciar chats individuales y crear grupos con múltiples participantes.
- **Tiempo Real:** Enviar y recibir mensajes de texto mediante WebSockets.
- **Presencia:** Mostrar estado conectado/desconectado e indicador de "escribiendo...".
- **Estados de Mensajes:** Visualización de enviando, enviado, entregado y leído (checks).
- **Archivos Adjuntos:** Enviar imágenes y archivos multimedia.
- **Edición y Eliminación:** Editar y eliminar mensajes propios.
- **Mensajes no Leídos:** Contador dinámico por conversación.
- **Reconexión Automática:** Reintentos transparentes al perder la conexión de red.

---

## Deep Linking
- Generar enlaces únicos (`https://chat.ejemplo.com/chat/12345`) para acceder a chats.
- Compartir enlaces de conversación mediante WhatsApp, correo u otras aplicaciones.
- Apertura automática del chat al seleccionar un enlace (App Links / Universal Links).
- Redirección inteligente al login si el usuario no está autenticado, continuando al chat tras identificarse.
- Manejo de error cuando el enlace sea inválido o el chat no exista.

---

## Arquitectura Técnica
- **Frontend Móvil:** React Native con Expo & TypeScript.
- **Navegación & Linking:** React Navigation Native Stack & Expo Linking.
- **WebSockets Engine:** Cliente Socket.io e integración con ciclo de vida de mensajes.
