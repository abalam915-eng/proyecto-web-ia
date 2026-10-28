# proyecto-web-ia
# Explorador Rick and Morty

Página web que consulta personajes de la serie *Rick and Morty* desde una API pública y permite buscarlos, filtrarlos y guardarlos como favoritos.

**Aplicación publicada:** https://abalam915-eng.github.io/proyecto-web-ia/
**Repositorio:** https://github.com/abalam915-eng/proyecto-web-ia

---

## Integrantes

| Nombre | Usuario de GitHub |
|---|---|
| Angel Guadalupe Balam Moo | [@abalam915-eng](https://github.com/abalam915-eng) |
| Luisa Fernanda Ortiz Baeza| [@lortizbaeza-gif](https://github.com/lortizbaeza-gif) |

---

## Descripción

La aplicación se conecta con [The Rick and Morty API](https://rickandmortyapi.com/documentation) usando `fetch()` y muestra los personajes en tarjetas con su imagen, nombre, estado, especie, género, origen y número de episodios.

Está hecha solo con **HTML**, **CSS** y **JavaScript**, sin librerías, y todo el código se escribió desde el editor web de GitHub.

### Funciones

- **Listado de personajes:** muestra 20 personajes por página, traídos en tiempo real desde la API.
- **Buscador por nombre:** busca mientras escribes (espera 400 ms para no saturar la API) o al presionar Enter.
- **Filtros:** por estado (vivo, muerto, desconocido), género y especie. Se pueden combinar con el buscador.
- **Paginación:** botones *Anterior* y *Siguiente*.
- **Favoritos:** se marcan con el botón ♡ y se guardan en `localStorage`, así que siguen ahí al cerrar el navegador.
- **Mensajes:** avisa cuando está cargando, cuando no hay resultados y cuando falla la conexión con la API.
- **Modo oscuro y claro:** botón en el encabezado; el tema elegido también se guarda en `localStorage`.
- **Diseño adaptable:** funciona en celulares y computadoras.

### Archivos

| Archivo | Contenido |
|---|---|
| `index.html` | Estructura de la página: encabezado, pestañas, buscador, filtros, resultados y favoritos. |
| `style.css` | Estilos. Todos los colores están en variables de `:root`, lo que facilitó el modo oscuro. |
| `script.js` | Lógica: consulta a la API, tarjetas, buscador, filtros, paginación, favoritos y tema. |
| `README.md` | Este documento. |

---

## Instrucciones de uso

1. Abre https://abalam915-eng.github.io/proyecto-web-ia/
2. Al entrar se cargan los primeros personajes.
3. **Buscar:** escribe un nombre en *Buscar por nombre* (por ejemplo `Rick` o `Morty`).
4. **Filtrar:** elige una opción en *Estado*, *Género* o *Especie*. Para quitar todo, presiona *Limpiar filtros*.
5. **Cambiar de página:** usa *Anterior* y *Siguiente* al final de la lista.
6. **Favoritos:** presiona *♡ Favorito* en una tarjeta. Para verlos, entra a la pestaña *Favoritos*. Para quitarlo, presiona *♥ Quitar favorito*.
7. **Modo oscuro:** presiona *🌙 Modo oscuro* en el encabezado. Presiona *☀️ Modo claro* para regresar.

---

## Uso de inteligencia artificial

Usamos **Claude** para generar código, encontrar errores y entender cómo funcionaba cada parte.

### Tres prompts importantes

**1. Revisar por qué no cargaban los personajes**
> "Contexto: proyecto escolar 'Explorador Rick and Morty' (HTML, CSS y JavaScript puro). script.js se subió en 3 commits seguidos pegando partes una debajo de otra. Problema: la página no carga los personajes al abrir ni al buscar. Pide leer el repo en modo lectura, NO modificar archivos. Necesito que: 1. Revise si script.js quedó completo y en orden. 2. Revise que los id de index.html coincidan con los de document.getElementById en script.js. 3. Me diga la causa exacta y las líneas a cambiar."

**2. Error de la API al combinar filtros**
> "Y esto? [captura con el mensaje 'No se pudo conectar con la API' al filtrar Género: Desconocido y Especie: Enfermedad]"
> Y después: "el de la API que no responde aún me aparece, incluso si el link se lo mando a mi cel ahí igual aparece."

**3. Implementar el reto del modo oscuro**
> "Modo oscuro, pero yo debo de ver la mayor parte, tú solo guíame." Y después: "dame lo que necesito para hacer ese issue paso a paso, si hay código dámelo y lo pego en la línea correspondiente."

### Una respuesta de la IA que requirió correcciones

Cuando mostramos el error *"No se pudo conectar con la API"*, la IA probó el mismo filtro, le funcionó y concluyó que había sido **una falla momentánea de la red o de la API**. Nos recomendó solo recargar con Ctrl+Shift+R.

Eso no era correcto: el error seguía apareciendo, también en el celular. Se lo dijimos a la IA y entonces hizo una prueba más completa: probó las 220 combinaciones de filtros y midió cuántas peticiones soportaba la API. Así encontró la causa real (la explicamos en la siguiente sección).

Aprendimos que la primera respuesta de la IA no siempre es la correcta y que hay que comprobar si de verdad resuelve el problema.

### Un error encontrado y cómo lo resolvimos

**Error:** al cambiar varios filtros seguidos aparecía el mensaje rojo *"No se pudo conectar con la API"* y no se mostraba ningún personaje. En la consola del navegador (F12 → Console) salía:

```
Error al consultar la API: TypeError: Failed to fetch
```

**Causa:** la Rick and Morty API tiene un **límite de peticiones**. Después de unas 35 peticiones seguidas bloquea durante unos 10 segundos. Cada vez que cambiábamos un filtro se hacían **21 peticiones**: 1 para los datos y 20 para las imágenes de las tarjetas, que también vienen de `rickandmortyapi.com`. Con solo dos cambios de filtro se pasaba el límite. Cuando la API bloquea, el navegador no puede leer la respuesta, así que `fetch()` lanza un error y el código entraba al `catch`.

**Solución:** en `script.js` agregamos un **reintento automático**. Si la consulta falla, la página muestra *"La API recibió muchas consultas seguidas. Reintentando en 10 segundos..."* y vuelve a intentarlo una sola vez. Solo si el reintento también falla aparece el mensaje rojo de error de conexión.

```js
async function fetchCharacters(retried = false) {
  // ...
  } catch (error) {
    // ...
    if (!retried) {
      showMessage("La API recibió muchas consultas seguidas. Reintentando en 10 segundos...", "info");
      setTimeout(() => {
        if (requestId === lastRequestId) fetchCharacters(true);
      }, 10000);
      return;
    }
    // ... mensaje de error
  }
}
```

- `retried = false`: la primera vez vale `false`; en el reintento se llama con `true`, así nunca reintenta más de una vez.
- `requestId === lastRequestId`: si el usuario hizo otra búsqueda durante esos 10 segundos, no se reintenta la búsqueda vieja.

### Una modificación realizada al código que podemos explicar: modo oscuro

Es nuestro **reto de modificación**. Se hizo en la rama `modo-oscuro` y se incorporó a `main` con un **Pull Request**, que cerró el Issue #1.

**CSS (`style.css`).** Todos los colores de la página salen de variables (`--bg`, `--surface`, `--text`, etc.). Agregamos un bloque que les da otros valores cuando la etiqueta `<html>` tiene el atributo `data-theme="dark"`:

```css
[data-theme="dark"] {
  --bg: #0d1b1e;
  --surface: #16282c;
  --text: #e6f0e0;
  /* ... */
}
```

Como el resto del CSS ya usaba esas variables, no tuvimos que cambiar nada más.

**HTML (`index.html`).** Un botón en el encabezado:

```html
<button type="button" id="theme-btn" class="btn theme-btn">🌙 Modo oscuro</button>
```

**JavaScript (`script.js`).** Dos funciones:

- `applyTheme(theme)`: pone `data-theme` en `<html>` y cambia el texto del botón.
- `initTheme()`: al abrir la página lee de `localStorage` el tema guardado (si no hay ninguno, usa el claro) y lo aplica. Además, al hacer clic en el botón cambia entre `"dark"` y `"light"` y guarda la elección.

Así funciona igual que los favoritos: lo que elige el usuario se guarda en `localStorage` y se mantiene al recargar.

### Reflexión sobre lo aprendido usando IA

Con esta actividad nos dimos cuenta de que crear una aplicación sin un editor de código y apoyándonos solo en la IA suele ser complicado. Si únicamente dependemos de la IA para hacer un trabajo, terminaremos entregando productos mediocres. Por eso, como programadores y diseñadores de software, debemos usar la IA como una herramienta y no como algo que resuelva los problemas por completo.

Lo comprobamos con el error de la API: la primera respuesta de la IA fue que se trataba de una falla momentánea, y solo cuando insistimos y revisamos la consola del navegador encontramos la causa real. También notamos que la IA da mejores respuestas cuando le explicamos bien el contexto, y que pedirle que nos guiara, en lugar de solo copiar código, nos ayudó a entender cómo funciona cada parte del proyecto.

---

## Dificultades

- **Error de conexión con la API:** era el límite de peticiones; se resolvió con el reintento automático (explicado arriba).
- **Editar en la rama equivocada:** al hacer el modo oscuro, una vez íbamos a guardar un cambio en `main` en lugar de la rama `modo-oscuro`. Aprendimos a revisar el selector de rama antes de cada commit.
- **Subir `script.js` por partes:** el archivo se armó en varios commits pegando un bloque debajo de otro, y hubo que comprobar que quedara completo y en orden.
- **Trabajar solo desde el navegador:** sin editor de código instalado, todo se escribió desde la interfaz web de GitHub.

---

## Trabajo en GitHub

- **Commits:** cada integrante hizo commits identificables (estructura HTML, estilos, conexión con la API, buscador y filtros, favoritos, reintento de la API, modo oscuro).
- **Issues:**
  - #1 *Agregar modo oscuro* (cerrado por el Pull Request).
  - #2 *Mostrar detalles al hacer clic en una tarjeta* (mejora pendiente a futuro).
- **Pull Request:** #3 *Modo oscuro y claro*, de la rama `modo-oscuro` a `main`.
- **GitHub Pages:** publicado desde la rama `main`.

---

Datos proporcionados por [The Rick and Morty API](https://rickandmortyapi.com).
