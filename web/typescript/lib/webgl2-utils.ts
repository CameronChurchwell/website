export function setupGraphicsContext(): WebGL2RenderingContext {
    const gl = document.querySelector('canvas')!.getContext('webgl2');
    if (!gl) {
        throw new Error("Failed to get webgl2 context");
    }
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return gl;
}