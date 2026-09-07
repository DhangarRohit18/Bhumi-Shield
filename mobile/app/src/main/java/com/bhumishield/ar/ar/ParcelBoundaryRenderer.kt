package com.bhumishield.ar.ar

import android.opengl.GLES30
import android.opengl.Matrix
import com.bhumishield.ar.verification.BoundaryPoint
import com.bhumishield.ar.verification.BoundaryPointStatus
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import java.nio.ShortBuffer

/**
 * OpenGL ES 3.0 Renderer for Cadastral Parcel Boundary Line Loop and 3D Interactive Vertex Markers.
 */
class ParcelBoundaryRenderer {

    private var lineProgram = 0
    private var uLineMvpHandle = 0
    private var uLineColorHandle = 0
    private var aLinePositionHandle = 0

    // Vertex Pillar Mesh
    private var pillarProgram = 0
    private var uPillarMvpHandle = 0
    private var aPillarPositionHandle = 0
    private var uPillarColorHandle = 0

    private val numSlices = 10
    private val vertexMarkerHeight = 0.35f
    private val vertexMarkerRadius = 0.05f

    private lateinit var vertexBuffer: FloatBuffer
    private lateinit var indexBuffer: ShortBuffer
    private var indexCount = 0

    fun init() {
        // Shader for boundary line loop
        val lineVertexCode = """
            uniform mat4 u_MVP;
            attribute vec4 a_Position;
            void main() {
                gl_Position = u_MVP * a_Position;
            }
        """.trimIndent()

        val lineFragmentCode = """
            precision mediump float;
            uniform vec4 u_Color;
            void main() {
                gl_FragColor = u_Color;
            }
        """.trimIndent()

        lineProgram = createProgram(lineVertexCode, lineFragmentCode)
        uLineMvpHandle = GLES30.glGetUniformLocation(lineProgram, "u_MVP")
        uLineColorHandle = GLES30.glGetUniformLocation(lineProgram, "u_Color")
        aLinePositionHandle = GLES30.glGetAttribLocation(lineProgram, "a_Position")

        // Shader & mesh for 3D vertex markers
        initVertexMarkerMesh()
    }

    private fun initVertexMarkerMesh() {
        val vertices = mutableListOf<Float>()
        val indices = mutableListOf<Short>()

        for (i in 0 until numSlices) {
            val angle = (2.0 * Math.PI * i / numSlices).toFloat()
            val x = vertexMarkerRadius * Math.cos(angle.toDouble()).toFloat()
            val z = vertexMarkerRadius * Math.sin(angle.toDouble()).toFloat()

            // Bottom circle vertex
            vertices.add(x); vertices.add(0.0f); vertices.add(z)
            // Top circle vertex
            vertices.add(x); vertices.add(vertexMarkerHeight); vertices.add(z)
        }

        val topCenterIndex = (numSlices * 2).toShort()
        vertices.add(0.0f); vertices.add(vertexMarkerHeight); vertices.add(0.0f)

        for (i in 0 until numSlices) {
            val b1 = (i * 2).toShort()
            val t1 = (i * 2 + 1).toShort()
            val b2 = (((i + 1) % numSlices) * 2).toShort()
            val t2 = (((i + 1) % numSlices) * 2 + 1).toShort()

            indices.add(b1); indices.add(t1); indices.add(b2)
            indices.add(t1); indices.add(t2); indices.add(b2)
            indices.add(t1); indices.add(topCenterIndex); indices.add(t2)
        }

        indexCount = indices.size
        vertexBuffer = createFloatBuffer(vertices.toFloatArray())

        val idxArray = ShortArray(indices.size)
        for (i in indices.indices) idxArray[i] = indices[i]
        indexBuffer = ByteBuffer.allocateDirect(idxArray.size * 2)
            .order(ByteOrder.nativeOrder()).asShortBuffer()
        indexBuffer.put(idxArray)
        indexBuffer.position(0)

        val pillarVertexCode = """
            uniform mat4 u_MVP;
            attribute vec4 a_Position;
            void main() {
                gl_Position = u_MVP * a_Position;
            }
        """.trimIndent()

        val pillarFragmentCode = """
            precision mediump float;
            uniform vec4 u_Color;
            void main() {
                gl_FragColor = u_Color;
            }
        """.trimIndent()

        pillarProgram = createProgram(pillarVertexCode, pillarFragmentCode)
        uPillarMvpHandle = GLES30.glGetUniformLocation(pillarProgram, "u_MVP")
        uPillarColorHandle = GLES30.glGetUniformLocation(pillarProgram, "u_Color")
        aPillarPositionHandle = GLES30.glGetAttribLocation(pillarProgram, "a_Position")
    }

    /**
     * Renders parcel boundary line loop and interactive 3D vertex markers.
     */
    fun draw(
        arWorldVertices: FloatArray,
        boundaryPoints: List<BoundaryPoint>,
        viewMatrix: FloatArray,
        projMatrix: FloatArray
    ) {
        if (arWorldVertices.isEmpty() || arWorldVertices.size < 6) return

        val numVertices = arWorldVertices.size / 3
        val vpMatrix = FloatArray(16)
        Matrix.multiplyMM(vpMatrix, 0, projMatrix, 0, viewMatrix, 0)

        // Step 1: Draw Boundary Line Loop
        val vertexBufferLines = createFloatBuffer(arWorldVertices)
        GLES30.glUseProgram(lineProgram)
        GLES30.glUniformMatrix4fv(uLineMvpHandle, 1, false, vpMatrix, 0)
        GLES30.glUniform4f(uLineColorHandle, 0.0f, 0.90f, 1.0f, 1.0f) // Cyan line
        GLES30.glLineWidth(6.0f)

        vertexBufferLines.position(0)
        GLES30.glVertexAttribPointer(aLinePositionHandle, 3, GLES30.GL_FLOAT, false, 0, vertexBufferLines)
        GLES30.glEnableVertexAttribArray(aLinePositionHandle)
        GLES30.glDrawArrays(GLES30.GL_LINE_LOOP, 0, numVertices)
        GLES30.glDisableVertexAttribArray(aLinePositionHandle)

        // Step 2: Draw 3D Boundary Vertex Markers
        GLES30.glUseProgram(pillarProgram)
        vertexBuffer.position(0)
        GLES30.glVertexAttribPointer(aPillarPositionHandle, 3, GLES30.GL_FLOAT, false, 0, vertexBuffer)
        GLES30.glEnableVertexAttribArray(aPillarPositionHandle)

        for (i in 0 until numVertices) {
            val vx = arWorldVertices[i * 3]
            val vy = arWorldVertices[i * 3 + 1]
            val vz = arWorldVertices[i * 3 + 2]

            val modelMatrix = FloatArray(16)
            Matrix.setIdentityM(modelMatrix, 0)
            Matrix.translateM(modelMatrix, 0, vx, vy, vz)

            val mvpMatrix = FloatArray(16)
            Matrix.multiplyMM(mvpMatrix, 0, vpMatrix, 0, modelMatrix, 0)
            GLES30.glUniformMatrix4fv(uPillarMvpHandle, 1, false, mvpMatrix, 0)

            // Determine vertex color based on status
            val status = if (i < boundaryPoints.size) boundaryPoints[i].status else BoundaryPointStatus.UNVERIFIED
            val color = when (status) {
                BoundaryPointStatus.UNVERIFIED -> floatArrayOf(0.0f, 0.90f, 1.0f, 0.9f)   // Cyan
                BoundaryPointStatus.INSPECTING -> floatArrayOf(1.0f, 0.92f, 0.23f, 1.0f)  // Bright Yellow
                BoundaryPointStatus.VERIFIED -> floatArrayOf(0.30f, 0.69f, 0.31f, 1.0f)   // Vibrant Green
                BoundaryPointStatus.FLAGGED -> floatArrayOf(0.96f, 0.26f, 0.21f, 1.0f)    // Vivid Red
            }

            GLES30.glUniform4f(uPillarColorHandle, color[0], color[1], color[2], color[3])
            indexBuffer.position(0)
            GLES30.glDrawElements(GLES30.GL_TRIANGLES, indexCount, GLES30.GL_UNSIGNED_SHORT, indexBuffer)
        }

        GLES30.glDisableVertexAttribArray(aPillarPositionHandle)
    }

    companion object {
        private fun createFloatBuffer(array: FloatArray): FloatBuffer {
            val bb = ByteBuffer.allocateDirect(array.size * 4)
            bb.order(ByteOrder.nativeOrder())
            val fb = bb.asFloatBuffer()
            fb.put(array)
            fb.position(0)
            return fb
        }

        private fun loadShader(type: Int, shaderCode: String): Int {
            val shader = GLES30.glCreateShader(type)
            GLES30.glShaderSource(shader, shaderCode)
            GLES30.glCompileShader(shader)

            val compiled = IntArray(1)
            GLES30.glGetShaderiv(shader, GLES30.GL_COMPILE_STATUS, compiled, 0)
            if (compiled[0] == 0) {
                val info = GLES30.glGetShaderInfoLog(shader)
                GLES30.glDeleteShader(shader)
                throw RuntimeException("Could not compile ParcelBoundaryRenderer shader $type: $info")
            }
            return shader
        }

        private fun createProgram(vertexCode: String, fragmentCode: String): Int {
            val vertexShader = loadShader(GLES30.GL_VERTEX_SHADER, vertexCode)
            val fragmentShader = loadShader(GLES30.GL_FRAGMENT_SHADER, fragmentCode)
            val program = GLES30.glCreateProgram()
            GLES30.glAttachShader(program, vertexShader)
            GLES30.glAttachShader(program, fragmentShader)
            GLES30.glLinkProgram(program)

            val linkStatus = IntArray(1)
            GLES30.glGetProgramiv(program, GLES30.GL_LINK_STATUS, linkStatus, 0)
            if (linkStatus[0] != GLES30.GL_TRUE) {
                val info = GLES30.glGetProgramInfoLog(program)
                GLES30.glDeleteProgram(program)
                throw RuntimeException("Could not link ParcelBoundaryRenderer program: $info")
            }
            return program
        }
    }
}
