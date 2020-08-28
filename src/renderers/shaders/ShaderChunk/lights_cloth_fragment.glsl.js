export default /* glsl */`
PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;

vec3 dxy = max( abs( dFdx( geometryNormal ) ), abs( dFdy( geometryNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );

material.specularRoughness = max( roughnessFactor, 0.0525 );// 0.0525 corresponds to the base mip of a 256 cubemap.
material.specularRoughness += geometryRoughness;
material.specularRoughness = min( material.specularRoughness, 1.0 );

material.specularColor = vec3( DEFAULT_SPECULAR_COEFFICIENT );

material.sheenColor = sqrt( diffuseColor.rgb );

#ifdef USE_SHEEN

	material.sheenColor = sheen;

#endif

`;
