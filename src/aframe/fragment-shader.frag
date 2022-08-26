#version 300 es
precision mediump float;
precision highp sampler2D;

#define MAX_MODELS 4
struct ModelStruct{
    bool use;
    float intensity;
    sampler2D model_texture;
    sampler2D transfer_texture;
};

in vec3 vUV;// Coordinates of the texture
in vec3 camPos;// Coordinates of the camera
out vec4 fragColor;// Final output color

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

vec4 sample_model(ModelStruct model, vec2 start_position, vec2 end_position, float ratio) {
    // Sample model texture as 3D object, alpha is initialized as the max channel
    vec4 model_sample = mix (
        texture(model.model_texture, start_position),
        texture(model.model_texture, end_position),
        ratio
    );
    model_sample.a = max(model_sample.r, max(model_sample.g, model_sample.b));
    if(model_sample.a < 0.20) model_sample.a *= 0.1;
    
    // Sample transfer texture
    return texture(
        model.transfer_texture,
        vec2(clamp(model_sample.a, 0.0, 1.0))
    );
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
            if(p_in.y>0.)discard;
        }
    }
    data_position=data_position+t_start*ray_direction;
    
    // Starting from the entry point, march the ray through the volume and sample it
    vec4 vFragColor=vec4(0);
    vec4 v_sample=vec4(0);
    float intensity=0.;
    float alpha=.5;
    for(float t=t_start;t<t_end;t+=step_size){
        // Get start position, end position, and mix factor to sample models as 3D objects
        float z_start=floor(data_position.z/(1./slices));
        float z_end=min(z_start+1.,slices-1.);
        vec2 p_start=vec2(mod(z_start,dim),dim-floor(z_start/dim)-1.);
        vec2 p_end=vec2(mod(z_end,dim),dim-floor(z_end/dim)-1.);
        vec2 start=vec2(
            data_position.x/dim+p_start.x/dim,
            data_position.y/dim+p_start.y/dim
        );
        vec2 end=vec2(
            data_position.x/dim+p_end.x/dim,
            data_position.y/dim+p_end.y/dim
        );
        float mix_position=data_position.z*slices-z_start;
        
        // Sample and mix models into a single volume
        
        int has_passed=0;
        #pragma unroll_loop_start
        for(int i=0;i<3;i++){
            if(model_structs[i].use){
                // Sample model and mix in to volume
                // m_sample.rgb the value found in the color map look up table
                // m_sample.a is the value obtained from the transfer function widget
                vec4 m_sample=sample_model(model_structs[i],start,end,mix_position);
                // Artifically increase pixel intensity
                m_sample[i]*=model_structs[i].intensity;
                // make sure the color is within transparency range.
                m_sample[i]=clamp(m_sample[i],0.,1.);
                if(has_passed==0)
                {
                    //preserve rgb value from the transfer function when rendering a single model
                    has_passed=1;
                    v_sample=m_sample;
                }else
                {
                    
                    // Do data and non linear color blending
                    // Calculate the alpha mix factor (0: Max, 1: Min, 2: Ratio)
                    if(blending==0)alpha=max(v_sample.a,m_sample.a);
                    else if(blending==1)alpha=min(v_sample.a,m_sample.a);
                    else if(blending==2){
                        // mix uses a Ratio - get ratio of the alphas
                        alpha=v_sample.a/(v_sample.a+m_sample.a);
                    }
                    
                    // Combine colors
                    // non linear interpolation of colors
                    vec3 mix_color=sqrt(v_sample.rgb*v_sample.rgb+m_sample.rgb*m_sample.rgb);
                    
                    // Result alpha value is the factor calculated by the blending mode.
                    v_sample=vec4(mix_color,alpha);
                }
            }
        }
        #pragma unroll_loop_end
        
        // Blend front to back
        vFragColor.rgb+=(1.-vFragColor.a)*v_sample.a*v_sample.rgb;
        vFragColor.a+=(1.-vFragColor.a)*v_sample.a;
        
        // Early exit if 95% opacity is reached
        if(vFragColor.a>=.95)break;
        
        // Advance point
        data_position+=ray_direction*step_size;
    }
    fragColor=vFragColor;
}
