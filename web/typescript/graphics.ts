/// <reference types="@webgpu/types"/>

if (!navigator.gpu) {
    throw 'WebGPU is not supported in this browser!';
}

const shapeVertices = new Float32Array([
    0, 0, 0.5, //front top right
    -1, 0, 0.5, //front top left
    -1, 1, 0.5, //front bottom left
    0, 1, 0.5, //front bottom right
    0, 0, -0.5, //back top right
    -1, 0, -0.5, //back top left
    -1, 1, -0.5, //back bottom left
    0, 1, -0.5, //back bottom right
]);

const lineIndices = new Int16Array([
    0, 1,
    1, 2,
    2, 3,
    3, 0,
]);

const shapeLineVertices = new Float32Array([
    0, 0, 0.5, -1, 1, 0.5
])

const vertexShader = /* wgsl */`
@group(0) @binding(0) var vertexTexture: texture_2d<f32>;

@vertex
fn main(@builtin(vertex_index) idx: u32) -> @builtin(position) vec4<f32> {
    let x: vec4<f32> = textureLoad(vertexTexture, vec2(0, idx), 0);
    return x;
}
`;

const fragmentShader = /* wgsl */`
@fragment
fn main() -> @location(0) vec4<f32> {
    return vec4(1.0, 0.0, 0.0, 1.0);
}
`;

async function init(canvas: HTMLCanvasElement) {
    //Get adapter and device
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw 'Failed to get adapter!';
    }
    const device = await adapter.requestDevice();
    if (!device) {
        throw 'Failed to get device!';
    }


    //Get webgpu context and configure
    const context = canvas.getContext('webgpu') as GPUCanvasContext;
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
        device,
        format: presentationFormat,
        alphaMode: 'premultiplied',
    });

    let vertexTextureExtent: GPUExtent3D = {
        width: 1,
        height: 2
    };

    let vertexTexture = device.createTexture({
        size: vertexTextureExtent,
        format: 'r32float',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
    });
    let vertexTextureViewDesc: GPUTextureViewDescriptor = {
        format: 'r32float',
        dimension: '2d',
    };

    let vertexTextureView = vertexTexture.createView(vertexTextureViewDesc);

    //Write to texture
    let shapeLineVerticesLayout: GPUImageDataLayout = {
        bytesPerRow: 4
    }

    device.queue.writeTexture(
        {texture: vertexTexture},
        // shapeLineVertices,
        new Float32Array([1, 0]),
        shapeLineVerticesLayout,
        vertexTextureExtent
    );

    let vertexTextureBindingLayout: GPUTextureBindingLayout = {
        sampleType: 'unfilterable-float'
    }

    let bindGroupLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                texture: vertexTextureBindingLayout
            },
        ]
    });

    let bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [
            {
                binding: 0,
                resource: vertexTextureView
            },
        ]
    });

    //Create Buffers
    let vertexBuffer = device.createBuffer({
        size: shapeVertices.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true
    });
    new Float32Array(vertexBuffer.getMappedRange()).set(shapeVertices);
    vertexBuffer.unmap();

    let indexBuffer = device.createBuffer({
        size: (lineIndices.byteLength + 3) & ~3,
        usage: GPUBufferUsage.INDEX,
        mappedAtCreation: true
    });
    let indexWriter = new Int16Array(indexBuffer.getMappedRange());
    indexWriter.set(lineIndices);
    indexBuffer.unmap();

    const vertexAttributeDesc: GPUVertexAttribute = {
        shaderLocation: 0,
        offset: 0,
        format: 'float32x3'
    };
    const vertexBufferDesc: GPUVertexBufferLayout = {
        attributes: [vertexAttributeDesc],
        arrayStride: 32/8*3,
        stepMode: 'vertex'
    };

    const nextVertexAttributeDesc: GPUVertexAttribute = {
        shaderLocation: 1,
        offset: 0,
        format: 'float32x3'
    };
    const nextVertexBufferDesc: GPUVertexBufferLayout = {
        attributes: [nextVertexAttributeDesc],
        arrayStride: 32/8*3,
        stepMode: 'vertex'
    };

    //Compile shaders
    const vertexShaderModule = device.createShaderModule({code: vertexShader});
    const fragmentShaderModule = device.createShaderModule({code: fragmentShader});

    const pipelineLayoutDesc: GPUPipelineLayoutDescriptor = {
        bindGroupLayouts: [bindGroupLayout]
    }

    const pipelineLayout = device.createPipelineLayout(pipelineLayoutDesc);

    //Create pipeline
    const pipeline = device.createRenderPipeline({
        layout: pipelineLayout,
        vertex: {module: vertexShaderModule, entryPoint: 'main', buffers: [vertexBufferDesc, nextVertexBufferDesc]},
        fragment: {module: fragmentShaderModule, entryPoint: 'main', targets: [{format: presentationFormat}]},
        primitive: {topology: 'line-list'}
    });

    console.log(canvas.width, canvas.height);

    //Define frame drawing callback function
    function frameCallback() {

        const commandEncoder = device.createCommandEncoder();
        const textureView = context.getCurrentTexture().createView();

        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [
                {
                    view: textureView,
                    clearValue: {
                        r: 0.0, g: 0.0, b: 0.0, a: 0.0
                    },
                    loadOp: 'clear' as GPULoadOp,
                    storeOp: 'store' as GPUStoreOp,
                }
            ]
        }

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(pipeline);
        passEncoder.setViewport(0, 0, canvas.width, canvas.height, 0, 1);
        passEncoder.setScissorRect(0, 0, canvas.width, canvas.height);
        passEncoder.setVertexBuffer(0, vertexBuffer);
        passEncoder.setVertexBuffer(1, vertexBuffer, 32/8*3);
        passEncoder.setIndexBuffer(indexBuffer, 'uint16');
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.drawIndexed(8);
        passEncoder.end();

        device.queue.submit([commandEncoder.finish()]);

        //Recurse
        requestAnimationFrame(frameCallback);
    }

    requestAnimationFrame(frameCallback);
};


let canvas: HTMLCanvasElement | null = document.getElementById('shape-canvas') as HTMLCanvasElement;
if (!canvas) {
    throw 'Failed to retrieve canvas element'
}

init(canvas);