package com.bhumishield.ar.ar

import android.opengl.GLES11Ext
import android.opengl.GLES30
import android.opengl.GLSurfaceView
import android.opengl.Matrix
import com.bhumishield.ar.util.AppLogger
import com.bhumishield.ar.verification.BoundaryPoint
import com.google.ar.core.Anchor
import com.google.ar.core.Coordinates2d
import com.google.ar.core.Frame
import com.google.ar.core.Plane
import com.google.ar.core.Session
import com.google.ar.core.TrackingState
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import java.nio.ShortBuffer
import javax.microedition.khronos.egl.EGLConfig
import javax.microedition.khronos.opengles.GL10

/**
 * OpenGL ES 3.0 Renderer for Google ARCore in Portrait Orientation.
 */
class ArGlRenderer(
    private val getSession: () -> Session?,
    private val getAnchors: () -> List<Anchor>,
    private val getCalibrationAnchor: () -> Anchor? = { null },
    private val getEngineState: () -> ArEngineState = { ArEngineState() },
    private val getVerificationPoints: () -> List<BoundaryPoint> = { emptyList() },
    private val onFrameUpdate: (Frame, Session) -> Unit
) : GLSurfaceView.Renderer {

    private var cameraTextureId = -1
    private var viewportWidth = 1
    private var viewportHeight = 1
    private var displayRotation = 0

    // Renderers
    private val backgroundRenderer = BackgroundRenderer()
    private val pillarRenderer = PillarRenderer()
    private val planeRenderer = PlaneRenderer()
    private val boundaryRenderer = ParcelBoundaryRenderer()

    fun setDisplayGeometry(rotation: Int, width: Int, height: Int) {
        displayRotation = rotation
        viewportWidth = width
        viewportHeight = height
    }

    override fun onSurfaceCreated(gl: GL10?, config: EGLConfig?) {
        GLES30.glClearColor(0.1f, 0.1f, 0.1f, 1.0f)
        GLES30.glEnable(GLES30.GL_DEPTH_TEST)
        GLES30.glEnable(GLES30.GL_BLEND)
        GLES30.glBlendFunc(GLES30.GL_SRC_ALPHA, GLES30.GL_ONE_MINUS_SRC_ALPHA)

        val textures = IntArray(1)
        GLES30.glGenTextures(1, textures, 0)
        cameraTextureId = textures[0]
        GLES30.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, cameraTextureId)
        GLES30.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES30.GL_TEXTURE_WRAP_S, GLES30.GL_CLAMP_TO_EDGE)
        GLES30.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES30.GL_TEXTURE_WRAP_T, GLES30.GL_CLAMP_TO_EDGE)
        GLES30.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES30.GL_TEXTURE_MIN_FILTER, GLES30.GL_LINEAR)
        GLES30.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES30.GL_TEXTURE_MAG_FILTER, GLES30.GL_LINEAR)

        backgroundRenderer.init()
        pillarRenderer.init()
        planeRenderer.init()
        boundaryRenderer.init()
    }

    override fun onSurfaceChanged(gl: GL10?, width: Int, height: Int) {
        viewportWidth = width
        viewportHeight = height
        GLES30.glViewport(0, 0, width, height)
    }

    override fun onDrawFrame(gl: GL10?) {
        GLES30.glClear(GLES30.GL_COLOR_BUFFER_BIT or GLES30.GL_DEPTH_BUFFER_BIT)

        val session = getSession() ?: return
        if (cameraTextureId == -1) return

        try {
            session.setDisplayGeometry(displayRotation, viewportWidth, viewportHeight)
            session.setCameraTextureName(cameraTextureId)

            val frame = session.update()
            onFrameUpdate(frame, session)

            // Draw Camera Background Quad
            backgroundRenderer.draw(frame, cameraTextureId)

            val camera = frame.camera
            if (camera.trackingState == TrackingState.TRACKING) {
                val viewMatrix = FloatArray(16)
                val projMatrix = FloatArray(16)

                camera.getViewMatrix(viewMatrix, 0)
                camera.getProjectionMatrix(projMatrix, 0, 0.1f, 100.0f)

                // Render Detected Planes
                val allPlanes = session.getAllTrackables(Plane::class.java)
                planeRenderer.draw(allPlanes, viewMatrix, projMatrix)

                // Render Phase 1 Test Pillars
                val activeAnchors = getAnchors()
                for (anchor in activeAnchors) {
                    if (anchor.trackingState == TrackingState.TRACKING) {
                        pillarRenderer.draw(anchor, viewMatrix, projMatrix)
                    }
                }

                // Render Phase 2 / Phase 3 Parcel Boundary & Vertex Markers
                val calibrationAnchor = getCalibrationAnchor()
                if (calibrationAnchor != null && calibrationAnchor.trackingState == TrackingState.TRACKING) {
                    pillarRenderer.draw(calibrationAnchor, viewMatrix, projMatrix)

                    val engineState = getEngineState()
                    val parcel = engineState.selectedParcel
                    if (parcel != null) {
                        val arWorldVertices = GeoToArTransformer.transformParcelToArWorld(
                            parcel = parcel,
                            referenceAnchor = calibrationAnchor,
                            headingOffsetDegrees = engineState.headingOffsetDegrees
                        )
                        boundaryRenderer.draw(
                            arWorldVertices = arWorldVertices,
                            boundaryPoints = getVerificationPoints(),
                            viewMatrix = viewMatrix,
                            projMatrix = projMatrix
                        )
                    }
                }
            }
        } catch (e: Exception) {
            AppLogger.e(e, "Error in ArGlRenderer onDrawFrame")
        }
    }

    private class BackgroundRenderer {
        private var program = 0
        private var aPositionHandle = 0
        private var aTexCoordHandle = 0

        private val quadCoords = floatArrayOf(
            -1.0f, -1.0f, 0.0f,
            +1.0f, -1.0f, 0.0f,
            -1.0f, +1.0f, 0.0f,
            +1.0f, +1.0f, 0.0f
        )
        private val quadVerticesBuffer: FloatBuffer = createFloatBuffer(quadCoords)
        private val transformedTexCoordsBuffer: FloatBuffer = ByteBuffer.allocateDirect(4 * 2 * 4)
            .order(ByteOrder.nativeOrder()).asFloatBuffer()

        fun init() {
            val vertexShaderCode = """
                attribute vec4 a_Position;
                attribute vec2 a_TexCoord;
                varying vec2 v_TexCoord;
                void main() {
                    gl_Position = a_Position;
                    v_TexCoord = a_TexCoord;
                }
            """.trimIndent()

            val fragmentShaderCode = """
                #extension GL_OES_EGL_image_external : require
                precision mediump float;
                varying vec2 v_TexCoord;
                uniform samplerExternalOES s_Texture;
                void main() {
                    gl_FragColor = texture2D(s_Texture, v_TexCoord);
                }
            """.trimIndent()

            program = createProgram(vertexShaderCode, fragmentShaderCode)
            aPositionHandle = GLES30.glGetAttribLocation(program, "a_Position")
            aTexCoordHandle = GLES30.glGetAttribLocation(program, "a_TexCoord")
        }

        fun draw(frame: Frame, textureId: Int) {
            frame.transformCoordinates2d(
                Coordinates2d.VIEW_NORMALIZED,
                quadCoordsBuffer,
                Coordinates2d.TEXTURE_NORMALIZED,
                transformedTexCoordsBuffer
            )

            GLES30.glDisable(GLES30.GL_DEPTH_TEST)
            GLES30.glUseProgram(program)

            GLES30.glActiveTexture(GLES30.GL_TEXTURE0)
            GLES30.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, textureId)

            quadVerticesBuffer.position(0)
            GLES30.glVertexAttribPointer(aPositionHandle, 3, GLES30.GL_FLOAT, false, 0, quadVerticesBuffer)
            GLES30.glEnableVertexAttribArray(aPositionHandle)

            transformedTexCoordsBuffer.position(0)
            GLES30.glVertexAttribPointer(aTexCoordHandle, 2, GLES30.GL_FLOAT, false, 0, transformedTexCoordsBuffer)
            GLES30.glEnableVertexAttribArray(aTexCoordHandle)

            GLES30.glDrawArrays(GLES30.GL_TRIANGLE_STRIP, 0, 4)

            GLES30.glDisableVertexAttribArray(aPositionHandle)
            GLES30.glDisableVertexAttribArray(aTexCoordHandle)
            GLES30.glEnable(GLES30.GL_DEPTH_TEST)
        }

        companion object {
            private val quadCoordsBuffer: FloatBuffer = createFloatBuffer(floatArrayOf(
                0.0f, 1.0f,
                1.0f, 1.0f,
                0.0f, 0.0f,
                1.0f, 0.0f
            ))
        }
    }

    private class PillarRenderer {
        private var program = 0
        private var uMvpHandle = 0
        private var aPositionHandle = 0
        private var aColorHandle = 0

        private val numSlices = 12
        private val pillarHeight = 0.6f
        private val pillarRadius = 0.08f

        private lateinit var vertexBuffer: FloatBuffer
        private lateinit var colorBuffer: FloatBuffer
        private lateinit var indexBuffer: ShortBuffer
        private var indexCount = 0

        fun init() {
            val vertices = mutableListOf<Float>()
            val colors = mutableListOf<Float>()
            val indices = mutableListOf<Short>()

            val greenR = 0.18f; val greenG = 0.49f; val greenB = 0.20f; val alpha = 0.95f
            val goldR = 1.0f; val goldG = 0.83f; val goldB = 0.31f

            for (i in 0 until numSlices) {
                val angle = (2.0 * Math.PI * i / numSlices).toFloat()
                val x = pillarRadius * Math.cos(angle.toDouble()).toFloat()
                val z = pillarRadius * Math.sin(angle.toDouble()).toFloat()

                vertices.add(x); vertices.add(0.0f); vertices.add(z)
                colors.add(greenR); colors.add(greenG); colors.add(greenB); colors.add(alpha)

                vertices.add(x); vertices.add(pillarHeight); vertices.add(z)
                colors.add(goldR); colors.add(goldG); colors.add(goldB); colors.add(alpha)
            }

            val topCenterIndex = (numSlices * 2).toShort()
            vertices.add(0.0f); vertices.add(pillarHeight); vertices.add(0.0f)
            colors.add(1.0f); colors.add(0.9f); colors.add(0.4f); colors.add(1.0f)

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
            colorBuffer = createFloatBuffer(colors.toFloatArray())

            val idxArray = ShortArray(indices.size)
            for (i in indices.indices) idxArray[i] = indices[i]
            indexBuffer = ByteBuffer.allocateDirect(idxArray.size * 2)
                .order(ByteOrder.nativeOrder()).asShortBuffer()
            indexBuffer.put(idxArray)
            indexBuffer.position(0)

            val vertexShaderCode = """
                uniform mat4 u_MVP;
                attribute vec4 a_Position;
                attribute vec4 a_Color;
                varying vec4 v_Color;
                void main() {
                    gl_Position = u_MVP * a_Position;
                    v_Color = a_Color;
                }
            """.trimIndent()

            val fragmentShaderCode = """
                precision mediump float;
                varying vec4 v_Color;
                void main() {
                    gl_FragColor = v_Color;
                }
            """.trimIndent()

            program = createProgram(vertexShaderCode, fragmentShaderCode)
            uMvpHandle = GLES30.glGetUniformLocation(program, "u_MVP")
            aPositionHandle = GLES30.glGetAttribLocation(program, "a_Position")
            aColorHandle = GLES30.glGetAttribLocation(program, "a_Color")
        }

        fun draw(anchor: Anchor, viewMatrix: FloatArray, projMatrix: FloatArray) {
            val modelMatrix = FloatArray(16)
            anchor.pose.toMatrix(modelMatrix, 0)

            val mvpMatrix = FloatArray(16)
            val mvMatrix = FloatArray(16)
            Matrix.multiplyMM(mvMatrix, 0, viewMatrix, 0, modelMatrix, 0)
            Matrix.multiplyMM(mvpMatrix, 0, projMatrix, 0, mvMatrix, 0)

            GLES30.glUseProgram(program)
            GLES30.glUniformMatrix4fv(uMvpHandle, 1, false, mvpMatrix, 0)

            vertexBuffer.position(0)
            GLES30.glVertexAttribPointer(aPositionHandle, 3, GLES30.GL_FLOAT, false, 0, vertexBuffer)
            GLES30.glEnableVertexAttribArray(aPositionHandle)

            colorBuffer.position(0)
            GLES30.glVertexAttribPointer(aColorHandle, 4, GLES30.GL_FLOAT, false, 0, colorBuffer)
            GLES30.glEnableVertexAttribArray(aColorHandle)

            indexBuffer.position(0)
            GLES30.glDrawElements(GLES30.GL_TRIANGLES, indexCount, GLES30.GL_UNSIGNED_SHORT, indexBuffer)

            GLES30.glDisableVertexAttribArray(aPositionHandle)
            GLES30.glDisableVertexAttribArray(aColorHandle)
        }
    }

    private class PlaneRenderer {
        private var program = 0
        private var uMvpHandle = 0
        private var aPositionHandle = 0

        fun init() {
            val vertexShaderCode = """
                uniform mat4 u_MVP;
                attribute vec4 a_Position;
                void main() {
                    gl_Position = u_MVP * a_Position;
                }
            """.trimIndent()

            val fragmentShaderCode = """
                precision mediump float;
                void main() {
                    gl_FragColor = vec4(0.1, 0.8, 0.3, 0.6);
                }
            """.trimIndent()

            program = createProgram(vertexShaderCode, fragmentShaderCode)
            uMvpHandle = GLES30.glGetUniformLocation(program, "u_MVP")
            aPositionHandle = GLES30.glGetAttribLocation(program, "a_Position")
        }

        fun draw(planes: Collection<Plane>, viewMatrix: FloatArray, projMatrix: FloatArray) {
            GLES30.glUseProgram(program)

            for (plane in planes) {
                if (plane.trackingState != TrackingState.TRACKING || plane.subsumedBy != null) continue

                val polygon = plane.polygon ?: continue
                val numPoints = polygon.limit() / 2
                if (numPoints < 3) continue

                val modelMatrix = FloatArray(16)
                plane.centerPose.toMatrix(modelMatrix, 0)

                val mvpMatrix = FloatArray(16)
                val mvMatrix = FloatArray(16)
                Matrix.multiplyMM(mvMatrix, 0, viewMatrix, 0, modelMatrix, 0)
                Matrix.multiplyMM(mvpMatrix, 0, projMatrix, 0, mvMatrix, 0)

                val planeVertices = FloatArray(numPoints * 3)
                polygon.rewind()
                for (i in 0 until numPoints) {
                    val x = polygon.get()
                    val z = polygon.get()
                    planeVertices[i * 3] = x
                    planeVertices[i * 3 + 1] = 0.0f
                    planeVertices[i * 3 + 2] = z
                }

                val vertexBuffer = createFloatBuffer(planeVertices)
                GLES30.glUniformMatrix4fv(uMvpHandle, 1, false, mvpMatrix, 0)

                vertexBuffer.position(0)
                GLES30.glVertexAttribPointer(aPositionHandle, 3, GLES30.GL_FLOAT, false, 0, vertexBuffer)
                GLES30.glEnableVertexAttribArray(aPositionHandle)

                GLES30.glDrawArrays(GLES30.GL_LINE_LOOP, 0, numPoints)

                GLES30.glDisableVertexAttribArray(aPositionHandle)
            }
        }
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
                throw RuntimeException("Could not compile shader $type: $info")
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
                throw RuntimeException("Could not link GLES program: $info")
            }
            return program
        }
    }
}
