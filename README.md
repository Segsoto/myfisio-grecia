# MyFisio Grecia

Sitio para una clínica de fisioterapia y rehabilitación en Grecia, Costa Rica. Implementado en HTML, CSS y JavaScript nativos, sin framework ni proceso de compilación. Hero fotográfico a pantalla completa, tipografía condensada y composiciones asimétricas. La paleta toma como referencia la imagen de perfil de Instagram de MyFisio: azul profundo, cian y blanco, con detalles mínimos en lima.

## Desarrollo

Servir esta carpeta con cualquier servidor estático. Por ejemplo, `npx serve .`. No abrir solamente con `file://` para verificar cabeceras y rutas correctamente.

## Estructura

- `index.html`: contenido semántico, metadatos y datos estructurados.
- `styles.css`: tokens visuales, componentes, responsive y movimiento reducido.
- `script.js`: navegación móvil, selector accesible de servicios, diálogo de privacidad y zoom fotográfico vinculado al desplazamiento.
- `demo-store.js`: agenda ficticia, validación de disponibilidad y almacenamiento local compartido entre la reserva y el panel.
- `booking.js` y `appointments.css`: formulario de reserva y componentes de la demo.
- `admin.html` y `admin.js`: panel local para confirmar, cancelar y reactivar citas de ejemplo.
- `assets/`: fotografías, fuente local e identidad vectorial.
- `vercel.json`: despliegue estático sin compilación.

Los enlaces de WhatsApp abren una conversación con texto preparado; el visitante decide si lo envía. Las reservas creadas en el formulario son simulaciones y no se envían a la clínica. Las citas reales se coordinan directamente con el negocio.

## Agenda de demostración

1. Abrir `/#reservar`, elegir servicio, fecha y hora e ingresar un nombre ficticio.
2. Apartar la cita. La demo conserva una referencia y bloquea ese horario para todos los servicios.
3. Abrir `/admin` en el mismo navegador para confirmar o cancelar la cita. Una cancelación libera el horario; reactivar una cita comprueba que siga disponible.

Los datos se guardan en `localStorage` bajo `myfisio.appointments.demo.v1`. Se conservan al recargar y se actualizan entre pestañas del mismo origen y navegador, pero no se comparten entre dispositivos ni usuarios. No existe backend, autenticación, cobro ni envío de notificaciones. El panel es público y está rotulado como demo; usar exclusivamente nombres ficticios.

La agenda propone horarios de ejemplo de lunes a sábado para los próximos 30 días, con citas de 60 minutos y una sola agenda compartida. Estos horarios no representan la disponibilidad real de MyFisio. Todas las comprobaciones de fecha y hora usan `America/Costa_Rica`.

Si el navegador bloquea el almacenamiento o no puede guardar los datos, se muestra el error y no se informa una reserva exitosa. Se requiere JavaScript para utilizar la demo.

Pruebas de la lógica, sin dependencias: `node --test tests/demo-store.test.cjs`.

La interfaz prioriza los nombres de los servicios, la información de la primera consulta y una acción de contacto consistente. No incluye emojis, numeraciones decorativas, sellos, firmas simuladas ni símbolos Unicode como iconos. Los controles de apertura y cierre utilizan formas CSS con nombres accesibles.

El header y el footer incorporan el logo real del negocio, servido localmente. El footer enlaza los perfiles verificados de Instagram y Facebook mediante sus logos SVG. El botón flotante de WhatsApp abre la conversación con la clínica; respeta las áreas seguras del móvil y se oculta al abrir el menú o el diálogo de privacidad.

## Movimiento y accesibilidad

El hero, el collage y las imágenes de servicios aumentan de escala con el scroll. Una escena fotográfica permanece en pantalla mientras avanza su zoom. El desplazamiento sigue siendo nativo; no se secuestra la rueda ni el gesto táctil.

La geometría de las escenas se calcula al cambiar el layout. El scroll actualiza solamente transformaciones mediante `requestAnimationFrame`. La preferencia `prefers-reduced-motion` desactiva el movimiento y elimina la duración extra de la escena sticky, incluso si cambia durante la visita.

El selector de servicios incluye roles de pestañas, navegación con flechas, Home/End y foco visible. Sin JavaScript se muestran todos los servicios. Las imágenes incluyen dimensiones y se cargan de manera diferida salvo el hero.

## Publicación

Vercel: https://myfisio-grecia.vercel.app/

Consultar `SOURCES.md` para procedencia del contenido y recursos visuales.
