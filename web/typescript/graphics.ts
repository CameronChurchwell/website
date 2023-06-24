import {setupGraphicsContext} from './lib/webgl2-utils'
import {ShaderProgram} from './lib/shader-program'

const gl = setupGraphicsContext();

let basicVertexSource = require('../glsl/basic-vertex.glsl');
let basicFragmentSource = require('../glsl/basic-fragment.glsl');

let basicProgram = new ShaderProgram(basicVertexSource, basicFragmentSource);
basicProgram.createInContext(gl);

console.log('test');