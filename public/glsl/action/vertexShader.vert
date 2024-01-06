// 顶点着色器代码
#version 300 es

// 输入的顶点属性
in vec3 position;
in vec3 normal;
in vec2 uv;

// 传递到片段着色器的变量
out vec2 vUV;

// 着色器所需的uniforms
uniform mat4 modelViewProjectionMatrix;

void main() {
    vUV = uv;
    gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);
}