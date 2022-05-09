# version 300 es
precision mediump float;


in vec3 vUV;        // Coordinates of the texture
in vec3 camPos;     // Coordinates of the camera
out vec4 fragColor; // Final output color 

uniform vec3 clip_min;       // Clip minimum
uniform vec3 clip_max;       // Clip maximum
uniform int blending;
uniform bool clipping;     
uniform mat4 clip_plane;
uniform float dim;
uniform float intensity;
uniform float slices;       // Number of slicess in the volumes
uniform float step_size;    // Ray step size

uniform sampler2D model_texture;    // Texture of the model
uniform sampler2D transfer_texture; // Texture of the colorMap/transferFunction

/**
    Shader code for the VR Volume Viewer
    t_:     Translation vector
    p_:     Position vector
*/

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

// Starting from the entry point, march the ray through the volume and sample it
vec4 create_model(float t_start, float t_end, vec3 data_position, vec3 ray_direction) {
    vec4 vFragColor = vec4(0, 0, 0, 0);

    // Loop from t_start to t_end by step_size
    for(float t = t_start; t < t_end; t += step_size) {
        vec4 volumeSample = sampleAs3DTexture(model_texture, data_position);

        // Initialize alpha as the max between the 3 channels
        // volumeSample .r .g and .b are all the same exact values. Don't know what .a is supposed to be
        volumeSample.a = max(volumeSample.r, max(volumeSample.g, volumeSample.b));

        // Artificially increase pixel intensity
        volumeSample.rgb = volumeSample.rgb * intensity;
        
        // Apply color map / transfer function
        volumeSample = texture(transfer_texture, vec2(clamp(volumeSample.a, 0.0, 1.0), 0.5));

        // Blending (front to back)
        vFragColor.rgb += (1.0 - vFragColor.a) * volumeSample.a * volumeSample.rgb;
        vFragColor.a += (1.0 - vFragColor.a) * volumeSample.a;

        // Early exit if 95% opacity is reached
        if (vFragColor.a >= 0.95) break;

        // Advance point
        data_position += ray_direction * step_size;
    }
    return vFragColor;
}

void main() {
    // Get the 3D texture coordinates for lookup into the volume dataset
    vec3 data_position = vUV;
    vec4 vFragColor = vec4(0);

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
    if(clipping) {
        vec4 p_in = clip_plane * vec4(data_position + t_start * ray_direction, 1);
        vec4 p_out = clip_plane * vec4(data_position + t_end * ray_direction, 1);
        if(p_in.y * p_out.y < 0.0 ) {
            // Both points lie on different sides of the plane, need a new clip point
            vec4 c_pos = clip_plane * vec4(data_position, 1);
            vec4 c_dir = clip_plane * vec4(ray_direction, 0);
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

    fragColor = create_model(t_start, t_end, data_position, ray_direction);;
}