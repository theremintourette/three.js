export default /* glsl */`
struct PhysicalMaterial {

	vec3 diffuseColor;
	float specularRoughness;
	vec3 specularColor;

#ifdef CLEARCOAT
	float clearcoat;
	float clearcoatRoughness;
#endif
#ifdef USE_SHEEN
	vec3 sheenColor;
#endif

};

#define MAXIMUM_SPECULAR_COEFFICIENT 0.16
#define DEFAULT_SPECULAR_COEFFICIENT 0.04

// Clear coat directional hemishperical reflectance (this approximation should be improved)
float clearcoatDHRApprox( const in float roughness, const in float dotNL ) {

	return DEFAULT_SPECULAR_COEFFICIENT + ( 1.0 - DEFAULT_SPECULAR_COEFFICIENT ) * ( pow( 1.0 - dotNL, 5.0 ) * pow( 1.0 - roughness, 2.0 ) );

}

#if NUM_RECT_AREA_LIGHTS > 0

	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {

		vec3 normal = geometry.normal;
		vec3 viewDir = geometry.viewDir;
		vec3 position = geometry.position;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.specularRoughness;

		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight; // counterclockwise; light shines in local neg z direction
		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;

		vec2 uv = LTC_Uv( normal, viewDir, roughness );

		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );

		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);

		// LTC Fresnel Approximation by Stephen Hill
		// http://blog.selfshadow.com/publications/s2016-advances/s2016_ltc_fresnel.pdf
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );

		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );

		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );

	}

#endif

/////////////////////////////////////////////////////
// Cook-Torrance based microfacet model. Different approach for Distribution and Visibility terms
// ref: https://github.com/google/filament/blob/cabdc255f5442a54884745431c7c85474dbc4b42/shaders/src/shading_model_cloth.fs#L12

vec3 BRDF_Diffuse_Cloth(const in IncidentLight incidentLight, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor) {

  float dotNL = saturate( dot( normal, incidentLight.direction ) );
	float radiance = RECIPROCAL_PI; // Lambert BRDF
	
	#if defined(SUBSURFACE)

		radiance *= saturate((dotNL + 0.5) / 2.25);

	#endif

	vec3 Fd = radiance * diffuseColor;

	return Fd;
}
/////////////////////////////////////////////

void RE_Direct_Cloth( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {

	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );

	vec3 irradiance = directLight.color;

	#ifndef PHYSICALLY_CORRECT_LIGHTS

		irradiance *= PI; // punctual light

	#endif

	reflectedLight.directSpecular += irradiance * BRDF_Specular_Sheen(
		material.specularRoughness,
		directLight.direction,
		geometry,
		material.sheenColor
	) * dotNL;
	
	reflectedLight.directDiffuse += irradiance * BRDF_Diffuse_Cloth(directLight, geometry.viewDir, geometry.normal, material.diffuseColor);

	#if defined(SUBSURFACE)

		reflectedLight.directDiffuse *= saturate(subsurfaceColor + dotNL); 

	#else

		reflectedLight.directDiffuse *= dotNL;

	#endif

}

void RE_IndirectDiffuse_Cloth( const in vec3 irradiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {

		// Not being used right now
		reflectedLight.indirectDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor ); // SH (irradiance from getLightProbeIrradiance seems to be vec3(0))

}

void RE_IndirectSpecular_Cloth( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {

	float dotNV = dot( geometry.normal, geometry.viewDir );

	float prefilteredDG = textureLod(brdfCloth, vec2( dotNV, material.specularRoughness * material.specularRoughness ), 0.0).b;
	vec3 E = material.sheenColor * prefilteredDG;
	reflectedLight.indirectSpecular += E * radiance; // BRDF * preconvolutedRadiance (radiance from getLightProbeIndirectRadiance)

	float diffuseWrapFactor = 1.0;
	#if defined(SUBSURFACE)
		diffuseWrapFactor *= saturate((dotNV + 0.5) / 2.25);
	#endif

	// Now using irradiance coming from SH
	vec3 Fd = reflectedLight.indirectDiffuse * ( 1.0 - E ) * diffuseWrapFactor;
	#if defined(SUBSURFACE)

		Fd *= saturate(subsurfaceColor + dotNV);

	#endif

	reflectedLight.indirectDiffuse = Fd; // BRDFLambert * irradiance * (1 - E) * ssWrapFactor

}

#define RE_Direct							RE_Direct_Cloth
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Cloth
#define RE_IndirectSpecular		RE_IndirectSpecular_Cloth

`;
