// 片段着色器代码
#version 300 es
precision highp float;

// 从顶点着色器接收的变量
in vec2 vUV;

// 输出到屏幕的颜色
out vec4 fragColor;

// 着色器所需的uniforms
uniform float time; // 动画时间参数

void main() {
    // 计算闪烁因子，这里我们使用sin函数和时间来创建闪烁效果
    float blink = abs(sin(time));

    // 定义光环的颜色
    vec3 color = vec3(0.5, 0.8, 1.0); // 蓝色

    // 应用闪烁因子到光环颜色
    color *= blink;

    // 设置片段的最终颜色
    fragColor = vec4(color, 1.0); // 完全不透明
}