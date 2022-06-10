# version 300 es
precision mediump float;
precision highp sampler2D;

#define MAX_MODELS 4
struct ModelStruct {
    bool use;
    float intensity;
    sampler2D model_texture;
    sampler2D transfer_texture;
};

in vec3 vUV;        // Coordinates of the texture
in vec3 camPos;     // Coordinates of the camera
out vec4 fragColor; // Final output color 

uniform bool apply_vr_clip;
uniform int blending;
uniform vec3 clip_min;
uniform vec3 clip_max;
uniform float dim;
uniform ModelStruct model_structs[MAX_MODELS];
uniform float slices;
uniform float step_size;
uniform mat4 vr_clip_matrix;

/**
    Shader code for the VR Volume Viewer
    t_:     Translation vector
    p_:     Position vector
    m_:     Data for an individual model
    v_:     Data for the entire volume
*/

// Clip the volume between clip_min and clip_max
vec2 intersectBox(vec3 camera, vec3 direction, vec3 clip_min, vec3 clip_max ) {
    vec3 direction_inverse = 1.0 / direction;
    vec3 bmin_direction = (clip_min - camera) * direction_inverse;
    vec3 bmax_direction = (clip_max - camera) * direction_inverse;
    vec3 tmin = min(bmin_direction, bmax_direction);
    vec3 tmax = max(bmin_direction, bmax_direction);
    float t_start = max(tmin.x, max(tmin.y, tmin.z));
    float t_end = min(tmax.x, min(tmax.y, tmax.z));
    return vec2(t_start, t_end);
}

// Sample model texture as 3D object
vec4 sampleAs3DTexture(sampler2D tex, vec3 coordinates) {
    float z_start = floor(coordinates.z / (1.0 / slices));
    float z_end = min(z_start + 1.0, slices - 1.0);
    vec2 p_start = vec2(mod(z_start, dim), dim - floor(z_start / dim) - 1.0);
    vec2 p_end = vec2(mod(z_end, dim), dim - floor(z_end / dim) - 1.0);
    vec2 coordinates_start = vec2(
        coordinates.x / dim + p_start.x / dim, 
        coordinates.y / dim + p_start.y / dim
    );
    vec2 coordinates_end = vec2(
        coordinates.x / dim + p_end.x / dim,
        coordinates.y / dim + p_end.y / dim
    );

    // Apply linear interpolation between start and end coordinates
    return mix (
        texture(tex, coordinates_start),
        texture(tex, coordinates_end),
        (coordinates.z * slices - z_start)
    );
}

vec4 sample_model(ModelStruct model, vec3 data_position) {
    // Sample model, alpha is initialized as the max of the 3 channels
    vec4 model_sample = sampleAs3DTexture(model.model_texture, data_position);
    model_sample.a = max(model_sample.r, max(model_sample.g, model_sample.b));
    if(model_sample.a < 0.25) model_sample.a *= 0.1;

    // Sample transfer texture
    model_sample = texture(
        model.transfer_texture, 
        vec2(clamp(model_sample.a, 0.0, 1.0), 0.5)
    );

    // // Artificially increase pixel intensity
    // model_sample.rgb *= model.intensity;
    return model_sample;
}

void main() {
    // Get the 3D texture coordinates for lookup into the volume dataset
    vec3 data_position = vUV;

    // Direction the ray is marching in
    vec3 ray_direction = normalize(data_position - camPos);

    // Get the t values for the intersection with the clipping values
    vec2 t_hit = intersectBox(camPos, ray_direction, clip_min, clip_max);
    float t_start = t_hit.x;
    float t_end = t_hit.y;

    /*
        We dont want to sample voxels behind the eye if its inside the volume, 
        so keep the starting point at or in front of the eye
    */
    t_start = max(t_start, 0.0);

    /*
        We don't know if the ray was cast from the back or the front face. To ensure we 
        update data_position and t_hit to reflect a ray from entry point to exit 
        We're shifting the clipping box to [0.0, end - start]
        (Note: We only render the back face)
    */
    data_position = camPos + t_start * ray_direction;
    t_end = t_end - t_start;
    t_start = 0.0;

    // Get t for the clipping plane and overwrite the entry point
    // This only occurs when grabbing volume in a VR headset
    if(apply_vr_clip) {
        vec4 p_in = vr_clip_matrix * vec4(data_position + t_start * ray_direction, 1);
        vec4 p_out = vr_clip_matrix * vec4(data_position + t_end * ray_direction, 1);
        if(p_in.y * p_out.y < 0.0 ) {
            // Both points lie on different sides of the plane, need a new clip point
            vec4 c_pos = vr_clip_matrix * vec4(data_position, 1);
            vec4 c_dir = vr_clip_matrix * vec4(ray_direction, 0);
            float t_clip = -c_pos.y / c_dir.y;
    
            // Update either entry or exit based on which is on the clipped side
            if (p_in.y > 0.0) t_start = t_clip; 
            else t_end = t_clip; 
        } else {
            /*
                Both points lie on the same side of the plane, if one of them is 
                on the wrong side they can be clipped
            */
            if(p_in.y > 0.0) discard;
        }
    }
    data_position = data_position + t_start * ray_direction;

    // Starting from the entry point, march the ray through the volume and sample it
    vec4 vFragColor = vec4(0);
    vec4 v_sample;
    float intensity = 0.0;
    for(float t = t_start; t < t_end; t += step_size) {
        if(model_structs[0].use) {
            v_sample = sample_model(model_structs[0], data_position);

            // Blending.None -> use first model
            if(blending != 0) {
                #pragma unroll_loop_start
                for(int i = 1; i < 4; i++) {
                    if(model_structs[i].use) {
                        vec4 m_sample = sample_model(model_structs[i], data_position);
                        
                        // Final intensity is the maximum given to the models
                        intensity = max(model_structs[i].intensity, intensity);

                        // Calculate mix factor
                        float mix_factor = 0.5;
                        if(blending == 1) {
                            // Blending.Max
                            mix_factor = max(v_sample.a, m_sample.a);
                        } else if (blending == 2) {
                            // Blending.Average
                            // mix uses a percentage - get ratio of the alphas
                            mix_factor = v_sample.a / (v_sample.a + m_sample.a);
                        }

                        v_sample = mix(v_sample, m_sample, mix_factor);
                    }
                }
                #pragma unroll_loop_end
            }
        } else break; // No models in use, leave transparent

        // Artifically increase pixel intensity
        v_sample.rgb *= intensity;

        // Blend front to back
        vFragColor.rgb += (1.0 - vFragColor.a) * v_sample.a * v_sample.rgb;
        vFragColor.a += (1.0 - vFragColor.a) * v_sample.a;

        // Early exit if 95% opacity is reached
        if (vFragColor.a >= 0.95) break;

        // Advance point
        data_position += ray_direction * step_size;
    }
    fragColor = vFragColor;
}