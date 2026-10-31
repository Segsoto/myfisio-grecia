# MyFisio Grecia

Sitio para una clínica de fisioterapia y rehabilitación en Grecia, Costa Rica. Implementado en HTML, CSS y JavaScript nativos, sin framework ni proceso de compilación. Hero fotográfico a pantalla completa, tipografía condensada y composiciones asimétricas. La paleta toma como referencia la imagen de perfil de Instagram de MyFisio: azul profundo, cian y blanco, con detalles mínimos en lima.

## Desarrollo

Servir esta carpeta con cualquier servidor estático. Por ejemplo, `npx serve .`. No abrir solamente con `file://` para verificar cabeceras y rutas correctamente.

## Estructura

- `index.html`: contenido semántico, metadatos y datos estructurados.
- `styles.css`: tokens visuales, componentes, responsive y movimiento reducido.
- `script.js`: navegación móvil, selector accesible de servicios, diálogo de privacidad y zoom fotográfico vinculado al desplazamiento.
- `assets/`: fotografías, fuente local e identidad vectorial.
- `vercel.json`: despliegue estático sin compilación.

Los enlaces de WhatsApp abren una conversación con texto preparado; el visitante decide si lo envía. La web no confirma citas ni almacena datos personales. La disponibilidad se coordina directamente con la clínica.

## Movimiento y accesibilidad

El hero, el collage y las imágenes de servicios aumentan de escala con el scroll. Una escena fotográfica permanece en pantalla mientras avanza su zoom. El desplazamiento sigue siendo nativo; no se secuestra la rueda ni el gesto táctil.

La geometría de las escenas se calcula al cambiar el layout. El scroll actualiza solamente transformaciones mediante `requestAnimationFrame`. La preferencia `prefers-reduced-motion` desactiva el movimiento y elimina la duración extra de la escena sticky, incluso si cambia durante la visita.

El selector de servicios incluye roles de pestañas, navegación con flechas, Home/End y foco visible. Sin JavaScript se muestran todos los servicios. Las imágenes incluyen dimensiones y se cargan de manera diferida salvo el hero.

## Publicación

Vercel: https://myfisio-grecia.vercel.app/

Consultar `SOURCES.md` para procedencia del contenido y recursos visuales.
