export class ShaderProgram {
    vertex: string;
    fragment: string;
    program!: WebGLProgram;

    constructor(vertex: string, fragment: string) {
        this.vertex = vertex;
        this.fragment = fragment;
    }

    createInContext(gl: WebGL2RenderingContext, transformFeedbackVaryingNames?: string[]) {
        // let program = createProgram(gl, this.vertex, this.fragment);
        //create shaders
        const vertex = gl.createShader(gl.VERTEX_SHADER);
        const fragment = gl.createShader(gl.FRAGMENT_SHADER);

        if (!vertex || !fragment) {
            throw new Error("Failed to laod shaders");
            
        }

        //add sources
        gl.shaderSource(vertex, this.vertex);
        gl.shaderSource(fragment, this.fragment);

        //compile
        gl.compileShader(vertex);
        gl.compileShader(fragment);

        //create program
        const program = gl.createProgram();

        if (!program) {
            throw new Error("Failed to create shader program");
            
        }

        //attach shaders to program
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);

        //transform feedback
        if (transformFeedbackVaryingNames) {
            gl.transformFeedbackVaryings(
                program,
                transformFeedbackVaryingNames,
                gl.SEPARATE_ATTRIBS
            );
        }

        //link program
        gl.linkProgram(program);

        if (!program) {
            throw 'Failed to create program!';
        }
        this.program = program;
        return program;
    }

    useWithContext(gl: WebGL2RenderingContext) {
        gl.useProgram(this.program);
    }

    getAttributeLocationInContext(gl: WebGL2RenderingContext, attribute: string) {
        let location = gl.getAttribLocation(this.program, attribute);
        if (location < 0) {
            //TODO have a way to tell which program? or is call stack sufficient?
            throw new Error(`Failed to get location of ${attribute} in shader!`);
        }
        return location;
    }
    
    getUniformLocationInContext(gl: WebGL2RenderingContext, uniform: string) {
        let location = gl.getUniformLocation(this.program, uniform);
        if (!location) {
            //TODO have a way to tell which program? or is call stack sufficient?
            throw new Error(`Failed to get location of ${uniform} in shader!`);
        }
        return location;
    }
}
