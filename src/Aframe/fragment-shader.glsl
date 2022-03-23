/*
    #version 330 core\n
	mat4 scaleMatrix(ma4 m, vec3 v){
		mat4 Result;
		Result[0] = m[0] * v[0];
		Result[1] = m[1] * v[1];
		Result[2] = m[2] * v[2];
		Result[3] = m[3];
		return Result;  
    }
*/

mat4 translate(mat4 m, vec3 v){
    mat4 Result;
    Result[3] = m[0] * v[0] + m[1] * v[1] + m[2] * v[2] + m[3];
    return Result;
}

#define FILTER_LIN 1
uniform float slice;
uniform float dim;

vec4 sampleAs3DTexture(sampler2D tex, vec3 texCoord) {

    float sliceSize = 1.0 / slice; // space of 1 slice
    float zSlice0 = floor(texCoord.z / sliceSize); //first slice
    float zSlice1 = min(zSlice0 + 1.0,slice-1.0); //second slice
    vec2 pos1 = vec2(mod(zSlice0,dim), dim - floor(zSlice0/dim) - 1.0); //texture position 1
    vec2 pos2 = vec2(mod(zSlice1,dim), dim - floor(zSlice1/dim) - 1.0); //texture position 2
    vec2 coords1 = vec2(texCoord.x / dim + pos1.x / dim, texCoord.y / dim + pos1.y / dim); //texture coords 1
    vec2 coords2 = vec2(texCoord.x / dim + pos2.x / dim, texCoord.y / dim + pos2.y / dim); //texture coords 2
    #if FILTER_LIN
      vec4 slice0Color = texture2D(tex, coords1); //texture lookup 1
      vec4 slice1Color = texture2D(tex, coords2); //texture lookup 2
      float zOffset = (texCoord.z * slice - zSlice0); //blending factor
      return mix(slice0Color,slice1Color, zOffset); //interpolated color
    #else
        return texture2D(tex, coords1);
    #endif
}

vec2 intersect_box(vec3 orig, vec3 dir, vec3 minBox, vec3 maxBox ) {
    vec3 box_min = minBox;
    vec3 box_max = maxBox;
    vec3 inv_dir = 1.0 / dir;
    vec3 tmin_tmp = (box_min - orig) * inv_dir;
    vec3 tmax_tmp = (box_max - orig) * inv_dir;
    vec3 tmin = min(tmin_tmp, tmax_tmp);
    vec3 tmax = max(tmin_tmp, tmax_tmp);
    float t0 = max(tmin.x, max(tmin.y, tmin.z));
    float t1 = min(tmax.x, min(tmax.y, tmax.z));
    return vec2(t0, t1);
}

uniform sampler2D u_data; //volume dataset
uniform mat4 clipPlane; 
uniform bool clipping;
uniform float threshold;
uniform float multiplier;
//uniform vec3 camPos;						//camera position
uniform vec3 step_size; //ray step size
uniform int channel;
uniform sampler2D  u_lut; //transferfunction
uniform bool useLut;
uniform sampler2D depth;
uniform vec2 viewport;
uniform mat4 P_inv;
uniform vec3 box_min;
uniform vec3 box_max;
uniform float intensity;
vec4 vFragColor;
varying vec3 camPos;
//precision mediump sampler3D;
varying  vec3 vUV; //3D texture coordinates form vertex shader interpolated by rasterizer
const int MAX_SAMPLES = 3000; //total samples for each ray march step

//in mat4 nClipPlane; 


void main() {
    //get the 3D texture coordinates for lookup into the volume dataset
    vec3 dataPos = vUV;
    vFragColor = vec4(0);
    //get the object space position by subracting 0.5 from the
    //3D texture coordinates. Then subtraact it from camera position
    //and normalize to get the ray marching direction
    vec3 geomDir = normalize( dataPos - camPos);

    //get the t values for the intersection with the box
    vec2 t_hit = intersect_box(camPos, geomDir,box_min,box_max);

    //first value should always be lower by definition and this case should never occur. If it does discard the fragment.
    if (t_hit.x > t_hit.y)
        discard;

    // We dont want to sample voxels behind the eye if its
    // inside the volume, so keep the starting point at or in front
    // of the eye
    if(t_hit.x < 0.0) t_hit.x = max(t_hit.x, 0.0);
    //We not know if the ray was cast from the back or the front face. (Note: For now we also render the back face only)
    //To ensure we update dataPos and t_hit to reflect a ray from entry point to exit
    dataPos = camPos + t_hit.x * geomDir;
    t_hit.y = t_hit.y-t_hit.x;
    t_hit.x = 0.0;

    //get t for the clipping plane and overwrite the entry point
    if(clipping) {
        vec4 p_in = clipPlane * vec4(dataPos + t_hit.x * geomDir, 1);
        vec4 p_out = clipPlane * vec4(dataPos + t_hit.y * geomDir, 1);
        if(p_in.y * p_out.y < 0.0 ) {
            //both points lie on different sides of the plane
            //we need to compute a new clippoint
            vec4 c_pos = clipPlane * vec4(dataPos, 1);
            vec4 c_dir = clipPlane * vec4(geomDir, 0);
            float t_clip = -c_pos.y / c_dir.y  ;
            //update either entry or exit based on which is on the clipped side
            if (p_in.y > 0.0) {
                t_hit.x = t_clip; 
            } else{
                t_hit.y = t_clip; 
            }
        } else{
            //both points lie on the same side of the plane.
            //if one of them is on the wrong side they can be clipped
            if(p_in.y > 0.0)
                discard;
        }
    }

    //Compute occlusion point in volume coordinates
    //float d = texture2D(depth, vec2(gl_FragCoord.x/viewport.x,gl_FragCoord.y/viewport.y)).r;
    //vec4 d_ndc = vec4((gl_FragCoord.x / viewport.x - 0.5) * 2.0,(gl_FragCoord.y / viewport.y - 0.5) * 2.0, (d - 0.5) * 2.0, 1.0);
    //d_ndc = P_inv * d_ndc;
    //d_ndc = d_ndc / d_ndc.w;

    //compute t_occ and check if it closer than the exit point
    //float t_occ = length(d_ndc.xyz - (dataPos - vec3(0.5)));
    //t_hit.y = min(t_hit.y, t_occ);

    //compute step size as the minimum of the stepsize
    float dt = min(step_size.x, min(step_size.y, step_size.z));

    // Step 4: Starting from the entry point, march the ray through the volume
    // and sample it
    dataPos = dataPos + t_hit.x * geomDir;
    float t = t_hit.x; 
    for (float t_ = 0.0; t_ < 1000.0; t_ += 1.0) {
        t += dt;
        if(t >=  t_hit.y)
            break;
        // data fetching from the red channel of volume texture
        vec4 smple;
        if (channel == 1){ 
            smple = sampleAs3DTexture(u_data, dataPos).rrrr;
        } else if (channel == 2){ 
            smple = sampleAs3DTexture(u_data, dataPos).gggg; 
        } else if (channel == 3){
            smple = sampleAs3DTexture(u_data, dataPos).bbbb; 
        } else if (channel == 4){ 
            smple = sampleAs3DTexture(u_data, dataPos).aaaa; 
        } else if (channel == 5){ 
            smple = sampleAs3DTexture(u_data, dataPos); 
        } else{ 
            smple = sampleAs3DTexture(u_data, dataPos);
            // as we dont have an alpha from the datasets,
            //we initialized it as the max between the 3 channels
            smple.a = max(smple.r, max(smple.g,smple.b)) ; 
            if(smple.a < 0.25) {
                smple.a = 0.1*smple.a;
            }
        }
        // artifitially increasing pixel intensity
        smple.rgb = smple.rgb*intensity;
        if(useLut) {
            //we lookup the density value in the transfer function and return the
            //appropriate color value
            smple = texture2D(u_lut, vec2(clamp(smple.a,0.0,1.0),0.5));
        }
    
        //assume alpha is the highest channel and gamma correction
        //sample.a = pow(sample.a , multiplier); \n  ///needs changing
    
        //threshold based on alpha
        //if (smple.a < 0.001) continue;
    
        //blending (front to back)
        vFragColor.rgb += (1.0 - vFragColor.a) * smple.a * smple.rgb;
        vFragColor.a += (1.0 - vFragColor.a) * smple.a;
    
        //early exit if opacity is reached
        if (vFragColor.a >= 0.95) break;
    
        //advance point
        dataPos += geomDir * dt; 

    }

    //remove fragments for correct depthbuffer
    //if (vFragColor.a == 0.0f)
    //	discard;

    gl_FragColor = vFragColor;
    //gl_FragColor = vec4(0,1,0,0);
}